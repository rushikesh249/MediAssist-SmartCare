# MediAssist AI Integration

This document describes the integration of AI-related files into the MediAssist backend and frontend.

## Files Integrated

### Backend Integration
- `ai_integration.py` - Main AI processing module
- `ocr_pipeline.py` - OCR text extraction from prescription images
- `rule_based_extractor.py` - Fallback rule-based medication extraction
- `tts_generator.py` - Text-to-speech audio generation

### Frontend Integration
- `speechToText.js` - Converted to React hook `use-speech-to-text.ts`
- Created `use-api.ts` hook for backend communication

## Backend Changes

### 1. File Structure
```
Mediassist backend/
├── ai_integration.py
├── ocr_pipeline.py
├── rule_based_extractor.py
├── tts_generator.py
├── main.py (updated)
├── database.py
└── requirements.txt (updated)
```

### 2. Updated Dependencies
Added to `requirements.txt`:
- `gtts==2.5.1` - For text-to-speech functionality

### 3. New API Endpoints
- `POST /generate_audio` - Generate TTS audio for instructions
- `GET /uploads/{filename}` - Serve generated audio files

### 4. Refactored Main.py
- Integrated AI modules instead of inline processing
- Uses `ai_integration.process_prescription()` for prescription processing
- Added TTS endpoint for audio generation

## Frontend Changes

### 1. New Hooks
- `hooks/use-speech-to-text.ts` - Speech recognition functionality
- `hooks/use-api.ts` - API communication with backend

### 2. Updated Pages
- `app/patient/page.tsx` - Real speech-to-text and file upload
- `app/doctor/page.tsx` - Real prescription processing and API integration

### 3. Features Added
- Real-time speech recognition
- File upload for audio and prescription images
- Audio playback for TTS-generated instructions
- Real API data integration

## Environment Configuration

Create a `.env.local` file in the frontend directory:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running the Application

### Backend
```bash
cd "Mediassist backend"
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd mediassist-ai
npm install
npm run dev
```

## API Endpoints

### Patient Endpoints
- `POST /submit_audio` - Submit audio file for transcription
- `POST /submit_prescription` - Submit prescription image for processing
- `POST /generate_audio` - Generate TTS audio from text

### Doctor Endpoints
- `GET /get_result` - Get all submissions
- `PUT /approve/{submission_id}` - Approve a submission

## Features

### Patient Features
1. **Voice Recording**: Real-time speech-to-text using browser APIs
2. **File Upload**: Upload audio files or prescription images
3. **AI Processing**: Automatic transcription and prescription simplification
4. **Audio Playback**: Listen to TTS-generated instructions

### Doctor Features
1. **Submission Queue**: View all patient submissions
2. **Prescription Upload**: Upload and process prescription images
3. **AI Summary**: View AI-generated summaries of patient symptoms
4. **Approval System**: Review and approve patient instructions

## AI Processing Pipeline

1. **Audio Processing**:
   - Upload audio file
   - Transcribe using OpenAI Whisper
   - Generate doctor summary using GPT

2. **Prescription Processing**:
   - Upload prescription image
   - Extract text using OCR (Tesseract)
   - Process with AI integration module
   - Generate simplified patient instructions
   - Create TTS audio for instructions

## Error Handling

- Graceful fallback to rule-based extraction if AI fails
- Error states in UI for failed operations
- Loading states for better user experience

## Browser Compatibility

- Speech recognition requires modern browsers with Web Speech API support
- File uploads work in all modern browsers
- Audio playback uses standard HTML5 Audio API
