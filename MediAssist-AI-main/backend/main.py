import shutil
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from openai import OpenAI
from pathlib import Path
from PIL import Image
import pytesseract
import os
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
from datetime import datetime

from database import SessionLocal, create_db_and_tables, Submission, User
from auth import get_current_user, create_session_token, invalidate_session, get_db
import ai_integration
import tts_generator

# Load environment variables
load_dotenv()

# This line explicitly sets the path to your Tesseract executable.
pytesseract.pytesseract.tesseract_cmd = r'C:\Users\Pranav\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'

# Initialize OpenAI client with error handling
openai_api_key = os.getenv('OPENAI_API_KEY')
if openai_api_key and openai_api_key != 'your_actual_openai_api_key_here':
    client = OpenAI(api_key=openai_api_key)
else:
    client = None
    print("Warning: OpenAI API key not configured. AI features will be limited.")

UPLOAD_DIRECTORY = Path("./uploads")
UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)

# Create the database file and tables on startup
create_db_and_tables()

app = FastAPI(title="MediAssist AI Backend", description="AI-powered medical assistant API", version="1.0.0")

# Configure CORS with explicit settings
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Accept", "Accept-Language", "Content-Language", "Content-Type", "Authorization"],
)

# Pydantic models for authentication and API responses
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    user_type: str = "patient"  # 'patient' or 'doctor'

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    user_type: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    user: UserOut
    session_token: str
    message: str

# Pydantic models for the API response
class SubmissionOut(BaseModel):
    id: int
    user_id: int
    type: str
    transcribed_text: Optional[str] = None
    doctor_summary: Optional[str] = None
    extracted_text: Optional[str] = None
    patient_instructions: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class SubmissionsList(BaseModel):
    submissions: List[SubmissionOut]

# Dependency to get a database session for each request
# Note: We're removing this since it's now imported from auth.py
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the MediAssistAI Backend!"}

@app.get("/test-cors")
def test_cors():
    """Test endpoint to verify CORS is working"""
    return {"message": "CORS is working!", "status": "success"}

