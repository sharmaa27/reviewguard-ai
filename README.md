# ReviewGuard AI - Fake Review Detection

## MCA Major Project | BIT Mesra, Jaipur Campus

## Architecture

```
frontend (React)  →  backend (Node/Express)  →  ml-model (Flask/Python)
  Static Site           Web Service                Web Service
                              ↕
                          MongoDB Atlas
```

## Local Development

### 1. ML Model Service
```bash
cd ml-model
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py  # Runs on :5002
```

### 2. Backend
```bash
cd backend
cp .env.example .env  # Edit with your MongoDB URI
npm install && npm start  # Runs on :5001
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install && npm start  # Runs on :3000
```

## Deploy to Render

### Option A: Blueprint (Recommended)
1. Push this repo to GitHub
2. Go to Render Dashboard → **New** → **Blueprint**
3. Connect your GitHub repo
4. Render detects `render.yaml` and creates all 3 services
5. Set `MONGODB_URI` in the backend service environment variables
6. Set `FRONTEND_URL` in backend to your frontend's Render URL

### Option B: Manual Setup
Create 3 services in Render:

**Service 1: reviewguard-ml** (Web Service, Python)
- Root Directory: `ml-model`
- Build: `pip install -r requirements.txt && python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet'); nltk.download('punkt_tab')"`
- Start: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`

**Service 2: reviewguard-backend** (Web Service, Node)
- Root Directory: `backend`
- Build: `npm install`
- Start: `node server.js`
- Env vars: `MONGODB_URI`, `ML_SERVICE_URL` (= ML service URL), `FRONTEND_URL` (= frontend URL)

**Service 3: reviewguard-frontend** (Static Site)
- Root Directory: `frontend`
- Build: `npm install && npm run build`
- Publish Directory: `build`
- Env vars: `REACT_APP_API_URL` (= backend URL), `CI=false`
- Add rewrite rule: `/*` → `/index.html`

### Post-Deploy
1. Hit `POST <backend-url>/api/products/seed` to populate sample products
2. Visit frontend URL

## Environment Variables

| Service  | Variable          | Value                          |
|----------|-------------------|--------------------------------|
| Backend  | MONGODB_URI       | Your MongoDB Atlas connection  |
| Backend  | ML_SERVICE_URL    | Render ML service URL          |
| Backend  | FRONTEND_URL      | Render frontend URL            |
| Backend  | PORT              | 10000 (Render default)         |
| Frontend | REACT_APP_API_URL | Render backend URL             |
| Frontend | CI                | false                          |
