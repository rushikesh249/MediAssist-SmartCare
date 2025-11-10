// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

// Global variables
let mediaRecorder;
let audioChunks = [];
let recordedBlob;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    showSection('patient');
    setupEventListeners();
    loadSubmissions();
});

// Navigation between sections
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Update navbar active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[href="#${sectionName}"]`).classList.add('active');
}

// Setup event listeners
function setupEventListeners() {
    // Audio recording controls
    document.getElementById('recordBtn').addEventListener('click', startRecording);
    document.getElementById('stopBtn').addEventListener('click', stopRecording);
    document.getElementById('uploadAudioBtn').addEventListener('click', uploadAudio);
    
    // Prescription upload forms
    document.getElementById('prescriptionForm').addEventListener('submit', handlePrescriptionUpload);
    document.getElementById('doctorPrescriptionForm').addEventListener('submit', handleDoctorPrescriptionUpload);
    
    // File preview handlers
    document.getElementById('prescriptionFile').addEventListener('change', previewPrescription);
    document.getElementById('doctorPrescriptionFile').addEventListener('change', previewDoctorPrescription);
}

// Audio Recording Functions
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            recordedBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(recordedBlob);
            const audioPlayer = document.getElementById('audioPlayer');
            audioPlayer.src = audioUrl;
            audioPlayer.classList.remove('d-none');
            document.getElementById('uploadAudioBtn').disabled = false;
        };
        
        mediaRecorder.start();
        
        // Update UI
        document.getElementById('recordBtn').disabled = true;
        document.getElementById('recordBtn').classList.add('recording');
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('audioStatus').innerHTML = `
            <div class="text-danger">
                <i class="fas fa-record-vinyl"></i> Recording... 
                <span class="loading-dots"></span>
            </div>
        `;
        
    } catch (error) {
        showError('Error accessing microphone: ' + error.message);
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        
        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        // Update UI
        document.getElementById('recordBtn').disabled = false;
        document.getElementById('recordBtn').classList.remove('recording');
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('audioStatus').innerHTML = `
            <div class="text-success">
                <i class="fas fa-check-circle"></i> Recording completed! You can now submit or record again.
            </div>
        `;
    }
}

async function uploadAudio() {
    if (!recordedBlob) {
        showError('No audio recorded');
        return;
    }
    
    if (!isAuthenticated()) {
        showError('Please login to submit audio');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', recordedBlob, 'audio_recording.wav');
    
    showLoading();
    
    try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/submit_audio`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        hideLoading();
        
        if (response.ok) {
            showResults({
                type: 'audio',
                transcribed_text: result.transcribed_text,
                doctor_summary: result.doctor_summary,
                submission_id: result.submission_id
            });
            
            // Reset audio controls
            resetAudioControls();
        } else {
            showError(result.error || 'Failed to process audio');
        }
    } catch (error) {
        hideLoading();
        showError('Network error: ' + error.message);
    }
}

function resetAudioControls() {
    document.getElementById('audioPlayer').classList.add('d-none');
    document.getElementById('uploadAudioBtn').disabled = true;
    document.getElementById('audioStatus').innerHTML = '';
    recordedBlob = null;
}

// Prescription Upload Functions
async function handlePrescriptionUpload(event) {
    event.preventDefault();
    
    if (!isAuthenticated()) {
        showError('Please login to submit prescriptions');
        return;
    }
    
    const fileInput = document.getElementById('prescriptionFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showError('Please select a prescription image');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    showLoading();
    
    try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/submit_prescription`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        hideLoading();
        
        if (response.ok) {
            showResults({
                type: 'prescription',
                extracted_text: result.extracted_text,
                patient_instructions: result.patient_instructions,
                submission_id: result.submission_id
            });
            
            // Generate TTS for instructions
            if (result.patient_instructions) {
                generateTTS(result.patient_instructions);
            }
            
            // Clear form
            fileInput.value = '';
            document.getElementById('prescriptionPreview').innerHTML = '';
        } else {
            showError(result.error || 'Failed to process prescription');
        }
    } catch (error) {
        hideLoading();
        showError('Network error: ' + error.message);
    }
}

async function handleDoctorPrescriptionUpload(event) {
    event.preventDefault();
    
    if (!isAuthenticated()) {
        showError('Please login to submit prescriptions');
        return;
    }
    
    const fileInput = document.getElementById('doctorPrescriptionFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showError('Please select a prescription image');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    showLoading();
    
    try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/submit_prescription`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        hideLoading();
        
        if (response.ok) {
            showSuccess('Prescription uploaded and processed successfully!');
            loadSubmissions(); // Refresh the submissions list
            
            // Clear form
            fileInput.value = '';
            document.getElementById('doctorPrescriptionPreview').innerHTML = '';
        } else {
            showError(result.error || 'Failed to process prescription');
        }
    } catch (error) {
        hideLoading();
        showError('Network error: ' + error.message);
    }
}

