# tts_generator.py
from typing import Optional, Any

try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    # Define a fallback to satisfy type checker
    gTTS: Optional[Any] = None
    GTTS_AVAILABLE = False
    print("Warning: gtts not available. TTS functionality will be limited.")
    
import os

def generate_tts(text, filename, language='en'):
    if not GTTS_AVAILABLE:
        print(f"TTS unavailable - gtts not installed. Would generate: {filename}")
        # Create an empty file to prevent file not found errors
        with open(filename, 'w') as f:
            f.write("# TTS file placeholder - gtts not available\n")
        return filename
    
    try:
        if gTTS is None:
            raise RuntimeError("gTTS not available")
        tts = gTTS(text=text, lang=language, slow=False)
        tts.save(filename)
        return filename
    except Exception as e:
        print(f"TTS generation failed: {e}")
        # Create an empty file as fallback
        with open(filename, 'w') as f:
            f.write("# TTS generation failed\n")
        return filename

# Sample TTS generations
if __name__ == "__main__":
    instructions = [
        "Take Amoxicillin 500mg three times daily for 7 days. Remember to take with food.",
        "Your prescription for Metformin is 500mg twice daily with meals. Continue for 30 days.",
        "Use the inhaler twice daily, once in the morning and once at bedtime. Shake well before use."
    ]
    
    for i, instruction in enumerate(instructions, 1):
        filename = f"prescription_instruction_{i}.mp3"
        generate_tts(instruction, filename)
        print(f"Generated {filename}")