# ocr_pipeline.py
import cv2
import pytesseract
import numpy as np
import re

def preprocess_image(image_path):
    # Read image
    img = cv2.imread(image_path)
    
    # Check if image was loaded successfully
    if img is None:
        raise ValueError(f"Could not load image from path: {image_path}")
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply threshold to get binary image
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    
    # Optional: Deskew image
    coords = np.column_stack(np.where(thresh > 0))
    angle = cv2.minAreaRect(coords)[-1]
    
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
        
    (h, w) = img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(thresh, M, (w, h), 
                            flags=cv2.INTER_CUBIC, 
                            borderMode=cv2.BORDER_REPLICATE)
    
    return rotated

def extract_text(image_path):
    processed_img = preprocess_image(image_path)
    
    # OCR using Tesseract
    custom_config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(processed_img, config=custom_config)
    
    return clean_ocr_text(text)

def clean_ocr_text(text):
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Common prescription cleaning patterns
    patterns_to_remove = [
        r'Page \d+ of \d+',
        r'Rx\s*:?\s*',
        r'Prescription\s*:?\s*',
        r'Dr\.\s*[\w\s]+?:\s*'
    ]
    
    for pattern in patterns_to_remove:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    
    return text.strip()

# Test with sample prescriptions
if __name__ == "__main__":
    sample_prescriptions = [
        'samples/prescription1.jpg',
        'samples/prescription2.jpg',
        'samples/prescription3.jpg',
        'samples/prescription4.jpg',
        'samples/prescription5.jpg'
    ]
    
    for prescription in sample_prescriptions:
        try:
            text = extract_text(prescription)
            print(f"Extracted text from {prescription}:")
            print(text)
            print("\n" + "="*50 + "\n")
        except Exception as e:
            print(f"Error processing {prescription}: {str(e)}")