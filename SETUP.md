# Quick Setup Guide

## Prerequisites
- Python 3.8-3.11 (NOT 3.12)
- Node.js 18+
- GCP Service Account with Vertex AI access

## 1. Clone & Install

```bash
git clone <repo-url>
cd CloudProject
```

## 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## 3. Plagiarism Engine Setup

```bash
cd ..\plagiarism_engine

# Build language parsers (REQUIRED - only once)
python build_languages.py

# Verify build/languages.so was created
```

## 4. GCP Configuration

### Get Service Account Key:
1. Go to [GCP Console](https://console.cloud.google.com)
2. Navigate to: IAM & Admin → Service Accounts
3. Create/Download JSON key for your service account
4. Save it somewhere safe (e.g., `C:\keys\service-account-key.json`)

### Set Environment Variable (Windows):
```cmd
setx GOOGLE_APPLICATION_CREDENTIALS "C:\path\to\your\service-account-key.json"
```
**Note:** Restart your terminal after setting this!

### Update backend/.env:
```env
PROJECT_ID=your-gcp-project-id
LOCATION=us-central1
BUCKET_NAME=your-bucket-name
MODEL_NAME=gemini-2.5-flash
```

## 5. Seed Database

```bash
cd backend
python seed_database.py
```

This creates:
- 7 assignments with 10-15 submissions each
- Real Python code files in `backend/uploads/`
- 1-2 plagiarism pairs per assignment (realistic)

## 6. Run Backend

```bash
cd backend
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`

## 7. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend runs at: `http://localhost:3000`

## Verify Setup

1. Open `http://localhost:3000`
2. Check Dashboard - should show assignments and submissions
3. Click any assignment → "View Plagiarism Report"
4. Should see mostly green (low similarity) with 1-2 red pairs (high similarity)

## Troubleshooting

**"languages.so not found"**
- Run `python build_languages.py` in `plagiarism_engine/` folder
- Check that `plagiarism_engine/build/languages.so` exists

**"GCP authentication failed"**
- Verify `GOOGLE_APPLICATION_CREDENTIALS` is set correctly
- Restart terminal after setting environment variable
- Check service account has Vertex AI permissions

**"Empty dashboard"**
- Run `python seed_database.py` in backend folder
- Check `backend/submissions.db` exists
- Check `backend/uploads/` has .py files

**"All submissions show 100% plagiarism"**
- Delete `backend/submissions.db` and `backend/uploads/*`
- Re-run `python seed_database.py`
- New seed script ensures unique code per student
