import re
import os
import numpy as np
import joblib

class PredictiveCodeSmellModel:
    def __init__(self):
        # Load the pre-trained Random Forest model
        model_path = os.path.join(os.path.dirname(__file__), 'rf_code_smell_model.pkl')
        try:
            self.model = joblib.load(model_path)
        except Exception as e:
            print("Warning: Could not load model. Ensure Train_Model.ipynb was executed.")
            self.model = None

    def extract_features(self, code_snippet):
        """Extracts structural features from the raw code string for ML processing."""
        lines = code_snippet.split('\n')
        loc = len(lines)
        
        # Calculate max indentation (proxy for nested complexity)
        max_indent = 0
        for line in lines:
            indent = len(line) - len(line.lstrip())
            if indent > max_indent:
                max_indent = indent
                
        todo_count = len(re.findall(r'TODO|FIXME', code_snippet, re.IGNORECASE))
        cyclomatic_complexity = len(re.findall(r'if |for |while |switch |catch ', code_snippet))
        console_logs = len(re.findall(r'console\.log|print', code_snippet))
        
        return np.array([[loc, max_indent, todo_count, cyclomatic_complexity, console_logs]])

    def predict_risk(self, code_snippet):
        """
        Predicts the bug probability score. 
        If probability > 0.6, it is routed to Groq LLM for deep analysis.
        """
        if not self.model:
            return {"error": "Model not loaded."}
            
        features = self.extract_features(code_snippet)
        probability = self.model.predict_proba(features)[0][1] # Probability of class 1
        
        return {
            "bug_probability": round(probability, 2),
            "requires_llm_analysis": probability > 0.6,
            "features_extracted": {
                "lines_of_code": int(features[0][0]),
                "cyclomatic_complexity": int(features[0][3])
            }
        }

if __name__ == "__main__":
    # Test the model execution
    sample_code = """
    function calculateData() {
        // TODO: optimize this later
        for(let i=0; i<100; i++) {
            if (i % 2 == 0) {
                console.log(i);
            }
        }
    }
    """
    ml_filter = PredictiveCodeSmellModel()
    result = ml_filter.predict_risk(sample_code)
    print("ML Pipeline Output:", result)
