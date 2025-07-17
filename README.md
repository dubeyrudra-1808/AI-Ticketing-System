🛠️ AI Ticketing System - Full Stack Guide

  

A comprehensive, step-by-step guide to clone, setup, and run the AI Ticketing System, covering both backend (FastAPI) and frontend (React + Vite + JavaScript).

🎯 Table of Contents

Overview

Tech Stack

Prerequisites

Quickstart Setup

Detailed Setup

Backend

Frontend

Environment Configuration

Project Structure

API Endpoints

Usage Workflow

Troubleshooting

Deployment

Contributing

License

📖 Overview

The AI Ticketing System is a full-stack application designed to streamline support workflows using AI:

AI Triage: Automatically classify and prioritize support tickets using Google Gemini.

Role Management: Users, Moderators, and Admins with distinct permissions.

Email Notifications: Automatic email alerts to assigned moderators.

Admin Tools: Re-run AI analysis on fallback tickets.

This guide helps developers get up and running quickly, whether setting up locally or deploying to production.

🚀 Tech Stack

Layer

Technology

Backend

FastAPI, Motor (async MongoDB), Pydantic

AI

Google Gemini API (google.generativeai)

Email

Mailtrap SMTP, smtplib, jinja2

Auth

JWT (PyJWT)

Frontend

React + Vite + JavaScript, Tailwind CSS, Lucide Icons

CI/CD

GitHub Actions

🔧 Prerequisites

Node.js v16+ and npm v8+

Python 3.9+

MongoDB Atlas account or local MongoDB

Google Cloud project with Vertex AI enabled

Gemini API key (billing enabled)

Mailtrap or SMTP credentials

⚡ Quickstart Setup

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

Visit:

API: http://localhost:8000

Docs: http://localhost:8000/docs

Frontend: http://localhost:5173

📝 Detailed Setup

Backend

Activate virtual environment

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

Install dependencies

pip install -r requirements.txt

Run server

uvicorn app.main:app --reload --port 8000

Frontend

Navigate to frontend directory

cd Frontend/frontend

Install npm packages

npm install

Launch dev server

npm run dev

🔐 Environment Configuration

Copy .env.example to .env and fill values:

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

Note: .env is in .gitignore to prevent committing secrets.

📁 Project Structure

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

🔗 API Endpoints

Auth

POST /auth/request-otp – Request login OTP

POST /auth/verify-otp – Verify OTP and get JWT

Tickets

POST /tickets/create – Create a new ticket

GET /tickets – List all tickets (admin)

GET /moderator/tickets – List assigned tickets (moderator)

Admin

GET /admin/users – List users

PATCH /admin/users/{id} – Update user role/skills

POST /admin/rerun-ai – Re-run AI on fallback tickets

🚀 Usage Workflow

Login via OTP endpoints.

User creates a ticket.

AI triages ticket automatically.

Admin assigns to a moderator.

Moderator receives email and sees assigned tickets.

Admin re-runs AI when needed.

🛠️ Troubleshooting

Gemini timeouts: Increase timeout in ai_service to 20s.

No tickets: Ensure assigned_to is stored as ObjectId.

Email failures: Verify SMTP credentials and network.

CORS errors: Configure FastAPI CORS middleware for frontend origin.

🚚 Deployment

Dockerize: Create Dockerfile for backend and frontend.

CI/CD: Use GitHub Actions to build & deploy on push.

Hosting Backends: Heroku, AWS ECS, DigitalOcean Apps.

Hosting Frontend: Vercel or Netlify. Set VITE_API_URL in deployment env.

🤝 Contributing

Fork the repo

Create feature branch

Commit changes

Open Pull Request

📄 License

MIT License. See LICENSE for details.

© 2025 Rudra Dubey

