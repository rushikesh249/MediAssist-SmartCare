#!/usr/bin/env python3

print("Testing imports...")

try:
    import fastapi
    print(f"✓ FastAPI {fastapi.__version__} imported successfully")
except ImportError as e:
    print(f"✗ FastAPI import failed: {e}")
    print("Solution: Run 'pip install fastapi'")

try:
    from fastapi.middleware.cors import CORSMiddleware
    print("✓ CORSMiddleware imported successfully")
except ImportError as e:
    print(f"✗ CORSMiddleware import failed: {e}")
    print("Solution: CORS is included with FastAPI, install FastAPI first")

try:
    import uvicorn
    print(f"✓ Uvicorn imported successfully")
except ImportError as e:
    print(f"✗ Uvicorn import failed: {e}")
    print("Solution: Run 'pip install uvicorn'")

print("\nImport test completed.")
print("\nIf all imports succeeded, your FastAPI setup is correct.")
print("If imports failed, run: pip install fastapi uvicorn")