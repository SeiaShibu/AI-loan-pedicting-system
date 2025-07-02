import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
from xgboost import XGBClassifier
import shap
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import base64
import io
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Global variables to store model and explainer
model = None
explainer = None
feature_names = None

def train_model():
    """Train the loan prediction model and save it"""
    global model, explainer, feature_names
    
    # Load the data
    df = pd.read_csv('data/loans.csv')
    
    print("Missing values before handling:")
    print(df.isnull().sum())
    
    # Handling missing values
    numerical_cols = ['ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term', 'Credit_History']
    categorical_cols = ['Gender', 'Married', 'Dependents', 'Education', 'Self_Employed', 'Property_Area']
    
    # Impute numerical columns
    for col in numerical_cols:
        if df[col].isnull().sum() > 0:
            median = df[col].median()
            df[col].fillna(median, inplace=True)
    
    # Impute categorical columns
    for col in categorical_cols:
        if df[col].isnull().sum() > 0:
            mode = df[col].mode()[0]
            df[col].fillna(mode, inplace=True)
    
    print("\nMissing values after handling:")
    print(df.isnull().sum())
    
    # Separate features and target
    X = df.drop(columns=['Loan_Status', 'Loan_ID'])
    y = df['Loan_Status']
    
    # Encode target variable
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Define preprocessing for numerical and categorical columns
    categorical_transformer = OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore')
    
    # Combine the preprocessing steps
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', numerical_cols),
            ('cat', categorical_transformer, categorical_cols)
        ]
    )
    
    # Define the pipeline with a classifier
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', XGBClassifier(eval_metric='logloss', use_label_encoder=False, random_state=42))
    ])
    
    # Split the data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded)
    
    # Fit the model
    model.fit(X_train, y_train)
    
    # Evaluate the model
    y_pred = model.predict(X_test)
    print("\nModel Evaluation on Test Set:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save the model and label encoder
    joblib.dump(model, 'models/loan_model.pkl')
    joblib.dump(le, 'models/label_encoder.pkl')
    
    # Create SHAP explainer
    explainer = shap.TreeExplainer(model['classifier'])
    joblib.dump(explainer, 'models/loan_explainer.pkl')
    
    # Get feature names
    feature_names = model['preprocessor'].get_feature_names_out()
    joblib.dump(feature_names, 'models/feature_names.pkl')
    
    print("Model training completed and saved!")

def load_model():
    """Load the trained model and explainer"""
    global model, explainer, feature_names
    
    try:
        model = joblib.load('models/loan_model.pkl')
        explainer = joblib.load('models/loan_explainer.pkl')
        feature_names = joblib.load('models/feature_names.pkl')
        print("Model loaded successfully!")
    except FileNotFoundError:
        print("Model not found. Training new model...")
        train_model()

def explain_loan_application(instance_data):
    """Explains the loan approval prediction for a single instance using SHAP"""
    global model, explainer, feature_names
    
    # Transform the input instance using the preprocessor
    transformed_instance = model['preprocessor'].transform(instance_data)
    
    # Get SHAP values
    shap_values = explainer.shap_values(transformed_instance)
    
    # Get prediction
    prediction = model.predict(instance_data)[0]
    prediction_proba = model.predict_proba(instance_data)[0]
    
    # Create explanation dictionary
    explanation = {
        'prediction': int(prediction),
        'prediction_text': 'Approved' if prediction == 1 else 'Rejected',
        'probability': {
            'approved': float(prediction_proba[1]),
            'rejected': float(prediction_proba[0])
        },
        'feature_importance': {}
    }
    
    # Add SHAP values for each feature
    for i, feature_name in enumerate(feature_names):
        explanation['feature_importance'][feature_name] = float(shap_values[0][i])
    
    return explanation

@app.route('/')
def index():
    return jsonify({"message": "Loan Prediction API is running!"})

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Create DataFrame from input data
        input_df = pd.DataFrame([data])
        
        # Get prediction and explanation
        explanation = explain_loan_application(input_df)
        
        return jsonify(explanation)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Get information about the model"""
    try:
        # Load sample data to show feature ranges
        df = pd.read_csv('data/loans.csv')
        
        info = {
            'features': {
                'Gender': ['Male', 'Female'],
                'Married': ['Yes', 'No'],
                'Dependents': ['0', '1', '2', '3+'],
                'Education': ['Graduate', 'Not Graduate'],
                'Self_Employed': ['Yes', 'No'],
                'Property_Area': ['Urban', 'Semiurban', 'Rural'],
                'ApplicantIncome': {
                    'min': int(df['ApplicantIncome'].min()),
                    'max': int(df['ApplicantIncome'].max()),
                    'median': int(df['ApplicantIncome'].median())
                },
                'CoapplicantIncome': {
                    'min': int(df['CoapplicantIncome'].min()),
                    'max': int(df['CoapplicantIncome'].max()),
                    'median': int(df['CoapplicantIncome'].median())
                },
                'LoanAmount': {
                    'min': int(df['LoanAmount'].min()),
                    'max': int(df['LoanAmount'].max()),
                    'median': int(df['LoanAmount'].median())
                },
                'Loan_Amount_Term': [120, 180, 240, 300, 360, 480],
                'Credit_History': [0, 1]
            }
        }
        
        return jsonify(info)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    

from flask import jsonify
@app.route('/api/ask', methods=['GET'])
def ask_ai():
    try:
        data = request.get_json()
        print("Received data:", data)  # Debug print
        question = data.get('question', '').lower()

        if 'credit history' in question:
            answer = "Credit history is like your financial report card."
        elif 'ai' in question:
            answer = "AI learns patterns from past data to predict approvals."
        elif 'loan amount' in question or 'income' in question:
            answer = "The loan amount should be in balance with your income."
        elif 'rejected' in question:
            answer = "If a loan is rejected, try improving your credit score and apply again."
        elif 'improve' in question or 'approval chances' in question:
            answer = "Pay bills on time, reduce debt, and consider adding a co-applicant."
        else:
            answer = "Loan decisions are based on income, credit history, loan amount, and more."

        print("Sending answer:", answer)  # Debug print
        return jsonify({'answer': answer})

    except Exception as e:
        print("Error in /api/ask:", str(e))  # Log full error
        return jsonify({'error': str(e)}), 500




if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('models', exist_ok=True)
    os.makedirs('data', exist_ok=True)
    
    # Load or train model
    load_model()
    
    app.run(debug=True, port=5000)