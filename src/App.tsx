import React, { useState, useEffect } from 'react';
import { Brain, Calculator, BookOpen, TrendingUp, AlertCircle, CheckCircle, XCircle, MessageCircle, User, Bot, HelpCircle, Lightbulb, Target, Shield } from 'lucide-react';
import axios from 'axios';

interface PredictionResult {
  prediction: number;
  prediction_text: string;
  probability: {
    approved: number;
    rejected: number;
  };
  feature_importance: Record<string, number>;
}

interface ModelInfo {
  features: Record<string, any>;
}


interface Tutorial {
  title: string;
  conversation: {
    role: 'user' | 'bot';
    message: string;
  }[];
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

function App() {
  const [activeTab, setActiveTab] = useState<'predict' | 'tutorial' | 'tutor'>('predict');
  const [formData, setFormData] = useState({
    Gender: 'Male',
    Married: 'Yes',
    Dependents: '0',
    Education: 'Graduate',
    Self_Employed: 'No',
    ApplicantIncome: 5000,
    CoapplicantIncome: 0,
    LoanAmount: 150,
    Loan_Amount_Term: 360,
    Credit_History: 1,
    Property_Area: 'Urban'
  });
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: "Hello! I'm your AI Tutor. I'm here to help you understand how loan predictions work in simple terms. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);

  useEffect(() => {
    fetchModelInfo();
    fetchTutorial();
  }, []);

  const fetchModelInfo = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/model-info');
      setModelInfo(response.data);
    } catch (error) {
      console.error('Error fetching model info:', error);
    }
  };

  const fetchTutorial = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tutorial');
      setTutorial(response.data);
    } catch (error) {
      console.error('Error fetching tutorial:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/predict', formData);
      setPrediction(response.data);
    } catch (error) {
      console.error('Error making prediction:', error);
    } finally {
      setLoading(false);
    }
  };
