# Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                           │
│              (http://localhost:3000)                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ TopicForm    │  │ Exam Display │  │ TreeVisualization│ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
│         │                │                     │             │
└─────────┼────────────────┼─────────────────────┼─────────────┘
          │                │                     │
          └────────────────┼─────────────────────┘
                           │ axios (JSON)
          ┌────────────────┼──────────────────┐
          │                │                  │
          ▼                ▼                  ▼
    ┌──────────────┬──────────────┬──────────────────┐
    │  POST        │   POST       │   GET             │
    │/create_exam  │/generate_    │/health            │
    │              │learning_tree │                   │
    └──────────────┴──────────────┴──────────────────┘
          │                │                  │
          └────────────────┼──────────────────┘
                           │
┌──────────────────────────────────────────────────────────────┐
│              Flask Backend API                               │
│            (http://127.0.0.1:5000)                          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        Route Handlers                               │   │
│  │  - /api/create_exam                                 │   │
│  │  - /api/generate_learning_tree                      │   │
│  │  - /api/health                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│              │                │                              │
│              │                │                              │
│         ┌────▼────┐      ┌────▼──────────┐                 │
│         │ JSON    │      │ Google Gemini │                 │
│         │ Parsing │      │ API Calls     │                 │
│         └────┬────┘      │                │                 │
│              │           │ - generate_    │                 │
│              │           │   content()    │                 │
│              │           │                │                 │
│              │           │ returns: text  │                 │
│              │           └────┬───────────┘                 │
│              │                │                             │
│              └────────┬───────┘                             │
│                       │                                     │
│              ┌────────▼────────┐                           │
│              │ JSON Validation │                           │
│              │ & Formatting    │                           │
│              └────────┬────────┘                           │
│                       │                                    │
│                       ▼                                    │
│            ┌──────────────────┐                           │
│            │ Response to      │                           │
│            │ Frontend (JSON)  │                           │
│            └──────────────────┘                           │
└──────────────────────────────────────────────────────────────┘
                       │
                       │
                 ┌─────▼──────┐
                 │  Google    │
                 │  Gemini    │
                 │  Models    │
                 │  (Remote)  │
                 └────────────┘
```

## Data Flow

### 1. Exam Generation Flow
```
User Input (Topic)
    ↓
Frontend: TopicForm → captures & validates input
    ↓
Frontend: Sends POST /api/create_exam with {topic}
    ↓
Backend: Receives request → formats prompt
    ↓
Backend: Calls genai.GenerativeModel.generate_content()
    ↓
Google Gemini API: Generates exam JSON
    ↓
Backend: Cleans response → validates JSON → returns
    ↓
Frontend: Parses exam → displays Exam component
    ↓
User: Answers questions
```

### 2. Answer Submission Flow
```
User answers all 10 questions
    ↓
Frontend (Exam.js): Tracks:
  - Correct/incorrect for each subtopic
  - answersBySubtopic map
    ↓
User clicks "Create Learning Tree"
    ↓
Frontend: Extracts answers by subtopic
    ↓
Frontend: Sends POST /api/generate_learning_tree
    ↓
Backend: Receives subtopic answers
    ↓
Backend: Formats prompt with subtopic names
    ↓
Backend: Calls Gemini to generate tree structure
    ↓
Google Gemini API: Returns tree JSON (3+ levels)
    ↓
Backend: Validates JSON → returns to frontend
    ↓
Frontend: Parses tree → visualizes with D3.js
    ↓
User: Sees color-coded learning tree
```

## Component Hierarchy

```
App (main state holder)
├── Header
│   ├── Title
│   ├── Description
│   └── Backend Status
├── Main
│   ├── TopicForm (if exam not started)
│   │   ├── Input field
│   │   └── Submit button
│   ├── Exam (when taking exam)
│   │   ├── Question cards
│   │   │   ├── Question statement
│   │   │   └── Option buttons
│   │   └── Progress bar
│   ├── TreeContainer (when showing results)
│   │   ├── TreeVisualization
│   │   │   └── D3.js SVG tree
│   │   └── Legend
│   └── Reset button
└── Footer
```

## Technology Stack Details

### Frontend (React)
- **React 18**: Component-based UI
- **Axios**: HTTP client for API calls
- **D3.js**: Interactive data visualization
- **CSS3**: Modern styling with gradients & transitions

### Backend (Python)
- **Flask**: Lightweight web framework
- **Flask-CORS**: Enable cross-origin requests
- **google-generativeai**: Official Google Gemini library
- **python-dotenv**: Environment variable management

### External APIs
- **Google Generative AI API**: 
  - Model: gemini-1.5-flash
  - Used for exam generation
  - Used for tree generation

## State Management

### Frontend State (in App.js)
```javascript
- exam: null | exam object
- topic: string
- loading: boolean
- examResults: null | {correctSubtopics, incorrectSubtopics, answersBySubtopic}
- backendStatus: 'checking' | 'online' | 'offline'
```

### Answer Tracking (in Exam.js)
```javascript
- answeredQuestions: number
- correctSubtopics: Set<string>
- incorrectSubtopics: Set<string>
- answersBySubtopic: {subtopic: [true/false, ...]}
- answered: {questionId: boolean}
```

## Error Handling

### Frontend
- API errors caught via .catch() in axios calls
- User shown error message in alerts
- Backend status displayed in header

### Backend
- Route-level try-catch blocks
- JSON validation with try-except
- Returns HTTP error codes (400, 500) with messages

## Performance Considerations

1. **Exam Generation**: ~5-10 seconds (Gemini API latency)
2. **Tree Generation**: ~5-10 seconds (Gemini API latency)
3. **D3 Visualization**: Instant rendering (<500ms)
4. **Frontend Bundle**: ~500KB (React + D3 + dependencies)

## Security Notes

1. **API Keys**: Stored in .env, never committed to git
2. **CORS**: Restricted to localhost ports 3000 & 5000
3. **No Authentication**: Currently public (add auth for production)
4. **HTTPS**: Not required for localhost, add for production
5. **Rate Limiting**: Not implemented (consider for production)
