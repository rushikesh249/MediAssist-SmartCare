# Multi-User Data Management Solution for MediAssist AI

## Overview

This document explains how the MediAssist AI system handles multi-user data storage, authentication, and privacy protection in a production-ready manner.

## Key Features

### 1. User Authentication & Authorization
- **User Registration**: Secure user creation with password hashing
- **Login System**: Session-based authentication with JWT-like tokens
- **Role-Based Access**: Separate permissions for patients and doctors
- **Session Management**: Secure session tokens with expiration

### 2. Data Isolation & Privacy
- **User-Specific Data**: Each user can only access their own medical data
- **Doctor Override**: Doctors can view all submissions for medical oversight
- **Secure Storage**: Passwords are hashed using PBKDF2 with salt
- **Session Security**: Tokens expire after 24 hours and can be invalidated

### 3. Database Schema

#### Users Table
```sql
- id (Primary Key)
- username (Unique)
- email (Unique)
- password_hash (Hashed with salt)
- user_type ('patient' or 'doctor')
- created_at
- is_active
```

#### Submissions Table
```sql
- id (Primary Key)
- user_id (Foreign Key to Users)
- type ('audio' or 'prescription')
- transcribed_text
- doctor_summary
- extracted_text
- patient_instructions
- status
- created_at
- updated_at
```

#### User Sessions Table
```sql
- id (Primary Key)
- user_id (Foreign Key to Users)
- session_token (Unique)
- created_at
- expires_at
- is_active
```

## API Endpoints

### Authentication Endpoints

#### POST /register
Register a new user (patient or doctor)
```json
{
    "username": "john_patient",
    "email": "john@example.com",
    "password": "secure_password",
    "user_type": "patient"
}
```

#### POST /login
Login and receive session token
```json
{
    "username": "john_patient",
    "password": "secure_password"
}
```

#### POST /logout
Logout and invalidate session

#### GET /me
Get current user information

### Data Access Endpoints

#### GET /get_result
- **Patient**: Returns only their own submissions
- **Doctor**: Same as patient (their own data)

#### GET /get_all_results
- **Patient**: Access denied (403 Forbidden)
- **Doctor**: Returns all submissions from all patients

#### PUT /approve/{submission_id}
- **Patient**: Access denied (403 Forbidden)
- **Doctor**: Can approve any submission

## Security Features

### 1. Password Security
- Passwords are hashed using PBKDF2 with SHA-256
- Each password uses a unique 32-byte salt
- 100,000 iterations for enhanced security

### 2. Session Security
- Session tokens are cryptographically secure random strings
- Tokens expire after 24 hours
- Invalid/expired tokens are automatically rejected
- Sessions can be manually invalidated on logout

### 3. Data Isolation
- Database queries automatically filter by user_id
- No user can access another user's data without proper authorization
- Role-based access control prevents unauthorized operations

## Frontend Integration Requirements

### 1. Authentication Flow
```javascript
// Register
const registerResponse = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        username: 'patient123',
        email: 'patient@example.com',
        password: 'password',
        user_type: 'patient'
    })
});

// Login
const loginResponse = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        username: 'patient123',
        password: 'password'
    })
});

const { session_token } = await loginResponse.json();
localStorage.setItem('session_token', session_token);
```

### 2. Authenticated Requests
```javascript
// All subsequent requests must include the session token
const response = await fetch('/submit_audio', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('session_token')}`
    },
    body: formData
});
```

## Data Privacy Compliance

### 1. HIPAA Considerations
- Patient data is isolated per user
- Access logging can be added for audit trails
- Data encryption at rest can be implemented
- Secure transmission over HTTPS

### 2. GDPR Compliance
- Users own their data
- Data can be exported per user
- Data deletion can be implemented
- Consent tracking can be added

## Deployment Considerations

### 1. Database
- SQLite for development/prototyping
- PostgreSQL/MySQL recommended for production
- Regular backups with encryption
- Database connection pooling

### 2. Security
- HTTPS in production
- Environment variables for secrets
- Rate limiting on authentication endpoints
- Input validation and sanitization

### 3. Scalability
- Session cleanup jobs for expired sessions
- Database indexing on user_id and timestamps
- Caching for frequently accessed data
- Load balancing for multiple server instances

## Usage Examples

### Patient Workflow
1. Register as a patient
2. Login to receive session token
3. Submit audio recordings or prescription images
4. View only their own submissions
5. Cannot approve submissions

### Doctor Workflow
1. Register as a doctor
2. Login to receive session token
3. View all patient submissions
4. Approve/review submissions
5. Access to administrative functions

## Migration from Current System

### 1. Data Migration
- Create user accounts for existing data
- Associate existing submissions with default users
- Update frontend to handle authentication

### 2. Backward Compatibility
- Maintain existing endpoints temporarily
- Gradual migration to authenticated endpoints
- Clear deprecation timeline

## Future Enhancements

### 1. Advanced Features
- Two-factor authentication
- Password reset functionality
- User profile management
- Data export capabilities

### 2. Analytics & Monitoring
- User activity logging
- Performance monitoring
- Security event tracking
- Usage analytics

### 3. Integration
- EMR system integration
- Third-party authentication (OAuth)
- Mobile app support
- Telemedicine integration

This multi-user system ensures that each patient's sensitive medical data remains private and secure while providing healthcare providers with the necessary access to review and approve medical information.