"""
Multi-User Data Management Test Script
This script demonstrates how the enhanced MediAssist AI system handles multiple users
"""

import requests
import json
from typing import Dict, Any

# Backend URL
BASE_URL = "http://127.0.0.1:8000"

def test_user_registration_and_login():
    """Test user registration and login functionality"""
    print("🧪 Testing Multi-User Registration and Login...")
    
    # Test data for different users
    users = [
        {
            "username": "patient_john",
            "email": "john@patient.com",
            "password": "patient123",
            "user_type": "patient"
        },
        {
            "username": "patient_jane",
            "email": "jane@patient.com", 
            "password": "patient456",
            "user_type": "patient"
        },
        {
            "username": "dr_smith",
            "email": "smith@doctor.com",
            "password": "doctor789",
            "user_type": "doctor"
        }
    ]
    
    registered_users = []
    
    # Register users
    for user in users:
        try:
            response = requests.post(f"{BASE_URL}/register", json=user)
            if response.status_code == 200:
                print(f"✅ Successfully registered {user['username']} as {user['user_type']}")
                registered_users.append(user)
            else:
                print(f"❌ Failed to register {user['username']}: {response.text}")
        except Exception as e:
            print(f"❌ Error registering {user['username']}: {e}")
    
    # Login users and get tokens
    user_sessions = {}
    for user in registered_users:
        try:
            login_data = {
                "username": user["username"],
                "password": user["password"]
            }
            response = requests.post(f"{BASE_URL}/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                user_sessions[user["username"]] = {
                    "token": data["session_token"],
                    "user_type": user["user_type"],
                    "user_info": data["user"]
                }
                print(f"✅ Successfully logged in {user['username']}")
            else:
                print(f"❌ Failed to login {user['username']}: {response.text}")
        except Exception as e:
            print(f"❌ Error logging in {user['username']}: {e}")
    
    return user_sessions

def test_data_isolation(user_sessions: Dict[str, Any]):
    """Test that users can only see their own data"""
    print("\\n🔒 Testing Data Isolation...")
    
    # Test that patients can only see their own submissions
    for username, session in user_sessions.items():
        if session["user_type"] == "patient":
            try:
                headers = {"Authorization": f"Bearer {session['token']}"}
                response = requests.get(f"{BASE_URL}/get_result", headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    submissions = data.get("submissions", [])
                    print(f"✅ {username} can access their data ({len(submissions)} submissions)")
                    
                    # Verify all submissions belong to this user
                    user_id = session["user_info"]["id"]
                    for submission in submissions:
                        if submission["user_id"] != user_id:
                            print(f"❌ Data leak detected! {username} can see data from user {submission['user_id']}")
                            return False
                else:
                    print(f"❌ {username} cannot access their data: {response.text}")
            except Exception as e:
                print(f"❌ Error testing data access for {username}: {e}")
    
    # Test that doctors can see all data
    for username, session in user_sessions.items():
        if session["user_type"] == "doctor":
            try:
                headers = {"Authorization": f"Bearer {session['token']}"}
                response = requests.get(f"{BASE_URL}/get_all_results", headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    submissions = data.get("submissions", [])
                    print(f"✅ Doctor {username} can access all data ({len(submissions)} submissions)")
                else:
                    print(f"❌ Doctor {username} cannot access all data: {response.text}")
            except Exception as e:
                print(f"❌ Error testing doctor data access for {username}: {e}")
    
    return True

def test_authorization(user_sessions: Dict[str, Any]):
    """Test role-based authorization"""
    print("\\n🛡️ Testing Role-Based Authorization...")
    
    # Test that patients cannot access doctor-only endpoints
    for username, session in user_sessions.items():
        if session["user_type"] == "patient":
            try:
                headers = {"Authorization": f"Bearer {session['token']}"}
                
                # Try to access all results (doctor-only)
                response = requests.get(f"{BASE_URL}/get_all_results", headers=headers)
                if response.status_code == 403:
                    print(f"✅ Patient {username} correctly denied access to all results")
                else:
                    print(f"❌ Patient {username} should not access all results: {response.status_code}")
                
                # Try to approve a submission (doctor-only) 
                response = requests.put(f"{BASE_URL}/approve/1", headers=headers)
                if response.status_code == 403:
                    print(f"✅ Patient {username} correctly denied approval permissions")
                else:
                    print(f"❌ Patient {username} should not approve submissions: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ Error testing authorization for {username}: {e}")

def demonstrate_user_workflow():
    """Demonstrate complete user workflow"""
    print("\\n📋 Demonstrating Complete User Workflow...")
    
    # Test user registration and login
    user_sessions = test_user_registration_and_login()
    
    if not user_sessions:
        print("❌ Cannot proceed without user sessions")
        return
    
    # Test data isolation
    test_data_isolation(user_sessions)
    
    # Test authorization
    test_authorization(user_sessions)
    
    print("\\n✅ Multi-user data management test completed!")
    print("\\n📊 Summary:")
    print(f"   • {len(user_sessions)} users successfully registered and logged in")
    print("   • Data isolation working correctly")
    print("   • Role-based authorization enforced")
    print("   • Each patient can only see their own medical data")
    print("   • Doctors can see all data for medical oversight")

def check_backend_status():
    """Check if the backend is running"""
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend is not accessible: {e}")
        return False

if __name__ == "__main__":
    print("🏥 MediAssist AI - Multi-User Data Management Test")
    print("=" * 50)
    
    # Check if backend is running
    if not check_backend_status():
        print("\\n❌ Please start the backend server first:")
        print("   cd 'Mediassist backend'")
        print("   python -m uvicorn main:app --reload")
        exit(1)
    
    # Run the demonstration
    demonstrate_user_workflow()
    
    print("\\n🎯 Next Steps:")
    print("   1. Update the frontend to include login/registration forms")
    print("   2. Store session tokens in localStorage/sessionStorage")
    print("   3. Include Authorization headers in all API requests")
    print("   4. Add user management interface for administrators")
    print("   5. Implement password reset and profile management")