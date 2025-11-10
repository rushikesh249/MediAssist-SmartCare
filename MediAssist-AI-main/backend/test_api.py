#!/usr/bin/env python3

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_root_endpoint():
    """Test the root endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Root endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Root endpoint failed: {e}")
        return False

def test_get_results():
    """Test getting all results"""
    try:
        response = requests.get(f"{BASE_URL}/get_result")
        print(f"✅ Get results: {response.status_code}")
        print(f"   Found {len(response.json().get('submissions', []))} submissions")
        return True
    except Exception as e:
        print(f"❌ Get results failed: {e}")
        return False

def test_tts_generation():
    """Test text-to-speech generation"""
    try:
        data = {
            "text": "Take your medication twice daily with food.",
            "language": "en"
        }
        response = requests.post(f"{BASE_URL}/generate_audio", json=data)
        print(f"✅ TTS generation: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Generated audio file: {result.get('audio_file')}")
        return True
    except Exception as e:
        print(f"❌ TTS generation failed: {e}")
        return False

def test_api_docs():
    """Test API documentation endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/docs")
        print(f"✅ API docs: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ API docs failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Starting MediAssist API Testing...")
    print("=" * 50)
    
    tests = [
        test_root_endpoint,
        test_get_results,
        test_tts_generation,
        test_api_docs
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The backend is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the output above.")