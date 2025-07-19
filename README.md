# 🛠️ AI Ticketing System - Full Stack Guide

A modern, AI-powered support ticketing platform that automates triage, assignment, and notifications using Google Gemini and FastAPI, complemented by a sleek React + Vite frontend.

---

<p align="center">
  <figure>
    <img src="https://github.com/user-attachments/assets/54cf71e7-e362-4af7-a96f-b102ce706594" alt="Login Screen" width="600"/>
    <figcaption><strong>Figure 1:</strong> Login Screen</figcaption>
  </figure>
</p>

<p align="center">
  <figure>
    <img src="https://github.com/user-attachments/assets/8610a102-ed01-455f-a321-e5f9ed890063" alt="Admin Panel" width="600"/>
    <figcaption><strong>Figure 2:</strong> Admin Panel</figcaption>
  </figure>
</p>

<p align="center">
  <figure>
    <img src="https://github.com/user-attachments/assets/43d988d9-27c7-405e-a2b0-dbe39cedd8c9" alt="My Tickets" width="600"/>
    <figcaption><strong>Figure 3:</strong> My Tickets Section</figcaption>
  </figure>
</p>

<p align="center">
  <figure>
    <img src="https://github.com/user-attachments/assets/36a38950-b445-4f29-8bba-a3cf879880fb" alt="Sample Ticket" width="600"/>
    <figcaption><strong>Figure 4:</strong> Sample Ticket Detail</figcaption>
  </figure>
</p>

<p align="center">
  <figure>
    <img src="https://github.com/user-attachments/assets/5ea74927-a2b3-4ea8-92d1-35e1728a35d6" alt="Ticket Creation" width="600"/>
    <figcaption><strong>Figure 5:</strong> Ticket Creation Modal</figcaption>
  </figure>
</p>

## 🎯 Table of Contents
1. [Overview](#-overview)
2. [Tech Stack](#-tech-stack)
3. [Prerequisites](#-prerequisites)
4. [Quickstart](#-quickstart)
5. [Detailed Setup](#-detailed-setup)
6. [Environment Configuration](#-environment-configuration)
7. [Project Structure](#-project-structure)
8. [API Reference](#-api-reference)
9. [Workflow](#-workflow)
10. [Troubleshooting](#-troubleshooting)
11. [Deployment](#-deployment)
12. [Contributing](#-contributing)
13. [License](#-license)

## 📖 Overview
AI Ticketing System automates support requests using AI-driven insights and streamlines communication between users, moderators, and admins.

## 🚀 Tech Stack
- **Backend**: FastAPI, Docker, Motor (MongoDB), Pydantic
- **AI**: Google Gemini API
- **Email**: Mailtrap SMTP, jinja2
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons
- **CI/CD**: GitHub Actions, Render (backend), Vercel (frontend)

## 🔧 Prerequisites
- Docker
- Node.js v16+, npm v8+
- MongoDB Atlas or local
- Google Cloud Vertex AI & Gemini API key
- Mailtrap credentials

## ⚡ Quickstart
```bash
git clone https://github.com/dubeyrudra-1808/AI-Ticketing-System.git
cd AI-Ticketing-System

# Backend
docker build -t ai-ticketing-backend .
docker run -d --env-file .env -p 8000:8000 ai-ticketing-backend

# Frontend
cd Frontend/frontend
npm install
npm run dev
```

## 📝 Detailed Setup

### Backend (Docker)
```bash
docker build -t ai-ticketing-backend .
docker run -d --env-file .env -p 8000:8000 ai-ticketing-backend
```

### Frontend
```bash
cd Frontend/frontend
npm install
npm run dev
```

## 🔐 Environment Configuration
```env
MONGODB_URL=...
SECRET_KEY=...
GEMINI_API_KEY=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
FROM_EMAIL=...
REDIS_URL=...
VITE_API_BASE_URL=http://localhost:8000
```

## 📁 Project Structure
```
AI-Ticketing-System/
├── Dockerfile
├── requirements.txt
├── .env.example
├── app/
└── Frontend/
```

## 🔗 API Reference
Visit `/docs` for OpenAPI spec.

## 🔄 Workflow
User → Create Ticket → AI Triage → Moderator Assignment → Email Notification → Resolution

## 🛠️ Troubleshooting
- Increase timeout for AI calls.
- Check SMTP credentials.
- Update CORS origins.

## 🚚 Deployment
- **Backend**: Render (Docker)
- **Frontend**: Vercel or Netlify

## 🤝 Contributing
Fork → Branch → PR

## 📄 License
MIT © 2025 Rudra Dubey
