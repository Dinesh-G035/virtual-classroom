<<<<<<< HEAD

# Virtual Classroom

A full-stack virtual classroom app where teachers upload lecture videos and students watch and submit feedback (ratings, emojis, comments). The server performs rule-based sentiment analysis and keyword detection on feedback, generates automated reply suggestions, and aggregates analytics for teachers. The platform also includes accessibility features like auto-captions (from provided subtitle text) and an optional sign-language interpreter overlay while watching.

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
- MongoDB installed locally (or the app uses in-memory fallback automatically)

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

| Role    | Email                 | Password    |
|---------|----------------------|-------------|
| Teacher | sarah@teacher.com    | password123 |
| Teacher | rajesh@teacher.com   | password123 |
| Student | aarav@student.com    | password123 |
| Student | priya@student.com    | password123 |
| Student | dinesh@student.com   | password123 |
| Student | ananya@student.com   | password123 |

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
=======
# Virtual Classroom System

## Overview

Virtual Classroom System is a full-stack web application designed to provide an interactive and efficient online learning experience. The platform enables teachers to upload and manage educational content while allowing students to access learning materials seamlessly. It also integrates AI-powered features to enhance engagement and improve learning outcomes.

## Features

* User Authentication and Authorization (JWT-based)
* Role-Based Access Control (Teacher and Student)
* Video Upload and Management
* Course Creation and Enrollment
* AI-Powered Sentiment Analysis for Student Feedback
* Automatic Caption Generation for Educational Videos
* Responsive User Interface
* Dashboard for Teachers and Students
* Secure Data Management
* Real-Time Notifications (Optional)

## Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Tools & Technologies

* JWT Authentication
* REST APIs
* Git & GitHub
* Figma (UI/UX Design)

## System Architecture

1. Teachers can register and log in to the platform.
2. Teachers create courses and upload video lectures.
3. Students enroll in courses and access the uploaded content.
4. Students provide feedback on courses.
5. AI modules analyze feedback sentiment and generate insights for instructors.
6. The system maintains secure access using JWT-based authentication.

## Project Structure

```text
Virtual-Classroom-System/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── package.json
│
├── README.md
└── .gitignore
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/virtual-classroom-system.git
cd virtual-classroom-system
```

### Install Dependencies

#### Frontend

```bash
cd client
npm install
npm run dev
```

#### Backend

```bash
cd server
npm install
npm start
```

## Environment Variables

Create a `.env` file in the `server` directory and add the following:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## API Endpoints

| Method | Endpoint           | Description           |
| ------ | ------------------ | --------------------- |
| POST   | /api/auth/register | Register a new user   |
| POST   | /api/auth/login    | Login user            |
| GET    | /api/courses       | Fetch all courses     |
| POST   | /api/courses       | Create a new course   |
| POST   | /api/videos/upload | Upload lecture videos |
| POST   | /api/feedback      | Submit feedback       |

## Future Enhancements

* Live Video Classes
* AI-Based Personalized Learning Recommendations
* Attendance Tracking
* Discussion Forums
* Assignment Submission and Evaluation
* Integration with Video Conferencing APIs
* Multi-Language Support

## Contributors

* Dinesh G
* Team Members (if applicable)

## License

This project is licensed under the MIT License.

## Screenshots

Add screenshots of the application interface here.

## Acknowledgements

Special thanks to our mentors, faculty members, and contributors for their guidance and support throughout the development of this project.
>>>>>>> 122bc354e4a10415cb58dc7055b968457e0eea2d
