// Doctor Portal JavaScript
// Doctor Dashboard JavaScript
// API_BASE_URL is already declared in auth.js

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadSubmissions();
    updateDashboardStats();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('doctorPrescriptionForm').addEventListener('submit', handleDoctorPrescriptionUpload);
    document.getElementById('doctorPrescriptionFile').addEventListener('change', previewDoctorPrescription);
}

// Load and display submissions
async function loadSubmissions() {
    if (!isAuthenticated()) {
        showError('Please login to access submissions');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/get_all_results`);
        const result = await response.json();
        
        if (response.ok) {
            displaySubmissions(result.submissions);
            updateDashboardStats(result.submissions);
        } else {
            showError('Failed to load submissions');
        }
    } catch (error) {
        showError('Network error: ' + error.message);
    }
}

function displaySubmissions(submissions) {
    const submissionsList = document.getElementById('submissionsList');
    
    if (submissions.length === 0) {
        submissionsList.innerHTML = '<p class="text-muted text-center">No submissions found</p>';
        return;
    }
    
    let html = '';
    submissions.forEach(submission => {
        const statusClass = submission.status === 'approved' ? 'bg-success' : 'bg-warning';
        const typeIcon = submission.type === 'audio' ? 'microphone' : 'prescription-bottle-alt';
        
        html += `
            <div class="submission-card card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h5 class="card-title">
                                <i class="fas fa-${typeIcon} me-2"></i>
                                ${submission.type.charAt(0).toUpperCase() + submission.type.slice(1)} #${submission.id}
                            </h5>
                            ${submission.transcribed_text ? `<p class="mb-1"><strong>Transcribed:</strong> ${submission.transcribed_text.substring(0, 100)}...</p>` : ''}
                            ${submission.patient_instructions ? `<p class="mb-1"><strong>Instructions:</strong> ${submission.patient_instructions.substring(0, 100)}...</p>` : ''}
                            ${submission.doctor_summary ? `<p class="mb-1"><strong>Summary:</strong> ${submission.doctor_summary.substring(0, 100)}...</p>` : ''}
                        </div>
                        <div class="col-md-4 text-end">
                            <span class="badge ${statusClass} mb-2">${submission.status}</span>
                            <div class="btn-group-vertical d-grid gap-2">
                                ${submission.status !== 'approved' ? `
                                    <button class="btn btn-sm btn-success" onclick="approveSubmission(${submission.id})">
                                        <i class="fas fa-check me-1"></i> Approve
                                    </button>
                                ` : ''}
                                <button class="btn btn-sm btn-info" onclick="viewSubmissionDetails(${submission.id})">
                                    <i class="fas fa-eye me-1"></i> View Details
                                </button>
                                ${submission.patient_instructions ? `
                                    <button class="btn btn-sm btn-primary" onclick="generateTTS('${submission.patient_instructions}')">
                                        <i class="fas fa-volume-up me-1"></i> TTS
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    submissionsList.innerHTML = html;
}

// Update dashboard statistics
function updateDashboardStats(submissions = []) {
    const totalPatients = submissions.length;
    const pendingReviews = submissions.filter(s => s.status !== 'approved').length;
    const approvedCases = submissions.filter(s => s.status === 'approved').length;
    const todayCases = submissions.filter(s => {
        // Assuming submissions have a date field
        return new Date().toDateString() === new Date().toDateString();
    }).length;
    
    // Animate counters
    animateCounter('totalPatients', totalPatients);
    animateCounter('pendingReviews', pendingReviews);
    animateCounter('approvedCases', approvedCases);
    animateCounter('todayCases', todayCases);
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
        } else {
            element.textContent = target;
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Filter submissions
function filterSubmissions(filter) {
    // Update active filter button
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter logic would go here
    // For now, just reload all submissions
    loadSubmissions();
}

// Approve submission
async function approveSubmission(submissionId) {
    if (!isAuthenticated()) {
        showError('Please login to approve submissions');
        return;
    }
    
    try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/approve/${submissionId}`, {
            method: 'PUT'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Submission approved successfully!');
            loadSubmissions(); // Refresh the list
        } else {
            showError(result.detail || 'Failed to approve submission');
        }
    } catch (error) {
        showError('Network error: ' + error.message);
    }
}

// View submission details
function viewSubmissionDetails(submissionId) {
    // This would show detailed view in modal
    // For now, just show a placeholder
    showSuccess(`Viewing details for submission #${submissionId}`);
}

// Doctor prescription upload
async function handleDoctorPrescriptionUpload(event) {
    event.preventDefault();
    
    if (!isAuthenticated()) {
        showError('Please login to submit prescriptions');
        return;
    }
    
    const fileInput = document.getElementById('doctorPrescriptionFile');
    const files = fileInput.files;
    
    if (files.length === 0) {
        showError('Please select at least one prescription image');
        return;
    }
    
    for (let file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        showLoading();
        
        try {
            const response = await makeAuthenticatedRequest(`${API_BASE_URL}/submit_prescription`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${sessionToken}`
                }
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showSuccess(`Prescription ${file.name} processed successfully!`);
            } else {
                showError(`Failed to process ${file.name}: ${result.error}`);
            }
        } catch (error) {
            showError(`Network error processing ${file.name}: ${error.message}`);
        }
    }
    
    hideLoading();
    loadSubmissions(); // Refresh submissions list
    
    // Clear form
    fileInput.value = '';
    document.getElementById('doctorPrescriptionPreview').innerHTML = '';
    document.getElementById('doctorUploadActions').style.display = 'none';
}

function previewDoctorPrescription(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('doctorPrescriptionPreview');
    
    if (files.length === 0) return;
    
    let html = '<div class="row">';
    
    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            html += `
                <div class="col-md-4 mb-3">
                    <div class="prescription-preview-item">
                        <img src="${e.target.result}" alt="Prescription ${index + 1}" class="img-fluid rounded">
                        <p class="text-center mt-2 small">${file.name}</p>
                    </div>
                </div>
            `;
            
            if (index === files.length - 1) {
                html += '</div>';
                previewContainer.innerHTML = html;
                document.getElementById('doctorUploadActions').style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    });
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
function showLoading() {
    new bootstrap.Modal(document.getElementById('loadingModal')).show();
}

function hideLoading() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('loadingModal'));
    if (modal) modal.hide();
}

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