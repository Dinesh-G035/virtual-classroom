# Virtual Classroom

A full-stack virtual classroom app where teachers upload lecture videos and students watch and submit feedback (ratings, emojis, comments). The server performs rule-based sentiment analysis and keyword detection on feedback, generates automated reply suggestions, and aggregates analytics for teachers.

## Tech Stack

- Client: React + Vite + Tailwind CSS + Recharts
- Server: Node.js + Express + MongoDB (Mongoose) + JWT + Multer + Sentiment (`sentiment` npm package)

## Features

- Authentication & roles (teacher / student) with JWT
- Teacher video upload (multipart), listing, and deletion (owner-only)
- Authenticated video streaming with HTTP range support
- Student feedback submission (one per student per video) with rating + emoji + comment
- Feedback analysis
  - Rule-based sentiment analysis (via `sentiment`)
  - Keyword detection (including education-specific categories like pace/audio/clarity)
  - Automated reply suggestions
- Teacher analytics dashboards (per-video insights + teacher-wide summary)
- Captions
  - Auto-captions from provided subtitle text (preferred)
  - Optional Whisper transcription if `OPENAI_API_KEY` is set
  - Export captions as WebVTT
- Accessibility
  - Optional sign-language interpreter URL or uploaded interpreter video
  - Interpreter overlay synced with the main video

## 🚀 Setup Instructions

### Prerequisites

- Node.js v18+
- MongoDB installed locally

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd Map

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Environment Variables

Create a `.env` file inside the `/server` folder with these keys:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/virtualclassroom
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=sk-...        # Optional — only needed for Whisper captions
```

### Run the App

```bash
# Terminal 1 — start the backend
cd server
npm run dev

# Terminal 2 — start the frontend
cd client
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Demo Accounts

These are created by the seed script on first run (when the DB is empty):

| Role    | Email                | Password    |
|---------|----------------------|-------------|
| Teacher | sample@gmail.com     | Sample      |
| Student | student@gmail.com    | Student123  |

## API Endpoint Table

`Auth` column indicates whether a valid JWT is required (`Authorization: Bearer <token>`).

| Method | Route | Auth | Description |
|---|---|---:|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register user (teacher/student) |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | Yes | Get current user profile |
| POST | `/api/videos` | Yes (Teacher) | Upload a lecture video (multipart `video`) |
| GET | `/api/videos` | Yes | List videos (supports `page`, `limit`, `search`) |
| GET | `/api/videos/teacher/my-videos` | Yes (Teacher) | List the teacher’s own videos |
| GET | `/api/videos/:id` | Yes | Get a single video (increments view count) |
| GET | `/api/videos/stream/:id` | Yes | Stream the video (range-supported). Primary auth is `Authorization` header; query token may be accepted only as a fallback for legacy raw `<video src>` usage. |
| DELETE | `/api/videos/:id` | Yes (Teacher) | Delete a video (owner-only) |
| POST | `/api/videos/:id/generate-captions` | Yes (Teacher) | Generate captions for a video (owner-only) |
| GET | `/api/videos/:id/captions` | Yes | Fetch captions JSON for a video |
| GET | `/api/videos/:id/captions/vtt` | Yes | Download captions as WebVTT |
| PUT | `/api/videos/:id/captions` | Yes (Teacher) | Update captions manually (owner-only) |
| PUT | `/api/videos/:id/sign-interpreter` | Yes (Teacher) | Save sign interpreter URL/reference (owner-only) |
| PUT | `/api/videos/:id/sign-interpreter/upload` | Yes (Teacher) | Upload sign interpreter video (multipart `interpreter`, owner-only) |
| GET | `/api/videos/:id/sign-interpreter/stream` | Yes | Stream sign interpreter video (range-supported) |
| POST | `/api/feedback` | Yes (Student) | Submit feedback (enforced one-per-student-per-video; returns 409 on duplicates) |
| GET | `/api/feedback/video/:videoId` | Yes | List all feedback for a video (includes analysis fields) |
| GET | `/api/feedback/my-feedback` | Yes (Student) | List the student’s feedback history |
| GET | `/api/ai/insights/:videoId` | Yes (Teacher) | Per-video analytics/insights (teacher must own the video) |
| GET | `/api/ai/teacher-summary` | Yes (Teacher) | Teacher-wide analytics summary |

## Known Limitations

- Captions:
  - Without `OPENAI_API_KEY`, Whisper transcription is unavailable; caption generation uses subtitle text if provided, otherwise mock/demo captions.
  - Auto-captions from subtitle text are heuristically timed (not word-level aligned).
- Feedback analysis:
  - Sentiment analysis is local and rule-based (via the `sentiment` package), not an LLM-based classifier.
  - Keyword detection is heuristic/category-based and may miss nuance.

## 🔒 Security Features

✅ JWT authentication on protected routes  
✅ Role-based authorization (Teacher/Student)  
✅ Password hashing with bcryptjs  
✅ One-feedback-per-student-per-video enforcement (409 conflict on duplicates)  
✅ Owner-only video/caption deletion  
✅ CORS enabled  
✅ No static /uploads route — all uploaded files served exclusively through JWT-authenticated streaming endpoint  
✅ JWT token never exposed in video stream URLs — Blob URL approach used in VideoPlayer component (URL.createObjectURL)  
✅ Client-side 500MB file size validation before upload request is sent  

## 📊 Database Models

- **User**: Authentication, roles, profile information
- **Video**: Metadata, file paths, captions, interpreter, tags
- **Feedback**: Student responses with rating/emoji/comment
- **AIResponse**: Sentiment analysis, keywords, automated replies
