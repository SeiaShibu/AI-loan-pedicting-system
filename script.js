// Global variables
let currentPrediction = null;

// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const loanForm = document.getElementById('loan-form');
const predictBtn = document.getElementById('predict-btn');
const resultsContent = document.getElementById('results-content');

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeForm();
    addFormValidation();
    addAnimations();
});

// Navigation functionality
function initializeNavigation() {
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    // Update navigation buttons
    navButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add animation
    document.getElementById(`${tabName}-tab`).classList.add('fade-in');
}

// Form initialization and handling
function initializeForm() {
    loanForm.addEventListener('submit', handleFormSubmit);
    
    // Add real-time validation
    const inputs = loanForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('change', validateField);
        input.addEventListener('input', validateField);
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showNotification('Please fill in all required fields correctly.', 'error');
        return;
    }
    
    const formData = new FormData(loanForm);
    const data = Object.fromEntries(formData.entries());
    
    // Convert numeric fields
    data.ApplicantIncome = parseInt(data.ApplicantIncome);
    data.CoapplicantIncome = parseInt(data.CoapplicantIncome);
    data.LoanAmount = parseInt(data.LoanAmount);
    data.Loan_Amount_Term = parseInt(data.Loan_Amount_Term);
    data.Credit_History = parseInt(data.Credit_History);
    
    makePrediction(data);
}

// API calls
async function makePrediction(data) {
    setLoadingState(true);
    
    try {
        // Simulate API call for demo purposes
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock prediction result
        const mockResult = generateMockPrediction(data);
        
        currentPrediction = mockResult;
        displayResults(mockResult);
        
    } catch (error) {
        console.error('Prediction error:', error);
        showNotification('Failed to get prediction. Please try again.', 'error');
        displayError();
    } finally {
        setLoadingState(false);
    }
}

// Generate mock prediction for demo
function generateMockPrediction(data) {
    // Simple scoring logic for demo
    let score = 0;
    
    // Credit history is most important
    score += data.Credit_History * 0.4;
    
    // Income factors
    const totalIncome = data.ApplicantIncome + data.CoapplicantIncome;
    const incomeScore = Math.min(totalIncome / 10000, 1) * 0.3;
    score += incomeScore;
    
    // Loan amount vs income ratio
    const loanToIncomeRatio = (data.LoanAmount * 1000) / (totalIncome * 12);
    const ratioScore = Math.max(0, 1 - loanToIncomeRatio / 5) * 0.2;
    score += ratioScore;
    
    // Education bonus
    if (data.Education === 'Graduate') score += 0.1;
    
    const isApproved = score > 0.6;
    const approvalProb = Math.min(Math.max(score, 0.1), 0.95);
    
    // Generate mock SHAP values
    const shapValues = {
        'Credit_History': data.Credit_History === 1 ? 0.35 : -0.4,
        'ApplicantIncome': (data.ApplicantIncome - 5000) / 20000,
        'LoanAmount': -(data.LoanAmount - 150) / 1000,
        'Education_Graduate': data.Education === 'Graduate' ? 0.08 : -0.05,
        'Property_Area_Urban': data.Property_Area === 'Urban' ? 0.05 : 
                              data.Property_Area === 'Semiurban' ? 0.02 : -0.03,
        'Married_Yes': data.Married === 'Yes' ? 0.04 : -0.02,
        'CoapplicantIncome': data.CoapplicantIncome / 10000,
        'Self_Employed_Yes': data.Self_Employed === 'Yes' ? -0.03 : 0.02
    };
    
    return {
        prediction: isApproved ? 1 : 0,
        prediction_text: isApproved ? 'Approved' : 'Rejected',
        probability: {
            approved: approvalProb,
            rejected: 1 - approvalProb
        },
        feature_importance: shapValues
    };
}

// Display results
function displayResults(result) {
    const isApproved = result.prediction === 1;
    const confidence = Math.max(result.probability.approved, result.probability.rejected) * 100;
    
    const resultsHTML = `
        <div class="prediction-result fade-in">
            <div class="result-status ${isApproved ? 'approved' : 'rejected'}">
                <i class="fas ${isApproved ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                <span>Loan ${result.prediction_text}</span>
            </div>
            <p class="confidence">Confidence: ${confidence.toFixed(1)}%</p>
        </div>
        
        <div class="probability-section">
            <h3><i class="fas fa-chart-pie"></i> Probability Breakdown</h3>
            <div class="probability-item">
                <span>Approval Probability:</span>
                <span class="probability-value approved">${(result.probability.approved * 100).toFixed(1)}%</span>
            </div>
            <div class="probability-item">
                <span>Rejection Probability:</span>
                <span class="probability-value rejected">${(result.probability.rejected * 100).toFixed(1)}%</span>
            </div>
        </div>
        
        ${renderFeatureImportance(result.feature_importance)}
    `;
    
    resultsContent.innerHTML = resultsHTML;
    
    // Animate feature bars
    setTimeout(() => {
        animateFeatureBars();
    }, 300);
}

