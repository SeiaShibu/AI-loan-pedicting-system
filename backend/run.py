import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("Requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Error installing requirements: {e}")
        return False
    return True

def main():
    print("Setting up Loan Prediction Backend...")
    
    # Install requirements
    if not install_requirements():
        return
    
    # Import and run the main application
    try:
        from main import app, train_model, load_model
        
        # Ensure directories exist
        os.makedirs('models', exist_ok=True)
        os.makedirs('data', exist_ok=True)
        
        # Check if model exists, if not train it
        if not os.path.exists('models/loan_model.pkl'):
            print("Training model for the first time...")
            train_model()
        else:
            print("Loading existing model...")
            load_model()
        
        print("Starting Flask server...")
        app.run(debug=True, port=5000)
        
    except ImportError as e:
        print(f"Import error: {e}")
        print("Please make sure all requirements are installed.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()