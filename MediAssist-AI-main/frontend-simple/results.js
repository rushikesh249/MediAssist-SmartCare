// Results Page JavaScript
// API_BASE_URL is already declared in auth.js

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Wait for auth.js to be loaded and initialized
    setTimeout(() => {
        checkAuthenticationAndLoad();
        setupEventListeners();
    }, 100);
});

function checkAuthenticationAndLoad() {
    // Show user info if authenticated
    if (typeof isAuthenticated === 'function' && isAuthenticated()) {
        showUserInfo();
        loadResults();
    } else {
        // If not authenticated, show login message
        loadResults(); // This will show the authentication required message
    }
}

function showUserInfo() {
    if (typeof currentUser !== 'undefined' && currentUser) {
        const userInfoBar = document.getElementById('userInfoBar');
        const userName = document.getElementById('userName');
        const userTypeDisplay = document.getElementById('userTypeDisplay');
        
        if (userInfoBar && userName && userTypeDisplay) {
            userName.textContent = currentUser.username;
            userTypeDisplay.textContent = currentUser.user_type.charAt(0).toUpperCase() + currentUser.user_type.slice(1);
            userInfoBar.classList.remove('d-none');
        }
    }
}

function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.btn-group .btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Load and display results
async function loadResults() {
    // Check if user is authenticated
    if (typeof isAuthenticated !== 'function' || !isAuthenticated()) {
        showError('Please login to view results');
        document.getElementById('resultsTimeline').innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-lock fa-4x text-muted mb-3"></i>
                <h4 class="text-muted">Authentication Required</h4>
                <p class="text-muted">Please login to view your results</p>
                <a href="index.html" class="btn btn-primary">Go to Login</a>
            </div>
        `;
        return;
    }
    
    try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/get_result`);
        const result = await response.json();
        
        if (response.ok) {
            displayResults(result.submissions);
            updateSummaryStats(result.submissions);
        } else {
            showError('Failed to load results: ' + (result.detail || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading results:', error);
        showError('Network error: ' + error.message);
    }
}

function displayResults(submissions) {
    const timeline = document.getElementById('resultsTimeline');
    
    if (submissions.length === 0) {
        timeline.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-inbox fa-4x text-muted mb-3"></i>
                <h4 class="text-muted">No results found</h4>
                <p class="text-muted">Start by recording symptoms or uploading prescriptions</p>
                <a href="patient.html" class="btn btn-primary">Go to Patient Portal</a>
            </div>
        `;
        return;
    }
    
    let html = '<div class="timeline">';
    
    submissions.forEach((submission, index) => {
        const isApproved = submission.status === 'approved';
        const typeIcon = submission.type === 'audio' ? 'microphone' : 'prescription-bottle-alt';
        const typeColor = submission.type === 'audio' ? 'primary' : 'success';
        
        html += `
            <div class="timeline-item" data-type="${submission.type}" data-status="${submission.status}">
                <div class="timeline-marker">
                    <div class="timeline-icon bg-${typeColor}">
                        <i class="fas fa-${typeIcon}"></i>
                    </div>
                </div>
                <div class="timeline-content">
                    <div class="timeline-card">
                        <div class="timeline-header">
                            <h5 class="mb-1">
                                ${submission.type.charAt(0).toUpperCase() + submission.type.slice(1)} Submission #${submission.id}
                                <span class="badge bg-${isApproved ? 'success' : 'warning'} ms-2">${submission.status}</span>
                            </h5>
                            <small class="text-muted">Submitted on ${new Date().toLocaleDateString()}</small>
                        </div>
                        <div class="timeline-body">
                            ${submission.transcribed_text ? `
                                <div class="mb-2">
                                    <strong>Transcribed Text:</strong>
                                    <p class="mb-1">${submission.transcribed_text.substring(0, 150)}...</p>
                                </div>
                            ` : ''}
                            ${submission.patient_instructions ? `
                                <div class="mb-2">
                                    <strong>Instructions:</strong>
                                    <p class="mb-1">${submission.patient_instructions.substring(0, 150)}...</p>
                                </div>
                            ` : ''}
                            ${submission.doctor_summary ? `
                                <div class="mb-2">
                                    <strong>Medical Summary:</strong>
                                    <p class="mb-1">${submission.doctor_summary.substring(0, 150)}...</p>
                                </div>
                            ` : ''}
                        </div>
                        <div class="timeline-actions">
                            <button class="btn btn-sm btn-outline-primary" onclick="viewFullResult(${submission.id})">
                                <i class="fas fa-eye me-1"></i>View Details
                            </button>
                            ${submission.patient_instructions ? `
                                <button class="btn btn-sm btn-outline-info" onclick="generateTTS('${submission.patient_instructions}')">
                                    <i class="fas fa-volume-up me-1"></i>Listen
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-outline-secondary" onclick="downloadResult(${submission.id})">
                                <i class="fas fa-download me-1"></i>Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    timeline.innerHTML = html;
}

function updateSummaryStats(submissions) {
    const audioCount = submissions.filter(s => s.type === 'audio').length;
    const prescriptionCount = submissions.filter(s => s.type === 'prescription').length;
    const approvedCount = submissions.filter(s => s.status === 'approved').length;
    
    animateCounter('audioCount', audioCount);
    animateCounter('prescriptionCount', prescriptionCount);
    animateCounter('approvedCount', approvedCount);
}

function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    const duration = 1000;
    const start = 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (target - start) * progress);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Filter results
function filterResults(filter) {
    const items = document.querySelectorAll('.timeline-item');
    
    items.forEach(item => {
        const type = item.getAttribute('data-type');
        const status = item.getAttribute('data-status');
        
        let show = true;
        
        switch(filter) {
            case 'all':
                show = true;
                break;
            case 'audio':
                show = type === 'audio';
                break;
            case 'prescription':
                show = type === 'prescription';
                break;
            case 'approved':
                show = status === 'approved';
                break;
        }
        
        item.style.display = show ? 'flex' : 'none';
    });
}

// View full result details
function viewFullResult(submissionId) {
    // This would show detailed view in modal
    showSuccess(`Viewing details for submission #${submissionId}`);
}

// Download result
function downloadResult(submissionId) {
    // This would download the result as PDF or JSON
    showSuccess(`Downloading result #${submissionId}`);
}

// Export results
function exportResults(format) {
    if (format === 'pdf') {
        showSuccess('Exporting results as PDF...');
    } else if (format === 'json') {
        showSuccess('Exporting results as JSON...');
    }
}

// TTS Generation
async function generateTTS(text) {
    if (!text) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/generate_audio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, language: 'en' })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showTTSModal(text, result.file_path);
        } else {
            showError('Failed to generate audio');
        }
    } catch (error) {
        showError('Network error: ' + error.message);
    }
}

function showTTSModal(text, audioPath) {
    document.getElementById('ttsContent').innerHTML = `
        <div class="mb-3">
            <h6>Text:</h6>
            <p>${text}</p>
        </div>
        <div class="mb-3">
            <h6>Audio:</h6>
            <audio controls class="w-100">
                <source src="${API_BASE_URL}${audioPath}" type="audio/mpeg">
            </audio>
        </div>
    `;
    
    new bootstrap.Modal(document.getElementById('ttsModal')).show();
}

// Utility Functions
function showError(message) {
    showAlert('danger', 'Error', message);
}

function showSuccess(message) {
    showAlert('success', 'Success', message);
}

function showAlert(type, title, message) {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert" style="position: fixed; top: 100px; right: 20px; z-index: 9999; min-width: 300px;">
            <strong>${title}:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const alertContainer = document.createElement('div');
    alertContainer.innerHTML = alertHtml;
    document.body.appendChild(alertContainer);
    
    setTimeout(() => alertContainer.remove(), 5000);
}