@app.post("/register", response_model=UserOut)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    print(f"Registration attempt - Username: {user_data.username}, Email: {user_data.email}, Type: {user_data.user_type}")
    
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        print(f"Username {user_data.username} already exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        print(f"Email {user_data.email} already exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        user_type=user_data.user_type
    )
    new_user.set_password(user_data.password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@app.post("/login", response_model=LoginResponse)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    """Login user and create session"""
    print(f"Login attempt - Username: {login_data.username}")
    
    # Find user by username
    user = db.query(User).filter(User.username == login_data.username).first()
    
    if not user:
        print(f"User {login_data.username} not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.check_password(login_data.password):
        print(f"Invalid password for user {login_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create session token
    session_token = create_session_token(user.id, db)  # type: ignore[arg-type]
    
    return {
        "user": user,
        "session_token": session_token,
        "message": "Login successful"
    }

@app.post("/logout")
def logout_user(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Logout user and invalidate session"""
    # Note: We would need the token from the request to invalidate it
    # For now, we'll just return a success message
    return {"message": "Logout successful"}

@app.get("/me", response_model=UserOut)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@app.post("/submit_audio")
async def submit_audio(file: UploadFile, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not file.filename:
        return {"error": "No filename provided"}
    
    file_path = UPLOAD_DIRECTORY / file.filename
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        return {"error": f"Failed to save audio file: {e}"}

    transcribed_text = ""
    try:
        if client is None:
            transcribed_text = "Transcription unavailable - OpenAI API key not configured."
        else:
            with open(file_path, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language="en"
                )
                transcribed_text = transcription.text
    except Exception as e:
        print(f"Whisper API Error: {e}")
        transcribed_text = "Transcription failed."

    doctor_summary = ""
    try:
        if client is None:
            doctor_summary = "Summary unavailable - OpenAI API key not configured."
        else:
            prompt = f"""
            You are a medical assistant AI. Summarize the following patient-reported symptoms into a single, concise sentence for a doctor.

            Patient symptoms:
            "{transcribed_text}"

            Doctor summary:
            """
            chat_completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            doctor_summary = chat_completion.choices[0].message.content
    except Exception as e:
        print(f"GPT API Error: {e}")
        doctor_summary = "Summary generation failed."

    new_submission = Submission(
        user_id=current_user.id,  # Associate with current user
        type='audio',
        transcribed_text=transcribed_text,
        doctor_summary=doctor_summary
    )
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    try:
        file_path.unlink()
    except Exception as e:
        print(f"Failed to delete temp file: {e}")

    return {
        "message": "Processing complete.",
        "transcribed_text": transcribed_text,
        "doctor_summary": doctor_summary,
        "submission_id": new_submission.id
    }

@app.post("/submit_prescription")
async def submit_prescription(file: UploadFile, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not file.filename:
        return {"error": "No filename provided"}
    
    file_path = UPLOAD_DIRECTORY / file.filename
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        return {"error": f"Failed to save prescription image: {e}"}

    # Use the integrated AI processing
    try:
        patient_instructions = ai_integration.process_prescription(str(file_path))
    except Exception as e:
        print(f"AI Processing Error: {e}")
        patient_instructions = "Prescription processing failed."
    
    # Extract text for display purposes
    extracted_text = ""
    try:
        image = Image.open(file_path)
        extracted_text = pytesseract.image_to_string(image)
    except Exception as e:
        print(f"OCR Error: {e}")
        extracted_text = "OCR failed."
    
    new_submission = Submission(
        user_id=current_user.id,  # Associate with current user
        type='prescription',
        extracted_text=extracted_text,
        patient_instructions=patient_instructions
    )
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    try:
        file_path.unlink()
    except Exception as e:
        print(f"Failed to delete temp file: {e}")

    return {
        "message": "Prescription processed successfully.",
        "extracted_text": extracted_text,
        "patient_instructions": patient_instructions,
        "submission_id": new_submission.id
    }

@app.get("/get_result", response_model=SubmissionsList)
def get_results(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get submissions for the current user only"""
    user_submissions = db.query(Submission).filter(Submission.user_id == current_user.id).all()
    return {"submissions": user_submissions}

@app.get("/get_all_results", response_model=SubmissionsList)
def get_all_results(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all submissions (only for doctors)"""
    if current_user.user_type != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access all submissions"
        )
    
    all_submissions = db.query(Submission).all()
    return {"submissions": all_submissions}

@app.put("/approve/{submission_id}")
def approve_submission(submission_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Approve a submission (only doctors can approve)"""
    if current_user.user_type != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can approve submissions"
        )
    
    submission = db.query(Submission).filter(Submission.id == submission_id).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    submission.status = "approved"  # type: ignore[assignment]

    try:
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    return {"message": f"Submission {submission_id} has been approved.", "new_status": submission.status}

class AudioRequest(BaseModel):
    text: str
    language: str = "en"

@app.post("/generate_audio")
async def generate_audio_instructions(request: AudioRequest):
    """Generate TTS audio for patient instructions"""
    try:
        # Create a unique filename
        import uuid
        filename = f"instruction_{uuid.uuid4().hex}.mp3"
        file_path = UPLOAD_DIRECTORY / filename
        
        # Generate TTS audio
        tts_generator.generate_tts(request.text, str(file_path), request.language)
        
        # Return the file path for the frontend to access
        return {
            "message": "Audio generated successfully",
            "audio_file": filename,
            "file_path": f"/uploads/{filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {e}")

@app.get("/uploads/{filename}")
async def get_audio_file(filename: str):
    """Serve generated audio files"""
    file_path = UPLOAD_DIRECTORY / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(file_path, media_type="audio/mpeg", headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "*"
    })