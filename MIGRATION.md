# Migration Guide: From v1 to v2

## What Changed

### Original Version (v1)
- **Frontend**: Plain HTML/CSS/JavaScript
- **Backend**: FastAPI
- **AI Provider**: OpenAI (GPT-3.5-turbo)
- **Language**: Python
- **Ecosystem**: Minimal dependencies

### New Version (v2)
- **Frontend**: React 18
- **Backend**: Flask
- **AI Provider**: Google Gemini API
- **Language**: Python + JavaScript
- **Ecosystem**: npm + pip

## File Mapping

| v1 File | v2 Location | Changes |
|---------|-------------|---------|
| index.html | frontend/public/index.html | Simplified, now just a root div |
| styles.css | frontend/src/*.css | Split into component-specific CSS files |
| script.js | frontend/src/components/*.js | Refactored into React components |
| server.py | backend/app.py | Refactored from FastAPI to Flask |
| requirements.txt | backend/requirements.txt | Updated dependencies |

## Frontend Refactoring

### v1 Approach (Vanilla JS)
```javascript
// Direct DOM manipulation
document.getElementById('topicForm').addEventListener('submit', function(event) {
    // 200+ lines of event handlers
    // Document queries scattered throughout
    // State managed via variables & sets
});
```

### v2 Approach (React)
```javascript
// Component-based structure
function TopicForm({ onExamCreated, onLoading }) {
    const [topic, setTopic] = useState('');
    
    const handleSubmit = async (e) => {
        onLoading(true);
        try {
            const data = await createExam(topic);
            onExamCreated(exam, topic);
        } finally {
            onLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input value={topic} onChange={...} />
            <button type="submit">Start Exam</button>
        </form>
    );
}
```

### Benefits
- ✅ Easier to test (components are isolated)
- ✅ Better state management (useState, props)
- ✅ Reusable components
- ✅ Faster development
- ✅ Better maintainability
- ✅ Performance optimizations (React.memo, etc.)

## Backend Refactoring

### v1 FastAPI
```python
from fastapi import FastAPI
from openai import OpenAI

app = FastAPI()

@app.post("/create_exam")
async def create_exam(request: ExamRequest):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(...)
```

### v2 Flask  
```python
from flask import Flask, jsonify
import google.generativeai as genai

app = Flask(__name__)

@app.route('/api/create_exam', methods=['POST'])
def create_exam():
    model = get_model()
    response = model.generate_content(prompt)
```

### Key Differences

| Aspect | v1 (FastAPI) | v2 (Flask) |
|--------|------------|----------|
| **Framework** | FastAPI | Flask |
| **AI Service** | OpenAI (paid) | Google Gemini (free) |
| **Model** | GPT-3.5-turbo | gemini-1.5-flash |
| **Response Timing** | ~3-5 sec | ~5-10 sec* |
| **Cost** | $0.002 / 10 calls | Free (quotas apply) |
| **Setup** | Complex CORS config | Simple CORS config |

*May vary based on load & network

## API Endpoint Changes

### v1 Endpoints
```
POST http://127.0.0.1:8000/create_exam
POST http://127.0.0.1:8000/generate_learning_tree
```

### v2 Endpoints
```
POST http://127.0.0.1:5000/api/create_exam
POST http://127.0.0.1:5000/api/generate_learning_tree
GET http://127.0.0.1:5000/api/health
```

## Environment Setup Comparison

### v1
```bash
# Only backend setup
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY=your_key
python server.py
```

### v2
```bash
# Backend setup
cd backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
export GEMINI_API_KEY=your_key
python app.py

# Frontend setup (new!)
cd frontend
npm install
npm start
```

## Dependency Comparison

### v1 (Python only)
- openai>=1.0.0
- fastapi>=0.100.0
- uvicorn[standard]>=0.20.0
- pydantic>=2.0.0
- python-multipart>=0.0.6

### v2 
**Backend (Python)**
- Flask>=2.3.0
- Flask-CORS>=4.0.0
- google-generativeai>=0.3.0
- python-dotenv>=1.0.0

**Frontend (Node.js)**
- react@^18.2.0
- axios@^1.4.0
- d3@^7.8.5

## Running Both Versions

You can run both v1 and v2 side-by-side:

```
learning-path-recommender/
├── index.html        ← v1 (original)
├── server.py         ← v1 (original)
├── script.js         ← v1 (original)
├── requirements.txt  ← v1 (original)
│
└── v2-gemini-react/  ← v2 (new)
    ├── backend/
    └── frontend/
```

**v1 Access**: http://127.0.0.1:8000 (set up Live Server)
**v2 Access**: http://localhost:3000 (after npm start)

## Migration Path for Users

If you were using v1:

1. **Keep v1 as backup** (don't delete)
2. **Install Node.js** if you don't have it
3. **Follow v2 setup guide** in SETUP_GUIDE.md
4. **Test v2** with same topics as v1
5. **Compare results** - Gemini may give different trees
6. **Gradually transition** to v2
7. **Archive v1** once comfortable

## Known Differences in Output

Since v1 uses OpenAI and v2 uses Gemini:
- 🔄 Tree structures may vary (different models)
- 🔄 Question wording will be different
- 🔄 Exam difficulty might differ slightly
- ✅ Functionality and flow remain the same
- ✅ Color-coding logic is identical

## Rollback Instructions

If you need to go back to v1:

```bash
# Stop v2 services
# (close React dev server & Flask server)

# Use original files
# v1 still exists in parent directory
cd ..
python server.py
# Then open index.html with Live Server
```

## Next Steps

1. ✅ Complete v2 setup (SETUP_GUIDE.md)
2. ⬜ Test with various topics
3. ⬜ Compare v1 vs v2 outputs
4. ⬜ Deploy to cloud (optional)
5. ⬜ Add user authentication (enhancement)
6. ⬜ Build mobile app (future)
