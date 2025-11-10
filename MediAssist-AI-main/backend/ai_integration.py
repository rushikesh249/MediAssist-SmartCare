# ai_integration.py
import rule_based_extractor as fallback
import ocr_pipeline as ocr
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def process_prescription(image_path):
    # Step 1: Extract text from image
    extracted_text = ocr.extract_text(image_path)
    
    # Step 2: Try to use GPT for processing
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a medical assistant that converts prescription text into simple patient instructions."},
                {"role": "user", "content": f"Convert this prescription into three simple patient instructions covering dosage, timing, and precautions: {extracted_text}"}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        # Fallback to rule-based extraction
        print(f"GPT processing failed: {e}. Using fallback extraction.")
        extracted_info = fallback.extract_medication_info(extracted_text)
        instructions = fallback.format_patient_instructions(extracted_info)
        return "\n".join(instructions)

def process_symptoms(transcript):
    # Similar implementation for symptom processing
    pass