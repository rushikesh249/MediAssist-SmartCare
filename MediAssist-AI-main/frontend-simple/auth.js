// Authentication Management System
// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

// Authentication state management
let currentUser = null;
let sessionToken = null;

// Initialize authentication system
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupAuthEventListeners();
});

// Initialize authentication state
function initializeAuth() {
    // Check for existing session
    const storedToken = localStorage.getItem('sessionToken');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedToken && storedUser) {
        sessionToken = storedToken;
        currentUser = JSON.parse(storedUser);
        showUserInfo();
    } else {
        hideUserInfo();
    }
}

// Setup authentication event listeners
function setupAuthEventListeners() {
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    try {
        setAuthLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Store session data
            sessionToken = result.session_token;
            currentUser = result.user;
            
            localStorage.setItem('sessionToken', sessionToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Show user info and hide modal
            showUserInfo();
            hideAuthModal();
            
            showSuccess('Login successful! Welcome back.');
            
            // Clear form
            document.getElementById('loginForm').reset();
            
        } else {
            showError(result.detail || 'Login failed');
        }
        
    } catch (error) {
        showError('Network error: ' + error.message);
    } finally {
        setAuthLoading(false);
    }
}

// Handle registration form submission
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const userType = document.getElementById('userType').value;
    
    if (!username || !email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    try {
        setAuthLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                user_type: userType
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Registration successful! Please login with your credentials.');
            
            // Switch to login form and pre-fill username
            toggleAuthMode();
            document.getElementById('loginUsername').value = username;
            
            // Clear registration form
            document.getElementById('registerForm').reset();
            
        } else {
            // Show more specific error message
            const errorMessage = result.detail || 'Registration failed';
            if (errorMessage.includes('Username already registered')) {
                showError('This username is already taken. Please choose a different username.');
            } else if (errorMessage.includes('Email already registered')) {
                showError('This email is already registered. Please use a different email or try logging in.');
            } else {
                showError(errorMessage);
            }
        }
        
    } catch (error) {
        showError('Network error: ' + error.message);
    } finally {
        setAuthLoading(false);
    }
}

// Toggle between login and registration forms
function toggleAuthMode() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authModalTitle = document.getElementById('authModalTitle');
    const authToggleText = document.getElementById('authToggleText');
    const authToggleBtn = document.getElementById('authToggleBtn');
    
    if (loginForm.classList.contains('d-none')) {
        // Switch to login mode
        loginForm.classList.remove('d-none');
        registerForm.classList.add('d-none');
        authModalTitle.innerHTML = '<i class="fas fa-user-shield me-2"></i>Login to MediAssist AI';
        authToggleText.textContent = "Don't have an account?";
        authToggleBtn.textContent = 'Create Account';
    } else {
        // Switch to registration mode
        loginForm.classList.add('d-none');
        registerForm.classList.remove('d-none');
        authModalTitle.innerHTML = '<i class="fas fa-user-plus me-2"></i>Register for MediAssist AI';
        authToggleText.textContent = 'Already have an account?';
        authToggleBtn.textContent = 'Login Here';
    }
}

// Show authentication modal
function showAuthModal() {
    const authModal = new bootstrap.Modal(document.getElementById('authModal'));
    authModal.show();
}

// Hide authentication modal
function hideAuthModal() {
    const authModal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
    if (authModal) {
        authModal.hide();
    }
}

// Show user information bar
function showUserInfo() {
    if (currentUser) {
        const userInfoBar = document.getElementById('userInfoBar');
        const userName = document.getElementById('userName');
        const userTypeDisplay = document.getElementById('userTypeDisplay');
        
        if (userInfoBar && userName && userTypeDisplay) {
            userName.textContent = currentUser.username;
            userTypeDisplay.textContent = currentUser.user_type.charAt(0).toUpperCase() + currentUser.user_type.slice(1);
            userInfoBar.classList.remove('d-none');
            
            // Add user type specific styling
            userInfoBar.classList.remove('user-type-patient', 'user-type-doctor');
            userInfoBar.classList.add(`user-type-${currentUser.user_type}`);
        }
    }
}

// Hide user information bar
function hideUserInfo() {
    const userInfoBar = document.getElementById('userInfoBar');
    if (userInfoBar) {
        userInfoBar.classList.add('d-none');
    }
}

// Logout user
function logout() {
    // Clear session data
    sessionToken = null;
    currentUser = null;
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('currentUser');
    
    // Hide user info
    hideUserInfo();
    
    showSuccess('Logged out successfully');
    
    // Redirect to home if on protected pages
    if (window.location.pathname.includes('patient.html') || window.location.pathname.includes('doctor.html')) {
        window.location.href = 'index.html';
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return sessionToken && currentUser;
}

// Get authorization headers for API requests
function getAuthHeaders() {
    if (!sessionToken) {
        return {};
    }
    
    return {
        'Authorization': `Bearer ${sessionToken}`
    };
}

// Make authenticated API request
async function makeAuthenticatedRequest(url, options = {}) {
    if (!isAuthenticated()) {
        throw new Error('User not authenticated');
    }
    
    const authHeaders = getAuthHeaders();
    
    // Special handling for FormData - don't set Content-Type
    const headers = { ...authHeaders };
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    
    const mergedOptions = {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    };
    
    const response = await fetch(url, mergedOptions);
    
    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
        logout();
        showError('Session expired. Please login again.');
        throw new Error('Authentication failed');
    }
    
    return response;
}

// Portal access functions
function showPatientPortal() {
    if (isAuthenticated()) {
        window.location.href = 'patient.html';
    } else {
        showAuthModal();
    }
}

function showDoctorPortal() {
    if (isAuthenticated()) {
        if (currentUser.user_type === 'doctor') {
            window.location.href = 'doctor.html';
        } else {
            showError('Only doctors can access the doctor portal');
        }
    } else {
        showAuthModal();
    }
}

// Set loading state for authentication forms
function setAuthLoading(loading) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loading) {
        loginForm.classList.add('auth-loading');
        registerForm.classList.add('auth-loading');
    } else {
        loginForm.classList.remove('auth-loading');
        registerForm.classList.remove('auth-loading');
    }
}

// Utility functions for alerts
function showError(message) {
    showAlert('danger', 'Error', message);
}

function showSuccess(message) {
    showAlert('success', 'Success', message);
}

function showAlert(type, title, message) {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert" style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
            <strong>${title}:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const alertContainer = document.createElement('div');
    alertContainer.innerHTML = alertHtml;
    document.body.appendChild(alertContainer);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alertContainer.remove();
    }, 5000);
}

// Export functions for global access
window.toggleAuthMode = toggleAuthMode;
window.showPatientPortal = showPatientPortal;
window.showDoctorPortal = showDoctorPortal;
window.logout = logout;
window.isAuthenticated = isAuthenticated;
window.makeAuthenticatedRequest = makeAuthenticatedRequest;
window.getAuthHeaders = getAuthHeaders;