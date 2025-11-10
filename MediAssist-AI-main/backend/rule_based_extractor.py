# rule_based_extractor.py
import re

def extract_medication_info(text):
    # Common medication patterns
    patterns = {
        'medication_name': r'([A-Z][a-z]+)(?:\s+\d+[mgMG]+)?',
        'dosage': r'(\d+\s*[mgMG]+\s*(?:tablet|cap|mg|mL|gram|g))',
        'frequency': r'(\d+\s*times?\s*(?:a|\/)\s*day|daily|every\s*\d+\s*hours?|BID|TID|QID)',
        'duration': r'(?:for|x)\s*(\d+\s*(?:days|weeks|months))'
    }
    
    extracted_info = {}
    
    for key, pattern in patterns.items():
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            extracted_info[key] = matches[0] if len(matches) == 1 else matches
    
    # Specialized extraction for common formats
    # Pattern: Medication Name Strength: Instructions
    detailed_pattern = r'([A-Za-z\s]+)\s*(\d+\s*[mgMG]+)?\s*[:\\-]\s*([^\.]+)'
    detailed_matches = re.findall(detailed_pattern, text)
    
    if detailed_matches:
        extracted_info['detailed'] = []
        for match in detailed_matches:
            med_name, strength, instructions = match
            extracted_info['detailed'].append({
                'medication': med_name.strip(),
                'strength': strength.strip() if strength else 'N/A',
                'instructions': instructions.strip()
            })
    
    return extracted_info

def format_patient_instructions(extracted_info):
    instructions = []
    
    if 'detailed' in extracted_info:
        for med in extracted_info['detailed']:
            instruction = f"Take {med['medication']}"
            if med['strength'] != 'N/A':
                instruction += f" ({med['strength']})"
            instruction += f" as directed: {med['instructions']}"
            instructions.append(instruction)
    else:
        if 'medication_name' in extracted_info:
            instructions.append(f"Medication: {extracted_info['medication_name']}")
        if 'dosage' in extracted_info:
            instructions.append(f"Dosage: {extracted_info['dosage']}")
        if 'frequency' in extracted_info:
            instructions.append(f"Frequency: {extracted_info['frequency']}")
        if 'duration' in extracted_info:
            instructions.append(f"Duration: {extracted_info['duration']}")
    
    return instructions

# Test function
if __name__ == "__main__":
    test_prescriptions = [
        "Amoxicillin 500mg: Take 1 tablet three times daily for 7 days",
        "Lipitor 20mg - 1 tablet daily at bedtime",
        "Rx: Metformin 500mg BID with meals"
    ]
    
    for i, prescription in enumerate(test_prescriptions, 1):
        print(f"Prescription {i}: {prescription}")
        extracted = extract_medication_info(prescription)
        instructions = format_patient_instructions(extracted)
        print("Extracted instructions:")
        for instruction in instructions:
            print(f" - {instruction}")
        print()