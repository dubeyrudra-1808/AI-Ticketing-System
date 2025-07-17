
# 🛠️ AI Ticketing System - Full Stack Guide

A comprehensive, step-by-step guide to **clone**, **setup**, and **run** the AI Ticketing System, covering both **backend** (FastAPI) and **frontend** (React + Vite + JavaScript).

## 🎯 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Quickstart Setup](#quickstart-setup)
5. [Detailed Setup](#detailed-setup)
   - [Backend](#backend)
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

This guide helps developers get up and running quickly, whether setting up locally or deploying to production.

## 🚀 Tech Stack

| Layer        | Technology                                            |
| ------------ | ----------------------------------------------------- |
| **Backend**  | FastAPI, Motor (async MongoDB), Pydantic              |
| **AI**       | Google Gemini API (`google.generativeai`)             |
| **Email**    | Mailtrap SMTP, `smtplib`, `jinja2`                    |
| **Auth**     | JWT (PyJWT)                                           |
| **Frontend** | React + Vite + JavaScript, Tailwind CSS, Lucide Icons |
| **CI/CD**    | GitHub Actions                                        |

## 🔧 Prerequisites

- **Node.js** v16+ and **npm** v8+
- **Python** 3.9+
- **MongoDB Atlas** account or local MongoDB
- **Google Cloud** project with **Vertex AI** enabled
- **Gemini API key** (billing enabled)
- **Mailtrap** or SMTP credentials

## ⚡ Quickstart Setup

```bash
# 1. Clone repository
git clone https://github.com/dubeyrudra-1808/AI-Ticketing-System.git
cd AI-Ticketing-System

# 2. Setup backend
bash setup.sh    # Creates venv, installs Python deps & frontend deps

# 3. Create .env file
cp .env.example .env
# Edit .env with your credentials

# 4. Start servers
# Terminal 1: Backend
env/bin/activate && uvicorn app.main:app --reload
# Terminal 2: Frontend
cd Frontend/frontend && npm run dev
```

Visit:

- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- Frontend: `http://localhost:5173`

## 📝 Detailed Setup

### Backend

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd Frontend/frontend
npm install
npm run dev
```

## 🔐 Environment Configuration

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
VITE_API_URL=http://localhost:8000
APP_NAME="AI Ticket System"
DEBUG=True
```

> **Note**: `.env` is in `.gitignore` to prevent committing secrets.

## 📁 Project Structure

```
AI-Ticketing-System/
├── .gitignore
├── README.md
├── requirements.txt
├── setup.sh
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

- `POST /tickets/create`
- `GET /tickets`
- `GET /moderator/tickets`

### Admin

- `GET /admin/users`
- `PATCH /admin/users/{id}`
- `POST /admin/rerun-ai`

## 🚀 Usage Workflow

1. **Login** via OTP endpoints.
2. **User** creates a ticket.
3. **AI triages** ticket automatically.
4. **Admin** assigns to a moderator.
5. **Moderator** receives email and sees assigned tickets.
6. **Admin** re-runs AI when needed.

## 🛠️ Troubleshooting

- **Gemini timeouts**: Increase `timeout` in `ai_service`.
- **Email failures**: Verify SMTP credentials and network.
- **CORS errors**: Configure FastAPI CORS middleware.

## 🚚 Deployment

- **Docker** backend and frontend separately.
- **CI/CD** with GitHub Actions.
- **Host** backend (Heroku, ECS, etc.), frontend (Vercel, Netlify).
- **Set** production env vars for secure deployment.

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Open Pull Request

## 📄 License

MIT License. See LICENSE file for details.

© 2025 Rudra Dubey
