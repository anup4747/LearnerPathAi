# v2-Gemini-React - Setup and Deployment Guide

This is the modern version of Learning Path Recommender with:
- **Frontend**: React 18 (runs on port 3000)
- **Backend**: Flask with Google Gemini API (runs on port 5000)
- **Database**: None (stateless architecture)

## Quick Start (5 minutes)

### Step 1: Get Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows
# or
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your API key
# Windows (in PowerShell)
cp .env.example .env
# or manually create .env with:
# GEMINI_API_KEY=your_key_here

# Start the server
python app.py
# Server will run on http://127.0.0.1:5000
```

### Step 3: Setup Frontend

```bash
# In a new terminal, navigate to frontend folder
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm start
# App will open at http://localhost:3000
```

## Project Structure

```
v2-gemini-react/
├── backend/
│   ├── app.py                 # Flask server with API endpoints
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Environment variables template
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── App.css           # App styling
│   │   ├── index.js          # React entry point
│   │   ├── index.css         # Global styles
│   │   ├── api/
│   │   │   └── client.js     # API communication layer
│   │   └── components/
│   │       ├── TopicForm.js      # Topic input form
│   │       ├── TopicForm.css
│   │       ├── Exam.js           # Exam display & question handling
│   │       ├── Exam.css
│   │       ├── TreeContainer.js  # Tree generation orchestrator
│   │       ├── TreeContainer.css
│   │       ├── TreeVisualization.js  # D3.js visualization
│   │       └── TreeVisualization.css
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── .gitignore
│   └── README.md
│
└── README.md
```

## How It Works

### 1. User enters a topic
- Frontend sends POST request to `/api/create_exam`
- Backend uses Google Gemini to generate 10 questions
- Questions are shown to user

### 2. User answers questions
- Answers are tracked on frontend
- System identifies correct/incorrect for each subtopic
- Progress bar shows completion

### 3. System generates learning tree
- Frontend sends POST request to `/api/generate_learning_tree` with answers
- Backend uses Gemini to create hierarchical topic tree (3+ levels deep)
- Tree is visualized with D3.js

### 4. Color-coding
- **Green**: Topics user got correct (Strengths)
- **Red**: Topics user got wrong (Areas for Improvement)  
- **Gray**: New topics in tree (To Be Explored)

## API Reference

### Create Exam
```
POST /api/create_exam
Content-Type: application/json

Request:
{
  "topic": "Deep Learning"
}

Response:
{
  "exam": "{...json string...}"
}
```

### Generate Learning Tree
```
POST /api/generate_learning_tree
Content-Type: application/json

Request:
{
  "mainTopic": "Deep Learning",
  "subtopics": [
    {
      "name": "Neural Networks",
      "answers": [true, false, true]
    },
    {
      "name": "Backpropagation",
      "answers": [false, true]
    }
  ]
}

Response:
{
  "tree": "{...json tree structure...}"
}
```

### Health Check
```
GET /api/health

Response:
{
  "status": "healthy"
}
```

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (requires 3.8+)
- Ensure virtual environment is activated
- Verify `GEMINI_API_KEY` is set in `.env`
- Check port 5000 is not in use: `netstat -an | grep 5000`

### Frontend won't start
- Ensure Node.js is installed: `node --version` (requires 14+)
- Delete `node_modules` and try `npm install` again
- Clear npm cache: `npm cache clean --force`
- Check port 3000 is not in use

### Backend shows "401 Unauthorized"
- Verify API key is correct in `.env`
- Re-generate key from Google AI Studio
- Restart backend after updating `.env`

### CORS errors
- Ensure backend is running on `http://127.0.0.1:5000`
- Ensure frontend is running on `http://localhost:3000`
- Check backend CORS configuration in `app.py`

## Development

### Adding new components
```bash
cd frontend/src/components
# Create YourComponent.js and YourComponent.css
```

### Modifying API endpoints
- Edit `backend/app.py`
- Update `frontend/src/api/client.js` if needed
- Restart backend (CTRL+C then python app.py)

### Updating Gemini prompts
- Edit the prompt strings in `backend/app.py`
- Look for `f"""` strings in the route handlers
- Restart backend for changes to take effect

## Future Enhancements

- [ ] User authentication & saving results
- [ ] Database to store exams and learning trees
- [ ] Difficulty levels (Easy, Medium, Hard)
- [ ] Multi-language support
- [ ] PDF export of learning path
- [ ] Spaced repetition for weak areas
- [ ] Mobile app version

## License

MIT License - feel free to use and modify!

## Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Verify both servers are running
3. Check browser console for errors
4. Check terminal output for backend errors

---

**Version**: 2.0.0  
**Last Updated**: 2024
