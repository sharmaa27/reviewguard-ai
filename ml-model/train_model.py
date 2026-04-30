"""
╔════════════════════════════════════════════════════════════════════════════╗
║            AI-BASED FAKE REVIEW AND SPAM DETECTION SYSTEM                 ║
║                        Machine Learning Module                             ║
╠════════════════════════════════════════════════════════════════════════════╣
║  Authors    : Harpreet Singh Arora (MCA/25013/24)                         ║
║               Vipul Sharma (MCA/25016/24)                                 ║
║  Supervisor : Dr. Seema Gaur, Assistant Professor                         ║
║  Institution: Birla Institute of Technology, Mesra - Jaipur Campus        ║
╠════════════════════════════════════════════════════════════════════════════╣
║  Dataset    : Kaggle Fake Reviews Dataset (40,432 reviews)                ║
║  URL        : kaggle.com/datasets/mexwell/fake-reviews-dataset            ║
╚════════════════════════════════════════════════════════════════════════════╝

USAGE:
    1. pip install -r requirements.txt
    2. Download dataset from Kaggle, place in data/ folder
    3. python train_model.py
    4. Model saved to models/ folder
"""

import os
import sys
import json
import warnings
import pandas as pd
import numpy as np
from datetime import datetime

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix
import joblib

import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

warnings.filterwarnings('ignore')

for pkg in ['punkt', 'stopwords', 'wordnet', 'punkt_tab']:
    try: nltk.download(pkg, quiet=True)
    except: pass


