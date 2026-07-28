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
