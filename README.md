# MedAssist AI 🏥

A comprehensive AI-powered medical assistant system that helps patients and doctors manage medical information efficiently. The system features audio transcription, prescription processing, and intelligent medical data analysis.

##  Features

### For Patients
- **🎤 Voice-to-Text**: Record symptoms and get automatic transcription
- **💊 Prescription Processing**: Upload prescription images for intelligent parsing
- **📱 Mobile-Friendly Interface**: Responsive design for all devices
- **🔊 Audio Instructions**: Text-to-speech for patient instructions

### For Doctors
- **📋 Patient Management**: View and manage patient submissions
- **✅ Approval System**: Review and approve patient submissions
- **📊 Analytics Dashboard**: Comprehensive statistics and insights
- **🔍 Advanced Search**: Filter and search patient data

### AI-Powered Features
- **🤖 OpenAI Integration**: GPT-4 powered symptom analysis
- **🎯 Whisper Transcription**: Accurate speech-to-text conversion
- **📝 Intelligent Summarization**: AI-generated doctor summaries
- **💬 Natural Language Processing**: Smart prescription interpretation

## 🏗️ Architecture

```
MedAssist AI/
├── 🖥️ Backend (Python/FastAPI)
│   ├── Authentication & Authorization
│   ├── AI Integration (OpenAI)
│   ├── Database Management (SQLite)
│   └── API Endpoints
├── 🌐 Frontend (HTML/CSS/JavaScript)
│   ├── Patient Portal
│   ├── Doctor Dashboard
│   ├── Analytics Interface
│   └── Authentication UI
└── 🤖 AI Services
    ├── Speech-to-Text (Whisper)
    ├── Text Analysis (GPT-4)
    └── Text-to-Speech (TTS)
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- OpenAI API Key
- Tesseract OCR (for prescription processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/medassist-ai.git
   cd medassist-ai
   ```

2. **Backend Setup**
   ```bash
   cd "Mediassist backend"
   pip install -r requirements.txt
   ```

3. **Environment Configuration**
   ```bash
   # Create .env file in backend directory
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   ```

4. **Start the System**
   ```bash
   # Option 1: Use startup script (Windows)
   ./start_mediassist.bat
   
   # Option 2: Use bash script
   ./mediassist.sh
   
   # Option 3: Manual startup
   # Terminal 1 - Backend
   cd "Mediassist backend"
   python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
   
   # Terminal 2 - Frontend
   cd "frontend-simple"
   python -m http.server 3000 --bind 127.0.0.1
   ```

5. **Access the Application**
   - Frontend: http://127.0.0.1:3000
   - Backend API: http://127.0.0.1:8000
   - API Documentation: http://127.0.0.1:8000/docs

## 👥 User Accounts

### Default Test Accounts
- **Patient**: `pranav` / `newpassword123`
- **Doctor**: `doctor` / `doctor123`

### Creating New Accounts
Register new accounts through the frontend interface with unique usernames and email addresses.

## 🔧 Configuration

### Required Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Tesseract OCR Setup
Download and install Tesseract OCR from: https://github.com/UB-Mannheim/tesseract/wiki

## 📚 API Documentation

### Authentication Endpoints
- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /logout` - User logout
- `GET /me` - Current user info

### Medical Data Endpoints
- `POST /submit_audio` - Audio symptom submission
- `POST /submit_prescription` - Prescription image upload
- `GET /get_result` - User's submissions
- `GET /get_all_results` - All submissions (doctors only)
- `PUT /approve/{submission_id}` - Approve submission (doctors only)

### Utility Endpoints
- `POST /generate_audio` - Text-to-speech generation
- `GET /uploads/{filename}` - Audio file retrieval

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Database engine
- **OpenAI API** - AI processing
- **Tesseract OCR** - Image text extraction
- **python-multipart** - File upload handling

### Frontend
- **HTML5/CSS3** - Modern web standards
- **JavaScript ES6+** - Interactive functionality
- **Bootstrap 5** - Responsive UI framework
- **Font Awesome** - Icon library

### AI Services
- **OpenAI GPT-4** - Text analysis and summarization
- **Whisper** - Speech-to-text transcription
- **TTS** - Text-to-speech synthesis

## 🔒 Security Features

- **Bearer Token Authentication** - Secure session management
- **Password Hashing** - PBKDF2 with salt
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Pydantic model validation
- **Environment Variables** - Secure configuration management

## 📊 Database Schema

### Users Table
- Authentication and user management
- Role-based access (patient/doctor)
- Session tracking

### Submissions Table
- Medical data storage
- User-specific data isolation
- Approval workflow support

### User Sessions Table
- Secure session management
- Token expiration handling
- Multi-device support

## 🧪 Testing

### Run Authentication Tests
```bash
cd "Mediassist backend"
python debug_auth.py
```

### Reset User Passwords
```bash
python reset_password.py
```

## 📝 Development Notes

### Adding New Features
1. Backend API endpoints in `main.py`
2. Frontend integration in respective HTML/JS files
3. Database schema updates in `database.py`
4. AI processing in `ai_integration.py`

### Debugging
- Authentication logs available in backend console
- Frontend errors visible in browser console
- API documentation at `/docs` endpoint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for providing excellent AI APIs
- FastAPI team for the amazing web framework
- Bootstrap team for the responsive UI components
- Tesseract OCR for text extraction capabilities

## 📞 Support

For support, email support@medassist.ai or open an issue on GitHub.

---

Made with ❤️ by the MedAssist AI Team