function renderFeatureImportance(featureImportance) {
    const sortedFeatures = Object.entries(featureImportance)
        .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
        .slice(0, 8);
    
    const featuresHTML = sortedFeatures.map(([feature, importance]) => {
        const isPositive = importance >= 0;
        const width = Math.abs(importance) * 100;
        const displayName = formatFeatureName(feature);
        
        return `
            <div class="feature-item slide-in">
                <span class="feature-name">${displayName}</span>
                <div class="feature-bar-container">
                    <div class="feature-bar ${isPositive ? 'positive' : 'negative'}" 
                         style="width: ${Math.min(width, 100)}%"
                         data-width="${Math.min(width, 100)}">
                        ${importance.toFixed(3)}
                    </div>
                </div>
                <span class="feature-value">${importance.toFixed(3)}</span>
            </div>
        `;
    }).join('');
    
    return `
        <div class="feature-importance">
            <h3><i class="fas fa-chart-bar"></i> Feature Importance (SHAP Values)</h3>
            ${featuresHTML}
            <div class="legend">
                <div class="legend-item">
                    <div class="legend-color positive"></div>
                    <span>Positive values increase approval probability</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color negative"></div>
                    <span>Negative values decrease approval probability</span>
                </div>
            </div>
        </div>
    `;
}

function formatFeatureName(feature) {
    const nameMap = {
        'Credit_History': 'Credit History',
        'ApplicantIncome': 'Applicant Income',
        'LoanAmount': 'Loan Amount',
        'Education_Graduate': 'Education (Graduate)',
        'Property_Area_Urban': 'Property Area (Urban)',
        'Married_Yes': 'Married Status',
        'CoapplicantIncome': 'Co-applicant Income',
        'Self_Employed_Yes': 'Self Employed'
    };
    
    return nameMap[feature] || feature.replace(/_/g, ' ');
}

function animateFeatureBars() {
    const bars = document.querySelectorAll('.feature-bar');
    bars.forEach((bar, index) => {
        setTimeout(() => {
            const width = bar.getAttribute('data-width');
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width + '%';
            }, 50);
        }, index * 100);
    });
}

function displayError() {
    resultsContent.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">
                <i class="fas fa-exclamation-triangle" style="color: var(--error-color);"></i>
            </div>
            <h3>Prediction Failed</h3>
            <p>Unable to process your request. Please check your connection and try again.</p>
        </div>
    `;
}

// Form validation
function validateForm() {
    const requiredFields = loanForm.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });
    
    return isValid;
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove previous error state
    field.classList.remove('error');
    
    // Validate based on field type
    if (field.hasAttribute('required') && !value) {
        field.classList.add('error');
        return false;
    }
    
    if (field.type === 'number') {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
            field.classList.add('error');
            return false;
        }
    }
    
    return true;
}

// UI state management
function setLoadingState(isLoading) {
    const submitText = predictBtn.querySelector('span');
    const loader = predictBtn.querySelector('.btn-loader');
    
    if (isLoading) {
        predictBtn.disabled = true;
        submitText.style.display = 'none';
        loader.classList.remove('hidden');
        loader.classList.add('show');
        
        // Show loading in results
        resultsContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-spinner fa-spin" style="color: var(--primary-color);"></i>
                </div>
                <h3>Processing Prediction</h3>
                <p>Our AI is analyzing your application...</p>
            </div>
        `;
    } else {
        predictBtn.disabled = false;
        submitText.style.display = 'inline';
        loader.classList.add('hidden');
        loader.classList.remove('show');
    }
}

// Notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'error' ? 'var(--error-color)' : 'var(--primary-color)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: '1000',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out'
    });
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'white';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.padding = '0.25rem';
    
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Add form validation styles
function addFormValidation() {
    const style = document.createElement('style');
    style.textContent = `
        .form-group input.error,
        .form-group select.error {
            border-color: var(--error-color);
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        .form-group input.error:focus,
        .form-group select.error:focus {
            border-color: var(--error-color);
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
        }
    `;
    document.head.appendChild(style);
}

// Add animations
function addAnimations() {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe tutorial cards
    document.querySelectorAll('.tutorial-card').forEach(card => {
        observer.observe(card);
    });
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

function formatPercentage(value) {
    return `${(value * 100).toFixed(1)}%`;
}

// Export for potential external use
window.LoanPredictor = {
    makePrediction,
    switchTab,
    showNotification
};