const handleTutorQuestion = async (question: string) => {
  if (!question.trim()) return;

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    type: 'user',
    message: question,
    timestamp: new Date()
  };

  setChatMessages(prev => [...prev, userMessage]);
  setUserInput('');
  setTutorLoading(true);

  try {
    const response = await axios.post('http://localhost:5000/api/ask', { question });
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      message: response.data.answer,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, botMessage]);
  } catch (error) {
    const errorMessage: ChatMessage = {
      id: (Date.now() + 2).toString(),
      type: 'bot',
      message: "Oops! Something went wrong. Try again.",
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, errorMessage]);
  } finally {
    setTutorLoading(false);
  }
};


  const generateTutorResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('what') && lowerQuestion.includes('ai')) {
      return "AI (Artificial Intelligence) is like a very smart computer program that can learn patterns from data. Think of it like a detective that looks at thousands of loan applications and learns what makes some people more likely to repay their loans. It's not magic - it's just very good at spotting patterns that humans might miss!";
    }
    
    if (lowerQuestion.includes('credit') && lowerQuestion.includes('history')) {
      return "Credit history is like your financial report card! It shows how well you've paid back money in the past. If you always paid your credit card bills on time, that's good credit history. If you missed payments or defaulted on loans, that's poor credit history. Banks love good credit history because it shows you're reliable with money.";
    }
    
    if (lowerQuestion.includes('shap') || lowerQuestion.includes('explain')) {
      return "SHAP is like having a translator for AI decisions! Imagine the AI is a chef making a dish (your loan decision). SHAP tells you exactly how much each ingredient (like your income, credit score, etc.) contributed to the final taste. Green ingredients made the dish better (helped approval), red ingredients made it worse (hurt approval). It's that simple!";
    }
    
    if (lowerQuestion.includes('income') || lowerQuestion.includes('salary')) {
      return "Your income is super important because it shows the bank you can afford to pay back the loan! Think of it like this: if you earn ₹50,000 per month and want a loan that requires ₹20,000 monthly payments, the bank knows you can handle it. But if you only earn ₹15,000, they'll worry you can't afford the payments.";
    }
    
    if (lowerQuestion.includes('loan amount') || lowerQuestion.includes('how much')) {
      return "The loan amount is how much money you're asking to borrow. Here's the key: banks prefer when you ask for reasonable amounts compared to your income. If you earn ₹30,000/month, asking for a ₹10 lakh loan might be okay, but asking for ₹1 crore would be risky for the bank. It's all about balance!";
    }
    
    if (lowerQuestion.includes('education') || lowerQuestion.includes('graduate')) {
      return "Education matters because it often relates to job stability and earning potential. Graduates typically have more stable jobs and higher incomes, which makes banks more confident about loan repayment. But don't worry if you're not a graduate - many other factors matter too, like your income and credit history!";
    }
    
    if (lowerQuestion.includes('married') || lowerQuestion.includes('family')) {
      return "Marital status can affect loan approval because married couples often have dual incomes and more financial stability. If your spouse also earns money, that's additional security for the bank. However, having dependents (children, elderly parents) means more expenses, which banks also consider.";
    }
    
    if (lowerQuestion.includes('property') || lowerQuestion.includes('area')) {
      return "Property location matters for resale value! Urban properties are usually easier to sell if the bank needs to recover money. Rural properties might be harder to sell quickly. It's like buying a car - a popular model in the city is easier to resell than a rare model in a remote area.";
    }
    
    if (lowerQuestion.includes('improve') || lowerQuestion.includes('better')) {
      return "Great question! Here's how to improve your loan chances: 1) Build good credit by paying bills on time, 2) Increase your income or add a co-applicant, 3) Ask for a smaller loan amount, 4) Save for a larger down payment, 5) Pay off existing debts first. Small improvements in these areas can make a big difference!";
    }
    
    if (lowerQuestion.includes('rejected') || lowerQuestion.includes('denied')) {
      return "Don't worry if your loan gets rejected - it's not the end! Banks reject loans to protect both you and them from financial trouble. You can improve your application by: waiting to build better credit, increasing your income, reducing the loan amount, or adding a co-applicant with good credit. Think of it as the bank helping you avoid financial stress!";
    }
    
    if (lowerQuestion.includes('co-applicant') || lowerQuestion.includes('guarantor')) {
      return "A co-applicant is like having a financial buddy! They share responsibility for the loan, which gives the bank extra confidence. If you can't pay, your co-applicant can. Choose someone with good credit and stable income - like a spouse, parent, or close relative who trusts you and whom you trust completely.";
    }
    
    if (lowerQuestion.includes('fair') || lowerQuestion.includes('bias')) {
      return "That's an excellent question! AI systems can sometimes be unfair if they learn from biased historical data. That's why explainable AI (like SHAP) is so important - it shows exactly why decisions are made. Banks are working to make AI fairer by checking for bias and ensuring decisions are based on financial factors, not personal characteristics like gender or religion.";
    }
    
    // Default response for unrecognized questions
    return "That's an interesting question! Let me help you understand this better. Loan prediction AI looks at various factors like your income, credit history, loan amount, and personal details to assess risk. The key is that it's trying to predict if you can comfortably repay the loan. Would you like me to explain any specific aspect in more detail? You can ask about credit history, income requirements, or how to improve your chances!";
  };

  const quickQuestions = [
    "What is AI and how does it work?",
    "Why is credit history so important?",
    "How can I improve my loan approval chances?",
    "What if my loan gets rejected?",
    "How does the AI explain its decisions?"
  ];

  const renderFeatureImportance = () => {
    if (!prediction?.feature_importance) return null;

    const sortedFeatures = Object.entries(prediction.feature_importance)
      .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
      .slice(0, 8);

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Feature Importance (SHAP Values)
        </h3>
        <div className="space-y-3">
          {sortedFeatures.map(([feature, importance]) => (
            <div key={feature} className="flex items-center">
              <div className="w-32 text-sm font-medium truncate">{feature}</div>
              <div className="flex-1 mx-3">
                <div className="relative h-6 bg-gray-200 rounded">
                  <div
                    className={`absolute h-full rounded ${
                      importance >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.abs(importance) * 100}%`,
                      left: importance >= 0 ? '50%' : `${50 - Math.abs(importance) * 50}%`
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {importance.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p><span className="inline-block w-4 h-4 bg-green-500 rounded mr-2"></span>Positive values increase approval probability</p>
          <p><span className="inline-block w-4 h-4 bg-red-500 rounded mr-2"></span>Negative values decrease approval probability</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-1 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">AI Loan Predictor</h1>
          </div>
          <p className="text-xl text-gray-600">AI-powered loan approval prediction with explainable insights</p>
        </header>

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-lg p-1 shadow-md">
              <button
                onClick={() => setActiveTab('predict')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'predict'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <Calculator className="inline-block mr-2 h-4 w-4" />
                Prediction
              </button>
             
              <button
                onClick={() => setActiveTab('tutor')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'tutor'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <MessageCircle className="inline-block mr-2 h-4 w-4" />
                AI Tutor
              </button>
            </div>
          </div>

          {activeTab === 'predict' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Loan Application Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={formData.Gender}
                      onChange={(e) => handleInputChange('Gender', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Married</label>
                    <select
                      value={formData.Married}
                      onChange={(e) => handleInputChange('Married', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dependents</label>
                    <select
                      value={formData.Dependents}
                      onChange={(e) => handleInputChange('Dependents', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3+">3+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                    <select
                      value={formData.Education}
                      onChange={(e) => handleInputChange('Education', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Graduate">Graduate</option>
                      <option value="Not Graduate">Not Graduate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Self Employed</label>
                    <select
                      value={formData.Self_Employed}
                      onChange={(e) => handleInputChange('Self_Employed', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Area</label>
                    <select
                      value={formData.Property_Area}
                      onChange={(e) => handleInputChange('Property_Area', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Urban">Urban</option>
                      <option value="Semiurban">Semiurban</option>
                      <option value="Rural">Rural</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Applicant Income</label>
                    <input
                      type="number"
                      value={formData.ApplicantIncome}
                      onChange={(e) => handleInputChange('ApplicantIncome', parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coapplicant Income</label>
                    <input
                      type="number"
                      value={formData.CoapplicantIncome}
                      onChange={(e) => handleInputChange('CoapplicantIncome', parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount (in thousands)</label>
                    <input
                      type="number"
                      value={formData.LoanAmount}
                      onChange={(e) => handleInputChange('LoanAmount', parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loan Term (months)</label>
                    <select
                      value={formData.Loan_Amount_Term}
                      onChange={(e) => handleInputChange('Loan_Amount_Term', parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value={120}>120</option>
                      <option value={180}>180</option>
                      <option value={240}>240</option>
                      <option value={300}>300</option>
                      <option value={360}>360</option>
                      <option value={480}>480</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credit History</label>
                    <select
                      value={formData.Credit_History}
                      onChange={(e) => handleInputChange('Credit_History', parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value={1}>Good (1)</option>
                      <option value={0}>Poor (0)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handlePredict}
                  disabled={loading}
                  className="w-full mt-6 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Predicting...' : 'Predict Loan Approval'}
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Prediction Results</h2>
                
                {prediction ? (
                  <div>
                    <div className={`p-4 rounded-lg mb-6 ${
                      prediction.prediction === 1 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center">
                        {prediction.prediction === 1 ? (
                          <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                        ) : (
                          <XCircle className="h-8 w-8 text-red-600 mr-3" />
                        )}
                        <div>
                          <h3 className={`text-xl font-bold ${
                            prediction.prediction === 1 ? 'text-green-800' : 'text-red-800'
                          }`}>
                            Loan {prediction.prediction_text}
                          </h3>
                          <p className={`text-sm ${
                            prediction.prediction === 1 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            Confidence: {(Math.max(prediction.probability.approved, prediction.probability.rejected) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Probability Breakdown</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Approval Probability:</span>
                          <span className="font-bold text-green-600">
                            {(prediction.probability.approved * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Rejection Probability:</span>
                          <span className="font-bold text-red-600">
                            {(prediction.probability.rejected * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {renderFeatureImportance()}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Fill out the form and click "Predict Loan Approval" to see results</p>
                  </div>
                )}
              </div>
            </div>
          )}
{activeTab === 'tutorial' && (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
      <div className="flex items-center mb-4">
        <Bot className="h-8 w-8 mr-3" />
        <h2 className="text-2xl font-bold">Ask Me About XAI</h2>
      </div>
      <p className="text-indigo-100">Learn how Explainable AI works in loan prediction. Ask your own questions!</p>
    </div>

    <div className="p-6 h-[500px] overflow-y-auto bg-gray-50">
      {chatMessages.map((msg) => (
        <div
          key={msg.id}
          className={`mb-4 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              msg.type === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex items-start">
              {msg.type === 'bot' && <Bot className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" />}
              {msg.type === 'user' && <User className="h-5 w-5 text-white mr-2 mt-0.5" />}
              <div>
                <p className={`text-sm ${msg.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                  {msg.message}
                </p>
                <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {tutorLoading && (
        <div className="mb-4 flex justify-start">
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
            <div className="flex items-center">
              <Bot className="h-5 w-5 text-indigo-600 mr-2" />
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Input Field */}
    <div className="p-4 bg-white border-t">
      <div className="flex space-x-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleTutorQuestion(userInput)}
          placeholder="Ask how SHAP works, what credit history means, etc."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          onClick={() => handleTutorQuestion(userInput)}
          disabled={!userInput.trim() || tutorLoading}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ask
        </button>
      </div>
    </div>
  </div>
)}


          {activeTab === 'tutor' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                <div className="flex items-center mb-4">
                  <Bot className="h-8 w-8 mr-3" />
                  <h2 className="text-2xl font-bold">AI Tutor for Everyone</h2>
                </div>
                <p className="text-indigo-100">Ask me anything about loans and AI in simple language!</p>
              </div>

              <div className="p-6">
                {/* Quick Questions */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <HelpCircle className="mr-2 h-5 w-5 text-indigo-600" />
                    Quick Questions to Get Started
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleTutorQuestion(question)}
                        className="text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                      >
                        <div className="flex items-center">
                          <Lightbulb className="h-4 w-4 text-indigo-600 mr-2 flex-shrink-0" />
                          <span className="text-sm text-indigo-800">{question}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-96 overflow-y-auto p-4 bg-gray-50">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-gray-200'
                        }`}>
                          <div className="flex items-start">
                            {message.type === 'bot' && (
                              <Bot className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                            )}
                            {message.type === 'user' && (
                              <User className="h-5 w-5 text-white mr-2 mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                              <p className={`text-sm ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                                {message.message}
                              </p>
                              <p className={`text-xs mt-1 ${
                                message.type === 'user' ? 'text-indigo-200' : 'text-gray-500'
                              }`}>
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {tutorLoading && (
                      <div className="mb-4 flex justify-start">
                        <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
                          <div className="flex items-center">
                            <Bot className="h-5 w-5 text-indigo-600 mr-2" />
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-white border-t">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTutorQuestion(userInput)}
                        placeholder="Ask me anything about loans, AI, or how to improve your chances..."
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleTutorQuestion(userInput)}
                        disabled={!userInput.trim() || tutorLoading}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Ask
                      </button>
                    </div>
                  </div>
                </div>

                {/* Educational Tips */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                      <Target className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-semibold text-green-800">Improve Your Chances</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      Build good credit, increase income, and choose reasonable loan amounts.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <Brain className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-semibold text-blue-800">Understand AI</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      AI learns from data patterns to make fair and consistent decisions.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center mb-2">
                      <Shield className="h-5 w-5 text-purple-600 mr-2" />
                      <h4 className="font-semibold text-purple-800">Stay Protected</h4>
                    </div>
                    <p className="text-sm text-purple-700">
                      Only borrow what you can afford to repay comfortably.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;