"""WSGI entry point for production deployment."""
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from train_model import TextPreprocessor
from predict import ReviewPredictor

app = Flask(__name__)
CORS(app)
predictor = ReviewPredictor()

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data or 'review' not in data:
        return jsonify({'error': 'Missing review'}), 400
    return jsonify(predictor.predict(data['review']))

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    app.run(host='0.0.0.0', port=port)
