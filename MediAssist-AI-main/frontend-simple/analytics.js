// Analytics JavaScript for MediAssist AI

// Global variables
let submissionsChart, typesChart, statusChart;
let analyticsData = [];

// Initialize analytics when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDateInputs();
    loadAnalyticsData();
    initializeCharts();
    loadRecentActivity();
});

// Initialize date inputs with default values
function initializeDateInputs() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
}

// Load analytics data from API
async function loadAnalyticsData() {
    try {
        // Show loading state
        showLoadingState();
        
        // Fetch data from backend
        const response = await fetch('http://127.0.0.1:8000/get_result');
        const data = await response.json();
        
        if (data.submissions) {
            analyticsData = data.submissions;
            updateDashboardStats(analyticsData);
            updateCharts(analyticsData);
        }
    } catch (error) {
        console.error('Error loading analytics data:', error);
        showErrorState();
    }
}

// Update dashboard statistics
function updateDashboardStats(data) {
    const totalSubmissions = data.length;
    const audioSubmissions = data.filter(s => s.type === 'audio').length;
    const prescriptionSubmissions = data.filter(s => s.type === 'prescription').length;
    const approvedSubmissions = data.filter(s => s.status === 'approved').length;
    
    // Update stat cards
    document.getElementById('totalSubmissions').textContent = totalSubmissions;
    document.getElementById('audioSubmissions').textContent = audioSubmissions;
    document.getElementById('prescriptionSubmissions').textContent = prescriptionSubmissions;
    
    // Calculate percentages
    const audioPercentage = totalSubmissions > 0 ? Math.round((audioSubmissions / totalSubmissions) * 100) : 0;
    const prescriptionPercentage = totalSubmissions > 0 ? Math.round((prescriptionSubmissions / totalSubmissions) * 100) : 0;
    const approvalRate = totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0;
    
    document.getElementById('audioPercentage').textContent = `${audioPercentage}% of total`;
    document.getElementById('prescriptionPercentage').textContent = `${prescriptionPercentage}% of total`;
    document.getElementById('approvalRate').textContent = `${approvalRate}%`;
    
    // Update growth indicators (simulated for demo)
    document.getElementById('submissionsGrowth').textContent = '+12% from last month';
    document.getElementById('approvalTrend').textContent = '+5% improvement';
    
    // Update performance metrics (simulated)
    updatePerformanceMetrics();
}

// Update performance metrics
function updatePerformanceMetrics() {
    // Simulated performance data
    const avgProcessingTime = 2.5; // seconds
    const ocrAccuracy = 94; // percentage
    const ttsSuccess = 98; // percentage
    
    document.getElementById('avgProcessingTime').textContent = `${avgProcessingTime}s`;
    document.getElementById('ocrAccuracy').textContent = `${ocrAccuracy}%`;
    document.getElementById('ttsSuccess').textContent = `${ttsSuccess}%`;
    
    // Update progress bars
    document.getElementById('processingTimeBar').style.width = `${Math.min((5 - avgProcessingTime) / 5 * 100, 100)}%`;
    document.getElementById('ocrAccuracyBar').style.width = `${ocrAccuracy}%`;
    document.getElementById('ttsSuccessBar').style.width = `${ttsSuccess}%`;
}

// Initialize charts
function initializeCharts() {
    initializeSubmissionsChart();
    initializeTypesChart();
    initializeStatusChart();
}

// Initialize submissions timeline chart
function initializeSubmissionsChart() {
    const ctx = document.getElementById('submissionsChart').getContext('2d');
    
    // Generate sample data for the last 30 days
    const days = [];
    const submissionCounts = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        submissionCounts.push(Math.floor(Math.random() * 10) + 1); // Random data for demo
    }
    
    submissionsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Daily Submissions',
                data: submissionCounts,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Initialize submission types chart
function initializeTypesChart() {
    const ctx = document.getElementById('typesChart').getContext('2d');
    
    typesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Audio Submissions', 'Prescription Scans'],
            datasets: [{
                data: [0, 0], // Will be updated with real data
                backgroundColor: ['#10b981', '#f59e0b'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Initialize status chart
function initializeStatusChart() {
    const ctx = document.getElementById('statusChart').getContext('2d');
    
    statusChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Pending', 'Approved', 'Rejected'],
            datasets: [{
                label: 'Submissions',
                data: [0, 0, 0], // Will be updated with real data
                backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update charts with real data
function updateCharts(data) {
    // Update types chart
    const audioCount = data.filter(s => s.type === 'audio').length;
    const prescriptionCount = data.filter(s => s.type === 'prescription').length;
    
    typesChart.data.datasets[0].data = [audioCount, prescriptionCount];
    typesChart.update();
    
    // Update status chart
    const pendingCount = data.filter(s => s.status === 'pending').length;
    const approvedCount = data.filter(s => s.status === 'approved').length;
    const rejectedCount = data.filter(s => s.status === 'rejected').length;
    
    statusChart.data.datasets[0].data = [pendingCount, approvedCount, rejectedCount];
    statusChart.update();
}

// Load recent activity
function loadRecentActivity() {
    const activityContainer = document.getElementById('activityTimeline');
    
    // Sample activity data
    const activities = [
        {
            time: '2 minutes ago',
            type: 'submission',
            message: 'New audio submission received from Patient #1234',
            icon: 'fas fa-microphone',
            color: 'success'
        },
        {
            time: '15 minutes ago',
            type: 'approval',
            message: 'Prescription approved for Patient #1233',
            icon: 'fas fa-check-circle',
            color: 'info'
        },
        {
            time: '1 hour ago',
            type: 'upload',
            message: 'New prescription image uploaded',
            icon: 'fas fa-file-medical',
            color: 'warning'
        },
        {
            time: '2 hours ago',
            type: 'system',
            message: 'OCR processing completed for 5 prescriptions',
            icon: 'fas fa-cog',
            color: 'secondary'
        }
    ];
    
    const activityHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon bg-${activity.color}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-message">${activity.message}</div>
                <div class="activity-time text-muted">${activity.time}</div>
            </div>
        </div>
    `).join('');
    
    activityContainer.innerHTML = activityHTML;
}

// Update analytics data
function updateAnalytics() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }
    
    // Reload data with date filter
    loadAnalyticsData();
}

// Export data functions
function exportData(format) {
    // Simulate export functionality
    const exportButton = event.target;
    const originalText = exportButton.innerHTML;
    
    exportButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Exporting...';
    exportButton.disabled = true;
    
    setTimeout(() => {
        alert(`${format.toUpperCase()} export completed! (This is a demo - actual file would be downloaded)`);
        exportButton.innerHTML = originalText;
        exportButton.disabled = false;
    }, 2000);
}

// Show loading state
function showLoadingState() {
    // Add loading spinners to stat cards
    const statCards = document.querySelectorAll('.stat-card h3');
    statCards.forEach(card => {
        card.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    });
}

// Show error state
function showErrorState() {
    const statCards = document.querySelectorAll('.stat-card h3');
    statCards.forEach(card => {
        card.textContent = '—';
    });
    
    // Show error message
    const activityContainer = document.getElementById('activityTimeline');
    activityContainer.innerHTML = `
        <div class="alert alert-warning" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Unable to load analytics data. Please check your connection and try again.
        </div>
    `;
}

// Utility function to format numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}