class TextPreprocessor:
    """Advanced NLP text preprocessing pipeline."""
    
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        try:
            self.stop_words = set(stopwords.words('english'))
        except:
            self.stop_words = {'i','me','my','we','you','he','she','it','they','a','an','the','and','but','or','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','this','that'}
        self.stop_words -= {'not','no','never','nothing','very','too','more','most','less','really','only','just'}

    def clean(self, text):
        if pd.isna(text) or not isinstance(text, str): return ""
        text = text.lower()
        text = re.sub(r'http\S+|www\S+|https\S+', '', text)
        text = re.sub(r'<.*?>', '', text)
        text = re.sub(r'\S+@\S+', '', text)
        text = re.sub(r'[^a-zA-Z\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        tokens = [self.lemmatizer.lemmatize(t) for t in text.split() if t not in self.stop_words and len(t) > 1]
        return ' '.join(tokens)


class FakeReviewDetector:
    """Main ML training and prediction class."""
    
    def __init__(self, model_dir='models'):
        self.model_dir = model_dir
        self.preprocessor = TextPreprocessor()
        self.vectorizer = None
        self.model = None
        self.best_model_name = None
        self.metrics = {}
        os.makedirs(model_dir, exist_ok=True)

    def load_dataset(self, data_dir='data'):
        print("\n" + "━"*60)
        print("📂 LOADING DATASET")
        print("━"*60)
        
        files = ['fake reviews dataset.csv', 'fake_reviews_dataset.csv', 'dataset.csv']
        path = next((os.path.join(data_dir, f) for f in files if os.path.exists(os.path.join(data_dir, f))), None)
        
        if not path:
            print("\n❌ Dataset not found!")
            print("📥 Download from: https://www.kaggle.com/datasets/mexwell/fake-reviews-dataset")
            print(f"📁 Place CSV in: {os.path.abspath(data_dir)}/")
            sys.exit(1)
        
        df = pd.read_csv(path)
        print(f"✓ Loaded {len(df):,} reviews")
        
        text_col = next((c for c in df.columns if 'text' in c.lower()), None)
        label_col = next((c for c in df.columns if 'label' in c.lower()), None)
        
        df['text'] = df[text_col].astype(str)
        df['label'] = df[label_col].map({'CG': 1, 'OR': 0}) if 'CG' in df[label_col].values else df[label_col].astype(int)
        df = df.dropna(subset=['text', 'label'])
        
        print(f"  Genuine: {(df['label']==0).sum():,} | Fake: {(df['label']==1).sum():,}")
        return df

    def preprocess(self, df):
        print("\n" + "━"*60)
        print("🔄 PREPROCESSING TEXT")
        print("━"*60)
        df['processed'] = df['text'].apply(self.preprocessor.clean)
        df = df[df['processed'].str.len() > 0]
        print(f"✓ Processed {len(df):,} reviews")
        return df

    def train(self, df):
        print("\n" + "━"*60)
        print("🤖 TRAINING MODELS")
        print("━"*60)
        
        X, y = df['processed'].values, df['label'].values
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        self.vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(1,2), min_df=2, max_df=0.95, sublinear_tf=True)
        X_train_vec, X_test_vec = self.vectorizer.fit_transform(X_train), self.vectorizer.transform(X_test)
        
        models = {
            'Naive Bayes': MultinomialNB(alpha=0.1),
            'Linear SVM': LinearSVC(C=1.0, max_iter=5000, random_state=42),
            'Logistic Regression': LogisticRegression(C=1.0, max_iter=1000, random_state=42),
        }
        
        best_f1, best_model = 0, None
        print(f"\n{'Model':<22} {'Accuracy':>10} {'Precision':>10} {'Recall':>10} {'F1':>10}")
        print("─"*64)
        
        for name, model in models.items():
            model.fit(X_train_vec, y_train)
            pred = model.predict(X_test_vec)
            acc, prec, rec, f1 = accuracy_score(y_test, pred), precision_score(y_test, pred), recall_score(y_test, pred), f1_score(y_test, pred)
            print(f"{name:<22} {acc:>10.4f} {prec:>10.4f} {rec:>10.4f} {f1:>10.4f}")
            if f1 > best_f1: best_f1, best_model, self.best_model_name = f1, model, name
        
        self.model = best_model
        print(f"\n🏆 Best: {self.best_model_name} (F1: {best_f1:.4f})")
        
        self.metrics = {'model': self.best_model_name, 'accuracy': float(accuracy_score(y_test, self.model.predict(X_test_vec))),
                       'f1_score': float(best_f1), 'vocab_size': len(self.vectorizer.vocabulary_), 'trained_at': datetime.now().isoformat()}

    def save(self):
        print("\n" + "━"*60)
        print("💾 SAVING MODEL")
        print("━"*60)
        joblib.dump(self.model, f'{self.model_dir}/model.joblib')
        joblib.dump(self.vectorizer, f'{self.model_dir}/vectorizer.joblib')
        joblib.dump(self.preprocessor, f'{self.model_dir}/preprocessor.joblib')
        with open(f'{self.model_dir}/metrics.json', 'w') as f: json.dump(self.metrics, f, indent=2)
        print(f"✓ Saved to {self.model_dir}/")

    def predict(self, text):
        processed = self.preprocessor.clean(text)
        features = self.vectorizer.transform([processed])
        pred = self.model.predict(features)[0]
        conf = 1/(1+np.exp(-abs(self.model.decision_function(features)[0]))) if hasattr(self.model,'decision_function') else max(self.model.predict_proba(features)[0]) if hasattr(self.model,'predict_proba') else 0.8
        return {'prediction': 'Fake' if pred==1 else 'Genuine', 'label': int(pred), 'confidence': float(conf), 'is_authentic': pred==0}


def main():
    print("\n" + "═"*60)
    print("  AI-BASED FAKE REVIEW DETECTION SYSTEM")
    print("  Model Training Pipeline")
    print("═"*60)
    
    detector = FakeReviewDetector()
    df = detector.load_dataset()
    df = detector.preprocess(df)
    detector.train(df)
    detector.save()
    
    print("\n" + "━"*60)
    print("🧪 TESTING")
    print("━"*60)
    tests = ["Amazing product! Best ever! Must buy! Perfect!", "Good headphones for the price. Battery lasts 6 hours."]
    for t in tests:
        r = detector.predict(t)
        print(f"\n\"{t[:50]}...\"" if len(t)>50 else f"\n\"{t}\"")
        print(f"  → {'✓ GENUINE' if r['is_authentic'] else '✗ FAKE'} ({r['confidence']*100:.0f}%)")
    
    print("\n" + "═"*60)
    print("  ✅ TRAINING COMPLETE!")
    print("═"*60 + "\n")


if __name__ == "__main__":
    main()
