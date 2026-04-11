# LearnPath AI
`
Full-stack personalized learning platform with a VS Code–inspired UI: React (Vite) + Tailwind frontend, Flask + MongoDB + Google Gemini backend, and Supabase email/password auth.

## Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB running locally on port **27017**
- Gemini API key from [Google AI Studio](https://aistudio.google.com)
- Supabase project from [supabase.com](https://supabase.com)

## Project structure

```
learnpath-ai/   (this folder: v2-gemini-react)
├── backend/
│   ├── app.py
│   ├── .env
│   ├── requirements.txt
│   └── utils/
│       ├── __init__.py
│       ├── ai_engine.py
│       ├── content_generator.py
│       └── db.py
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── supabaseClient.js
        ├── api/
        │   └── learnpath.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── LoadingScreen.jsx
        │   ├── RoadmapView.jsx
        │   ├── BlogView.jsx
        │   ├── QuizView.jsx
        │   ├── ExamView.jsx
        │   ├── ResultView.jsx
        │   ├── ChatBot.jsx
        │   └── FeedbackForm.jsx
        └── pages/
            ├── Login.jsx
            ├── Signup.jsx
            ├── Dashboard.jsx
            ├── NewTopic.jsx
            └── LearnPage.jsx
```

## Features

- **Personalized Learning Paths**: AI-generated roadmaps, chapters, quizzes, and exams
- **Interactive Learning**: Step-by-step content with progress tracking
- **Real-time Chat**: AI-powered assistance during learning sessions
- **Comprehensive Assessments**: Quizzes and exams with scoring
- **User Feedback System**: Collect and store user feedback in MongoDB
- **VS Code-inspired UI**: Modern, dark theme interface
- **Supabase Authentication**: Secure email/password authentication

## Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Copy `backend/.env.example` to `backend/.env` and fill in:

```ini
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=mongodb://localhost:27017
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
JWT_SECRET_KEY=your_jwt_secret_here
```

The default model is **`gemini-2.5-flash`** (stable on the current API). Older ids such as `gemini-1.5-flash` return **404** and are no longer served. To use another model, set optional `GEMINI_MODEL` in `.env` (see [Gemini models](https://ai.google.dev/gemini-api/docs/models)).

Start the API:

```bash
python app.py
```

Server: **http://localhost:5000**

## Frontend

```bash
cd frontend
npm install
```

Copy `frontend/.env.example` to `frontend/.env`:

```ini
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Start the app:

```bash
npm run dev
```

App: **http://localhost:5173**

The Vite dev server proxies `/api` to the Flask backend on port 5000.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Under **Authentication → Providers**, enable **Email**.
3. Copy **Project URL** and **anon public** key into `frontend/.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. You do not need Supabase database tables for this app; auth only.

## MongoDB

Run MongoDB locally. The app uses database `learnpath_db`; collections are created on first write. No manual schema setup is required.

## App URLs

| Service   | URL                     |
| --------- | ----------------------- |
| Frontend  | http://localhost:5173   |
| Backend   | http://localhost:5000   |

## Run order (step by step)

1. Start **MongoDB** on `localhost:27017`.
2. Configure `backend/.env` and `frontend/.env`.
3. From `backend`, activate the venv and run `python app.py`.
4. From `frontend`, run `npm run dev`.
5. Open http://localhost:5173, sign up or log in, create a topic, wait for generation (1–2 minutes), then open the learn workspace.
