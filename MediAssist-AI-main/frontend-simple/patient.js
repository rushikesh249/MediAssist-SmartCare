// Patient Portal JavaScript
// Patient Portal JavaScript
// API_BASE_URL is already declared in auth.js

// Global variables
let mediaRecorder;
let audioChunks = [];
let recordedBlob;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setupDragAndDrop();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('recordBtn').addEventListener('click', startRecording);
    document.getElementById('stopBtn').addEventListener('click', stopRecording);
    document.getElementById('uploadAudioBtn').addEventListener('click', uploadAudio);
    document.getElementById('prescriptionForm').addEventListener('submit', handlePrescriptionUpload);
    document.getElementById('prescriptionFile').addEventListener('change', previewPrescription);
}

// Setup drag and drop
function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('prescriptionFile');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
    });

    uploadArea.addEventListener('drop', function(e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            previewPrescription({ target: { files: files } });
        }
    });
}

// Scroll to section
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Audio Recording Functions
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
        mediaRecorder.onstop = () => {
            recordedBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioPlayer = document.getElementById('audioPlayer');
            audioPlayer.src = URL.createObjectURL(recordedBlob);
            audioPlayer.classList.remove('d-none');
            document.getElementById('uploadAudioBtn').disabled = false;
        };
        
        mediaRecorder.start();
        
        // Update UI
        document.getElementById('recordBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('recordingAnimation').classList.add('active');
        
    } catch (error) {
        showError('Error accessing microphone: ' + error.message);
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        document.getElementById('recordBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('recordingAnimation').classList.remove('active');
    }
}

async function uploadAudio() {
    if (!recordedBlob) return;
    
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
            body: formData,
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
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
    recordedBlob = null;
}

// Prescription Upload
async function handlePrescriptionUpload(event) {
    event.preventDefault();
    
    if (!isAuthenticated()) {
        showError('Please login to submit prescriptions');
        return;
    }
    
    const file = document.getElementById('prescriptionFile').files[0];
    if (!file) return;
    
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
        hideLoading();
        
        if (response.ok) {
            showResults({
                type: 'prescription',
                extracted_text: result.extracted_text,
                patient_instructions: result.patient_instructions,
                submission_id: result.submission_id
            });
            
            // Clear form
            document.getElementById('prescriptionFile').value = '';
            document.getElementById('prescriptionPreview').innerHTML = '';
        } else {
            showError(result.error || 'Failed to process prescription');
        }
    } catch (error) {
        hideLoading();
        showError('Network error: ' + error.message);
    }
}

function previewPrescription(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('prescriptionPreview').innerHTML = `
                <div class="mt-4">
                    <h5>Preview:</h5>
                    <img src="${e.target.result}" alt="Prescription Preview" class="img-fluid rounded">
                </div>
            `;
            document.getElementById('uploadActions').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Results Display
function showResults(data) {
    const resultsSection = document.getElementById('results-section');
    const resultsContent = document.getElementById('resultsContent');
    
    let content = `<div class="result-card">`;
    
    if (data.type === 'audio') {
        content += `
            <h3><i class="fas fa-microphone me-2"></i>Voice Analysis</h3>
            <div class="mb-3">
                <h5>Transcribed Text:</h5>
                <p>${data.transcribed_text || 'Processing...'}</p>
            </div>
            <div class="mb-3">
                <h5>Medical Summary:</h5>
                <p>${data.doctor_summary || 'Generating...'}</p>
            </div>
        `;
    } else {
        content += `
            <h3><i class="fas fa-prescription-bottle-alt me-2"></i>Prescription Analysis</h3>
            <div class="mb-3">
                <h5>Extracted Text:</h5>
                <p>${data.extracted_text || 'Processing...'}</p>
            </div>
            <div class="mb-3">
                <h5>Instructions:</h5>
                <p>${data.patient_instructions || 'Generating...'}</p>
            </div>
            <button class="btn btn-primary" onclick="generateTTS('${data.patient_instructions}')">
                <i class="fas fa-volume-up me-2"></i>Listen to Instructions
            </button>
        `;
    }
    
    content += `</div>`;
    resultsContent.innerHTML = content;
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
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