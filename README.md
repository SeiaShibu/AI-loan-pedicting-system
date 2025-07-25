# Loan Approval Prediction with Explainable AI

A comprehensive web application that predicts loan approval using machine learning with explainable AI (XAI) features powered by SHAP (SHapley Additive exPlanations).

## Features

- **Loan Prediction**: AI-powered loan approval prediction using XGBoost
- **Explainable AI**: SHAP values showing feature importance and decision reasoning
- **Interactive Tutorial**: Learn about XAI and how to interpret model predictions
- **Modern UI**: Beautiful, responsive React frontend with Tailwind CSS
- **Real-time Predictions**: Instant predictions with probability scores

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Axios for API communication
- Vite for development and building

### Backend
- Flask (Python web framework)
- XGBoost for machine learning
- SHAP for explainable AI
- Pandas for data manipulation
- Scikit-learn for preprocessing
- Flask-CORS for cross-origin requests

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask server:
   ```bash
   python run.py
   ```

   The backend will:
   - Install required packages
   - Train the ML model (first time only)
   - Start the Flask server on http://localhost:5000

### Frontend Setup

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at http://localhost:5173

## Usage

### Making Predictions

1. Open the application in your browser
2. Fill out the loan application form with:
   - Personal details (Gender, Married, Dependents, Education)
   - Employment information (Self Employed status)
   - Financial details (Applicant Income, Coapplicant Income, Loan Amount)
   - Loan specifics (Loan Term, Credit History)
   - Property information (Property Area)

3. Click "Predict Loan Approval" to get:
   - Approval/Rejection decision
   - Confidence probability
   - SHAP feature importance values

### Understanding XAI Results

The application provides SHAP (SHapley Additive exPlanations) values that show:
- **Positive values** (green): Features that increase approval probability
- **Negative values** (red): Features that decrease approval probability
- **Magnitude**: Larger absolute values indicate stronger influence

### XAI Tutorial

Click on the "XAI Tutorial" tab to learn:
- What is Explainable AI
- How SHAP values work
- How to interpret prediction results
- Key features in loan approval decisions

## Model Information

The machine learning model uses:
- **Algorithm**: XGBoost Classifier
- **Features**: 11 input features (demographic, financial, and loan-specific)
- **Preprocessing**: One-hot encoding for categorical variables, median imputation for missing values
- **Evaluation**: Trained on historical loan data with train/test split

### Key Features
1. **Credit_History**: Most important factor (1 = good, 0 = poor)
2. **ApplicantIncome**: Primary applicant's income
3. **LoanAmount**: Requested loan amount
4. **Property_Area**: Urban/Semiurban/Rural location
5. **Education**: Graduate/Not Graduate
6. **Married**: Marital status
7. **CoapplicantIncome**: Co-applicant's income
8. **Self_Employed**: Employment type
9. **Dependents**: Number of dependents
10. **Gender**: Male/Female
11. **Loan_Amount_Term**: Loan duration in months

## API Endpoints

- `GET /`: Health check
- `POST /api/predict`: Make loan prediction
- `GET /api/model-info`: Get model feature information
- `GET /api/tutorial`: Get XAI tutorial content

## File Structure

```
├── backend/
│   ├── main.py              # Flask application
│   ├── run.py               # Setup and run script
│   ├── requirements.txt     # Python dependencies
│   ├── data/
│   │   └── loans.csv        # Training data
│   └── models/              # Saved ML models
├── src/
│   ├── App.tsx              # Main React component
│   ├── main.tsx             # React entry point
│   └── index.css            # Tailwind CSS
├── package.json             # Node.js dependencies
└── README.md                # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.#   A I - l o a n - p e d i c t i n g - s y s t e m 
 
 
