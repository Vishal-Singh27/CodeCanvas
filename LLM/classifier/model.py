import re
import numpy as np
from sklearn.ensemble import RandomForestClassifier

class PredictiveCodeSmellModel:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=50, random_state=42)
        self._initialize_baseline_model()

    def _initialize_baseline_model(self):
        """
        Phase 1: Trains the baseline model on synthetic/historical labeled data.
        Features: [LOC, max_indentation, todo_count, complexity_score, console_logs]
        Labels: 1 (High Bug Probability), 0 (Clean)
        """
        # Dummy training data representing feature vectors of code chunks
        X_train = np.array([
            [10, 1, 0, 2, 0],   # Clean, simple function
            [250, 5, 3, 15, 8], # High risk, deeply nested, many logs
            [15, 2, 0, 3, 1],   # Clean
            [500, 8, 5, 40, 12],# Very high risk, spaghetti code
            [45, 2, 1, 5, 2],   # Clean
        ])
        y_train = np.array([0, 1, 0, 1, 0])
        
        self.model.fit(X_train, y_train)

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
        complexity_score = len(re.findall(r'if |for |while |switch |catch ', code_snippet))
        console_logs = len(re.findall(r'console\.log|print', code_snippet))
        
        return np.array([[loc, max_indent, todo_count, complexity_score, console_logs]])

    def predict_risk(self, code_snippet):
        """
        Predicts the bug probability score. 
        If probability > 0.6, it is routed to Groq LLM for deep analysis.
        """
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
