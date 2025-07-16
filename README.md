# 🛠️ AI Ticketing System - Backend (FastAPI)

This is the backend service for the AI Ticketing System. It handles user authentication, ticket creation, AI-powered triaging, moderator assignments, email notifications, and admin-level operations.

---

## 🚀 Tech Stack

* **Framework**: FastAPI
* **Database**: MongoDB (Atlas via `motor`)
* **AI**: Google Gemini API (`google.generativeai`)
* **Email**: Mailtrap SMTP (via `smtplib`, `jinja2`)
* **Authentication**: JWT (bearer tokens)

---

## 📁 Project Structure

```
app/
├── config.py            # Loads environment variables
├── db.py                # MongoDB client setup
├── main.py              # FastAPI entry point
├── models/              # Pydantic & DB models
├── routes/              # API endpoints (auth, ticket, admin)
├── services/            # Core logic (auth, ai, email)
│   ├── ai_service.py
│   ├── email_service.py
│   └── auth_service.py
├── utils/               # Utility helpers
└── ai_rerun_service.py  # Script for AI re-analysis and notifications
```

---

## 🧪 Features

* ✉️ OTP login via registered email
* 🧠 AI triaging via Gemini (required skills, priority, type)
* 🎯 Single ticket assignment to moderators
* 📬 Email notification on assignment
* 🔁 Admin-triggered AI re-analysis and auto-notify
* 🧑 Role-based access (admin, moderator, user)

---

## 🔐 .env Example

```env
# MongoDB
MONGODB_URL=mongodb+srv://...your_connection...

# JWT
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI (Google Gemini)
GEMINI_API_KEY=your_gemini_key

# Email (Mailtrap)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_user
SMTP_PASSWORD=your_pass
FROM_EMAIL=noreply@ticketsystem.com

# App Config
APP_NAME=AI Ticket System
DEBUG=True
```

---

## 🛠️ Key Endpoints

### 🔐 Auth

* `POST /auth/request-otp`
* `POST /auth/verify-otp`

### 🎫 Tickets

* `GET /tickets` (admin)
* `GET /moderator/tickets` (moderator)
* `POST /tickets/create`

### 🔁 Admin

* `GET /admin/users`
* `PATCH /admin/users/{user_id}`
* `POST /admin/rerun-ai` (Re-analyze fallback tickets only)

---

## 📦 Scripts

### ▶️ Manual AI Re-analysis:

```bash
python app/ai_rerun_service.py
```

Triggers AI re-analysis of unresolved tickets with fallback analysis.

---

## 🧠 AI Prompt Logic (Gemini)

Prompts include title + description, and expects structured JSON:

```json
{
  "required_skills": ["list", "of", "skills"],
  "priority": "low|medium|high|urgent",
  "ticket_type": "bug|feature|support|technical|other",
  "helpful_notes": "short advice"
}
```

Fallback is used if Gemini fails, times out, or response is invalid.

---

## ✅ Status

* [x] In progress

---

## 🧑‍💻 Author

Rudra Dubey — [GitHub](https://github.com/dubeyrudra-1808)

---

## 📌 Note

Make sure to **not commit your `.env`** file. It's excluded via `.gitignore`.
