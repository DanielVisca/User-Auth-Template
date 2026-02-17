# User Account Auth Template

Production-style scaffolding for a React app with full user functionality (signup, login, password reset, email verification) and a FastAPI backend with SQLite. Use as a template for any site that requires user accounts.

For scaling to ~1M users (React, API, DB, bottlenecks, infrastructure), see [SCALING_ROADMAP.md](SCALING_ROADMAP.md).

## What lives where

| Responsibility | React app (client) | Backend (FastAPI) |
|----------------|-------------------|-------------------|
| Passwords | Never hashed or stored; submit over HTTPS | Bcrypt hashing, verification |
| Session | Sends cookies with requests; reads auth state from `/auth/me` | Issues httpOnly cookie (JWT); validates on protected routes |
| Auth UI | Login, signup, forgot/reset password, profile | Register, login, logout, forgot/reset, verify-email |
| Protected routes | Route guard redirects to login | `/auth/me` and any protected API return 401 if invalid |

- **Client**: `client/` — Vite + React + TypeScript + React Router. Only `VITE_*` env vars.
- **Server**: `server/` — FastAPI + SQLAlchemy (async) + SQLite. All secrets in env.

## Quick start

### 1. Backend

```bash
cd server
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env        # edit if needed
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Database file `auth.db` is created in `server/` on first run.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173. The dev server proxies `/api` to the backend (port 8000), so login/signup work without CORS.

### 3. Production

- Set `VITE_API_URL` to your backend URL (e.g. `https://api.example.com`).
- Backend: set `SECRET_KEY`, `COOKIE_SECURE=true`, use HTTPS, and optionally switch to PostgreSQL via `DATABASE_URL`.
- See `server/.env.example` and `docs/backend-api.md` for all options.

## Project layout

```
client/                 # React SPA
  src/
    api/                # API client (credentials: 'include')
    auth/                # AuthContext, useAuth
    components/         # Layout, Button, Input
    features/auth/      # Login, Signup, Forgot/Reset, Verify
    features/profile/   # Profile page
    routes/             # Router, ProtectedRoute
    lib/                 # env (VITE_API_URL)
    types/

server/                 # FastAPI
  app/
    api/                # auth routes, deps (get_current_user)
    core/               # security (hash, JWT), email stub
    models/             # User, PasswordResetToken, EmailVerifyToken
    schemas/            # Pydantic request/response
  requirements.txt
  .env.example

docs/
  backend-api.md        # API contract (any backend can implement this)
```

## API (backend contract)

- `POST /auth/register` — sign up (body: email, password, optional full_name)
- `POST /auth/login` — log in (sets httpOnly session cookie)
- `POST /auth/logout` — clear cookie
- `GET /auth/me` — current user (401 if not authenticated)
- `POST /auth/forgot-password` — send reset link (body: email)
- `POST /auth/reset-password` — set new password (body: token, new_password)
- `GET /auth/verify-email?token=...` — verify email

OpenAPI: http://localhost:8000/docs when the backend is running.

## Reusing as a template

1. Copy this repo (or `client/` + `server/` + `docs/backend-api.md`).
2. Point the client at your backend with `VITE_API_URL`, or keep the FastAPI backend and change DB/email as needed.
3. Replace branding, add more profile fields or protected routes as required.