// File Preview Functions
function previewPrescription(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('prescriptionPreview').innerHTML = `
                <div class="prescription-preview mt-3">
                    <h6>Preview:</h6>
                    <img src="${e.target.result}" alt="Prescription Preview" class="img-fluid">
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }
}

function previewDoctorPrescription(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('doctorPrescriptionPreview').innerHTML = `
                <div class="prescription-preview mt-3">
                    <h6>Preview:</h6>
                    <img src="${e.target.result}" alt="Prescription Preview" class="img-fluid">
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }
}

// Results Display Functions
function showResults(data) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContent = document.getElementById('resultsContent');
    
    let content = '<div class="results-content">';
    
    if (data.type === 'audio') {
        content += `
            <h5><i class="fas fa-microphone me-2"></i>Audio Analysis Results</h5>
            <div class="mb-3">
                <h6>Transcribed Text:</h6>
                <p class="mb-2">${data.transcribed_text || 'Processing...'}</p>
            </div>
            <div class="mb-3">
                <h6>Doctor Summary:</h6>
                <p class="mb-2">${data.doctor_summary || 'Generating summary...'}</p>
            </div>
        `;
    } else if (data.type === 'prescription') {
        content += `
            <h5><i class="fas fa-prescription-bottle-alt me-2"></i>Prescription Analysis Results</h5>
            <div class="mb-3">
                <h6>Extracted Text:</h6>
                <p class="mb-2">${data.extracted_text || 'Processing...'}</p>
            </div>
            <div class="mb-3">
                <h6>Patient Instructions:</h6>
                <p class="mb-2">${data.patient_instructions || 'Generating instructions...'}</p>
            </div>
            <button class="btn btn-info" onclick="generateTTS('${data.patient_instructions}')">
                <i class="fas fa-volume-up"></i> Listen to Instructions
            </button>
        `;
    }
    
    content += `
        <div class="mt-3">
            <small class="text-light">Submission ID: ${data.submission_id}</small>
        </div>
    </div>`;
    
    resultsContent.innerHTML = content;
    resultsSection.style.display = 'block';
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// TTS Functions
async function generateTTS(text) {
    if (!text) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/generate_audio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                language: 'en'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showTTSModal(text, result.file_path);
        } else {
            showError('Failed to generate audio: ' + (result.detail || 'Unknown error'));
        }
    } catch (error) {
        showError('Network error: ' + error.message);
    }
}

function showTTSModal(text, audioPath) {
    const ttsContent = document.getElementById('ttsContent');
    ttsContent.innerHTML = `
        <div class="mb-3">
            <h6>Text:</h6>
            <p>${text}</p>
        </div>
        <div class="mb-3">
            <h6>Audio Instructions:</h6>
            <audio controls class="w-100">
                <source src="${API_BASE_URL}${audioPath}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
        </div>
    `;
    
    const ttsModal = new bootstrap.Modal(document.getElementById('ttsModal'));
    ttsModal.show();
}

// Submissions Management
async function loadSubmissions() {
    if (!isAuthenticated()) {
        console.log('User not authenticated, skipping submissions load');
        showError('Please login to view submissions');
        return;
    }
    
    try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/get_result`);
        const result = await response.json();
        
        if (response.ok) {
            displaySubmissions(result.submissions);
        } else {
            showError('Failed to load submissions: ' + (result.detail || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading submissions:', error);
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
        const statusClass = submission.status === 'approved' ? 'status-approved' : 'status-pending';
        html += `
            <div class="card submission-card">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h6 class="mb-1">
                                <i class="fas fa-${submission.type === 'audio' ? 'microphone' : 'prescription-bottle-alt'} me-2"></i>
                                ${submission.type.charAt(0).toUpperCase() + submission.type.slice(1)} Submission #${submission.id}
                            </h6>
                            ${submission.transcribed_text ? `<p class="mb-1"><strong>Transcribed:</strong> ${submission.transcribed_text.substring(0, 100)}...</p>` : ''}
                            ${submission.patient_instructions ? `<p class="mb-1"><strong>Instructions:</strong> ${submission.patient_instructions.substring(0, 100)}...</p>` : ''}
                            ${submission.doctor_summary ? `<p class="mb-1"><strong>Summary:</strong> ${submission.doctor_summary.substring(0, 100)}...</p>` : ''}
                        </div>
                        <div class="col-md-4 text-end">
                            <span class="badge status-badge ${statusClass}">${submission.status}</span>
                            <div class="mt-2">
                                ${submission.status !== 'approved' ? `
                                    <button class="btn btn-sm btn-success" onclick="approveSubmission(${submission.id})">
                                        <i class="fas fa-check"></i> Approve
                                    </button>
                                ` : ''}
                                ${submission.patient_instructions ? `
                                    <button class="btn btn-sm btn-info" onclick="generateTTS('${submission.patient_instructions}')">
                                        <i class="fas fa-volume-up"></i> TTS
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

// Utility Functions
function showLoading() {
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();
}

function hideLoading() {
    const loadingModal = bootstrap.Modal.getInstance(document.getElementById('loadingModal'));
    if (loadingModal) {
        loadingModal.hide();
    }
}

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