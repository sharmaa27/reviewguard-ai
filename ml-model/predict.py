"""Fake Review Detection - Prediction API"""
import os, sys, json, argparse, joblib, numpy as np, re
from train_model import TextPreprocessor

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(SCRIPT_DIR, 'models')

class ReviewPredictor:
    def __init__(self, model_dir=None):
        self.model_dir = model_dir or MODEL_DIR
        model_path = os.path.join(self.model_dir, 'model.joblib')
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found. Run train_model.py first.")
        self.model = joblib.load(model_path)
        self.vectorizer = joblib.load(os.path.join(self.model_dir, 'vectorizer.joblib'))
        self.preprocessor = None  # Use built-in preprocessing

    def _preprocess(self, text):
        if self.preprocessor: return self.preprocessor.clean(text)
        text = text.lower()
        text = re.sub(r'http\S+|www\S+|[^a-zA-Z\s]', ' ', text)
        return re.sub(r'\s+', ' ', text).strip()

    def predict(self, text):
        if not text or len(text.strip()) < 5:
            return {'prediction':'Invalid','label':-1,'confidence':0,'is_authentic':False,'error':'Text too short'}
        processed = self._preprocess(text)
        if not processed:
            return {'prediction':'Invalid','label':-1,'confidence':0,'is_authentic':False,'error':'Empty after preprocessing'}
        features = self.vectorizer.transform([processed])
        pred = self.model.predict(features)[0]
        try:
            conf = float(max(self.model.predict_proba(features)[0])) if hasattr(self.model,'predict_proba') else float(1/(1+np.exp(-abs(self.model.decision_function(features)[0])))) if hasattr(self.model,'decision_function') else 0.8
        except: conf = 0.8
        return {'prediction':'Fake' if pred==1 else 'Genuine','label':int(pred),'confidence':float(conf),'is_authentic':bool(pred==0)}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('review', nargs='?')
    parser.add_argument('--json', action='store_true')
    parser.add_argument('--serve', action='store_true')
    parser.add_argument('--port', type=int, default=5001)
    args = parser.parse_args()

    if args.serve:
        from flask import Flask, request, jsonify
        from flask_cors import CORS
        app = Flask(__name__)
        CORS(app)
        predictor = ReviewPredictor()
        @app.route('/health')
        def health(): return jsonify({'status':'healthy'})
        @app.route('/predict', methods=['POST'])
        def predict():
            data = request.get_json()
            if not data or 'review' not in data: return jsonify({'error':'Missing review'}), 400
            return jsonify(predictor.predict(data['review']))
        print(f"Flask server on port {args.port}")
        app.run(host='0.0.0.0', port=args.port, debug=False)
    elif args.review:
        result = ReviewPredictor().predict(args.review)
        print(json.dumps(result) if args.json else f"{'✓ GENUINE' if result['is_authentic'] else '✗ FAKE'} ({result['confidence']*100:.0f}%)")
    else:
        print("Usage: python predict.py \"review text\" [--json]")

if __name__ == "__main__":
    main()
