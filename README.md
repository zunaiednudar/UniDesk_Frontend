# UniDesk

### A Web-Based Learning Management System

> \*\*CSE 3200 – System Development Project\*\*
> Department of Computer Science and Engineering
> Khulna University of Engineering \& Technology
> April 2026

\---

## Authors

|Name|Roll|
|-|-|
|Md. Zunaied Nudar|2107041|
|A. K. M Samioul Islam|2107051|

**Supervisor:** Dr. Al-Mahmud, Professor, Dept. of CSE, KUET

\---

## Overview

UniDesk is a full-stack, web-based Learning Management System designed to provide a **unified academic environment** for students, faculty, and administrators. It addresses key limitations of existing platforms (Google Classroom, Moodle, Canvas) by integrating real-time communication, plagiarism detection, appointment scheduling, and supervisor management into a single cohesive platform.

\---

## Key Features

|Feature|Description|
|-|-|
|Course Management|Create courses, upload materials \& announcements, manage enrollments|
|Assignment System|Submit assignments, auto-plagiarism check, grading \& feedback|
|Real-Time Messaging|Socket.IO-powered instant messaging between students and faculty|
|Notifications|Real-time and scheduled (cron) notifications for important events|
|Appointment Scheduling|Book, approve, and manage faculty–student meetings|
|Supervisor Management|Assign supervisors and manage student research relationships|
|Academic Repository|Centralized shared repository for notes, past papers, and resources|
|Plagiarism Detection|TF-IDF similarity analysis + Serper API for online checking|
|Role-Based Access Control|Separate dashboards and permissions for Student, Faculty, and Admin|

\---

## Technology Stack

|Layer|Technology|Purpose|
|-|-|-|
|**Frontend**|React.js, Tailwind CSS, Axios, Material UI, Daisy UI|UI rendering \& API handling|
|**Backend**|Node.js, Express.js|REST API \& server-side logic|
|**Database**|MongoDB + Mongoose|Primary data store \& schema modeling|
|**Plagiarism DB**|PostgreSQL|Submission corpus storage|
|**Authentication**|Firebase Authentication + Admin SDK|Secure login \& token verification|
|**Real-Time**|Socket.IO (WebSocket)|Messaging \& live notifications|
|**File Storage**|Cloudinary|File/media upload \& CDN delivery|
|**Plagiarism Tools**|pdf-parse, mammoth, multer, Serper API|Text extraction \& online similarity checking|
|**Scheduling**|Node-cron|Automated reminders \& notifications|
|**Email**|Nodemailer|Email notification delivery|
|**DevOps**|GitHub Actions|CI/CD automation|
|**Project Mgmt**|ClickUp|Development task tracking|
|**Deployment**|Render|Hosting frontend \& backend|

\---

## System Architecture

UniDesk uses a **client-server architecture** with a separate plagiarism microservice:

```
Client Layer
  └── UniDesk Frontend (React.js)
        ├── REST API  ──────────────────► Node.js + Express.js (Server)
        ├── WebSocket ──────────────────► Socket.IO Server (Real-time)
        └── Auth SDK  ──────────────────► Firebase Auth
                                              │
                              ┌───────────────┴───────────────┐
                              │                               │
                           MongoDB                     Plagiarism Microservice
                    (users, courses,                  (TF-IDF + PostgreSQL +
                   assignments, chat)                      Serper API)
```

**Authentication Flow:** Firebase Auth → ID Token → Backend verification → MongoDB user lookup → Role assignment

\---

## Getting Started

### Prerequisites

* Node.js (v18+)
* MongoDB Atlas or local MongoDB instance
* PostgreSQL (for plagiarism service)
* Firebase project with Authentication enabled
* Cloudinary account
* Serper API key

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/unidesk.git
cd unidesk

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install plagiarism service dependencies
cd ../plagiarism-service
npm install
```

### Running the Application

```bash
# Start backend
cd backend \&\& npm start

# Start plagiarism microservice
cd plagiarism-service \&\& npm start

# Start frontend
cd frontend \&\& npm run dev
```

\---

## User Roles

### Student

* Enroll in courses using invitation code
* Submit assignments (with auto plagiarism check)
* View grades and feedback
* Chat with faculty in real-time
* Book faculty appointments
* Upload/download from academic repository

### Faculty

* Create and manage courses
* Upload assignments, materials, announcements
* Grade submissions and provide feedback
* Manage appointment availability
* Assign and track supervised students

### Admin

* Approve/suspend user accounts
* Moderate academic repository
* Manage system-wide settings and statistics
* View all users, courses, and reports

\---

## Testing Results

All core features passed testing:

|Feature|Status|
|-|-|
|User Management (CRUD)|Pass|
|Course Management|Pass|
|Appointment System|Pass|
|Notification System|Pass|
|Real-Time Messaging|Pass|
|Plagiarism Detection|Pass|
|File Upload Integration|Pass|
|End-to-End Integration|Pass|

\---

## Limitations

* No mobile application (web-only)
* No AI-based personalized learning recommendations (planned)
* Plagiarism detection is TF-IDF based — advanced ML models not yet integrated

\---

## Future Work

* **Mobile App** — React Native application for Android/iOS
* **AI Recommendation** — RAG-based system for personalized study suggestions
* **OBE Integration** — Outcome-Based Education tracking per course
* **Enhanced Plagiarism** — Advanced ML-based similarity detection

\---

## License

This project was developed for academic purposes as part of CSE 3200 – System Development Project at KUET. All custom code and architecture was developed from scratch.

\---

## Acknowledgments

Special thanks to **Dr. Al-Mahmud** for his guidance and supervision throughout the project. We also acknowledge the open-source community whose libraries and tools made this project possible.

