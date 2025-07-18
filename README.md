# 🛠️ AI Ticketing System - Full Stack Guide

A comprehensive, step-by-step guide to **clone**, **setup**, and **run** the AI Ticketing System, covering both **backend** (FastAPI + Docker) and **frontend** (React + Vite + JavaScript).

## 🎯 Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Quickstart Setup](#quickstart-setup)
5. [Detailed Setup](#detailed-setup)
   - [Backend (Docker)](#backend-docker)
   - [Frontend](#frontend)
6. [Environment Configuration](#environment-configuration)
7. [Project Structure](#project-structure)
8. [API Endpoints](#api-endpoints)
9. [Usage Workflow](#usage-workflow)
10. [Troubleshooting](#troubleshooting)
11. [Deployment](#deployment)
12. [Contributing](#contributing)
13. [License](#license)

## 📖 Overview
The **AI Ticketing System** is a full-stack application designed to streamline support workflows using AI:
- **AI Triage**: Automatically classify and prioritize support tickets using Google Gemini.
- **Role Management**: Users, Moderators, and Admins with distinct permissions.
- **Email Notifications**: Automatic email alerts to assigned moderators.
- **Admin Tools**: Re-run AI analysis on fallback tickets.

## 🚀 Tech Stack
| Layer        | Technology                                            |
| ------------ | ----------------------------------------------------- |
| **Backend**  | FastAPI, Docker, Motor (async MongoDB), Pydantic      |
| **AI**       | Google Gemini API (`google-generativeai`)             |
| **Email**    | Mailtrap SMTP, `smtplib`, `jinja2`                    |
| **Auth**     | JWT (PyJWT)                                           |
| **Frontend** | React + Vite + JavaScript, Tailwind CSS, Lucide Icons |
| **CI/CD**    | GitHub Actions, Render (Docker), Vercel               |

## 🔧 Prerequisites
- **Docker** installed locally
- **Node.js** v16+ and **npm** v8+
- **MongoDB Atlas** account or local MongoDB
- **Google Cloud** project with **Vertex AI** enabled
- **Gemini API key** (billing enabled)
- **Mailtrap** or SMTP credentials

## ⚡ Quickstart Setup
```bash
# 1. Clone repository
git clone https://github.com/dubeyrudra-1808/AI-Ticketing-System.git
cd AI-Ticketing-System

# 2. Build and run backend Docker container
docker build -t ai-ticketing-backend .
docker run -d --env-file .env -p 8000:8000 ai-ticketing-backend

# 3. Install and start frontend
cd Frontend/frontend
npm install
npm run dev
```
Visit:
- Backend API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`
- Frontend: `http://localhost:5173`

## 📝 Detailed Setup

### Backend (Docker)
```bash
# Build image
docker build -t ai-ticketing-backend .

# Run container with environment variables
docker run -d --env-file .env -p 8000:8000 ai-ticketing-backend
```
- The Docker container serves FastAPI at port 8000.

### Frontend
```bash
cd Frontend/frontend
npm install
npm run dev
```

## 🔐 Environment Configuration
Create a `.env` file at the project root:
```env
MONGODB_URL=<your_mongo_uri>
SECRET_KEY=<your_jwt_secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=<your_gemini_key>
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=<mailtrap_user>
SMTP_PASSWORD=<mailtrap_pass>
FROM_EMAIL=noreply@ticketsystem.com
REDIS_URL=<your_redis_url>
APP_NAME="AI Ticket System"
DEBUG=True
VITE_API_BASE_URL=http://localhost:8000
```

## 📁 Project Structure
```
AI-Ticketing-System/
├── .gitignore
├── Dockerfile
├── README.md
├── requirements.txt
├── .env.example
├── app/
│   ├── config.py
│   ├── db.py
│   ├── main.py
│   ├── ai_rerun_service.py
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
└── Frontend/
    └── frontend/
        ├── public/
        ├── src/
        ├── package.json
        └── vite.config.ts
```

## 🔗 API Endpoints
### Auth
- `POST /auth/request-otp`
- `POST /auth/verify-otp`
### Tickets
- `POST /tickets`
- `GET  /tickets`
- `GET  /moderator/tickets`
### Admin
- `GET    /admin/users`
- `PATCH  /admin/users/{id}`
- `POST   /admin/rerun-ai`

## 🚀 Usage Workflow
1. Request OTP and verify login.
2. Create tickets as **user**.
3. AI triages and assigns tickets.
4. Moderators receive email and process tickets.
5. Admins can re-run AI analysis as needed.

## 🛠️ Troubleshooting
- **Timeouts**: Increase `timeout` in AI calls.
- **Email issues**: Check SMTP credentials and network.
- **CORS errors**: Update allowed origins in `app/main.py`.

## 🚚 Deployment
- **Backend**: Docker on Render.
- **Frontend**: Vercel or Netlify.
- Set production env vars accordingly.

## 🤝 Contributing
1. Fork the repo.
2. Create a feature branch.
3. Commit and open a PR.

## 📄 License
MIT License © 2025 Rudra Dubey
