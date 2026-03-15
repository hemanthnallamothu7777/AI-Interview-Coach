# AI Interview Coach 🎯

An AI-powered technical interview simulator where you practice with an intelligent interviewer that asks questions, evaluates answers, gives detailed feedback, and scores your performance.

---

## Features

- **5-question AI Interview** — OpenAI generates personalized questions based on your role and difficulty
- **Real-time Answer Evaluation** — Each answer is scored (1–10) with specific feedback and improvement tips
- **Text & Voice Modes** — Type answers or speak them via your microphone (Web Speech API)
- **AI Follow-up Questions** — The AI digs deeper after each answer
- **Final Interview Report** — Overall score, strengths, weaknesses, and a concrete improvement plan
- **Session Timer** — 30-minute interview timer with visual warning
- **Beautiful Dark UI** — Glassmorphism + gradient design system

---

## Tech Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Frontend  | React 18 + Vite, Tailwind CSS, Axios  |
| Backend   | Python FastAPI, Uvicorn               |
| AI        | OpenAI API (GPT-4o-mini)              |
| Voice     | Web Speech API + LiveKit (optional)   |
| Real-time | WebSocket (FastAPI)                   |

---

## Project Structure

```
AI Interview coach/
├── Backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── routes/
│   │   ├── interview.py         # Session start, evaluate, WebSocket
│   │   └── evaluation.py        # Final report generation
│   ├── services/
│   │   ├── ai_service.py        # OpenAI integration
│   │   └── livekit_service.py   # LiveKit room & token management
│   ├── models/
│   │   └── interview_models.py  # Pydantic request/response models
│   └── utils/
│       └── prompt_templates.py  # All OpenAI prompts
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ChatWindow.jsx    # Message thread renderer
    │   │   ├── QuestionCard.jsx  # Progress bar + metadata
    │   │   ├── ScoreCard.jsx     # Evaluation result card
    │   │   └── VoiceControls.jsx # Mic recording UI
    │   ├── pages/
    │   │   ├── Home.jsx          # Interview setup
    │   │   ├── Interview.jsx     # Main interview page
    │   │   └── Results.jsx       # Final report page
    │   ├── services/
    │   │   ├── api.js            # Axios API client
    │   │   └── livekit.js        # LiveKit + Speech API wrappers
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## Setup Guide

### 1. Get an OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Copy the key (starts with `sk-...`)

> **Cost estimate**: GPT-4o-mini costs ~$0.15/1M input tokens. A full 5-question interview costs roughly $0.01–$0.03.

---

### 2. (Optional) Set up LiveKit for Voice Mode

Voice mode works **without LiveKit** using the browser's built-in Web Speech API. LiveKit is only needed if you want multi-party audio rooms.

To enable LiveKit:
1. Create a free account at [https://cloud.livekit.io](https://cloud.livekit.io)
2. Create a new project and copy:
   - **API Key** (e.g., `APIxxxxxxxx`)
   - **API Secret**
   - **WebSocket URL** (e.g., `wss://your-project.livekit.cloud`)

---

### 3. Configure Backend Environment

```bash
cd Backend
cp .env.example .env
```

Edit `.env`:
```env
OPENAI_API_KEY=sk-your-key-here

# Only needed for LiveKit voice rooms (optional):
LIVEKIT_API_KEY=APIxxxxxxxx
LIVEKIT_API_SECRET=your_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
```

---

### 4. Run the Backend

```bash
cd Backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate      # macOS/Linux
# venv\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

API will be available at: `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

---

### 5. Run the Frontend

```bash
cd Frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## API Reference

### `POST /interview/start`
Start a new interview session.

**Request:**
```json
{
  "role": "React Developer",
  "difficulty": "Medium",
  "interview_type": "text",
  "num_questions": 5
}
```

**Response:**
```json
{
  "session_id": "uuid",
  "questions": ["Q1?", "Q2?", "Q3?", "Q4?", "Q5?"],
  "room_name": null,
  "livekit_token": null
}
```

---

### `POST /interview/evaluate`
Evaluate a candidate's answer.

**Request:**
```json
{
  "session_id": "uuid",
  "question": "Explain React's virtual DOM",
  "answer": "The virtual DOM is...",
  "role": "React Developer",
  "question_index": 0
}
```

**Response:**
```json
{
  "score": 7,
  "feedback": "Good explanation of virtual DOM but missing reconciliation details",
  "improvement": "Mention the diffing algorithm and how React batches updates",
  "follow_up": "How does React decide when to re-render a component?"
}
```

---

### `POST /evaluation/report`
Generate the final interview report.

**Response:**
```json
{
  "overall_score": 7.4,
  "strengths": ["Strong React fundamentals", "Good understanding of hooks"],
  "weaknesses": ["Shallow knowledge of performance optimization"],
  "improvement_plan": ["Study React.memo and useMemo", "Practice system design questions"],
  "summary": "Solid mid-level candidate with strong React knowledge..."
}
```

---

### `WebSocket /interview/ws/{session_id}`
Real-time connection for voice interview mode.

**Send:**
```json
{"type": "answer", "answer": "transcribed speech text"}
```

**Receive:**
```json
{
  "type": "evaluation",
  "data": { "score": 7, "feedback": "...", "improvement": "..." },
  "question_index": 0,
  "is_complete": false
}
```

---

## Voice Mode Notes

Voice interview mode uses two browser APIs (no extra cost):

- **`SpeechRecognition`** — captures microphone input and converts to text
- **`SpeechSynthesis`** — reads AI questions aloud

**Browser support**: Chrome and Edge work best. Firefox has limited support.

When the AI finishes speaking a question, the mic activates automatically. Your answer is transcribed in real time and submitted when you pause speaking.

---

## Running in Production

### Backend
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend
```bash
npm run build
# Serve the dist/ folder with nginx or any static host
```

Remember to update the CORS origins in `Backend/main.py` to match your production domain.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `OPENAI_API_KEY` error | Check your `.env` file and ensure the key is valid |
| Voice mode not working | Use Chrome/Edge; allow microphone permissions |
| CORS errors | Ensure backend is running on port 8000 |
| Questions not loading | Check browser console and backend logs for errors |
| LiveKit errors | Voice mode works without LiveKit — ignore these if not using rooms |

---

## License

MIT — free for personal and commercial use.
