# Backend API contract

Any backend (FastAPI, Flask, Node, Go, etc.) can power the React app by implementing this contract.

## Base URL

- Development: frontend uses `/api` (proxied to backend) or `VITE_API_URL`.
- Production: set `VITE_API_URL` to the backend root (e.g. `https://api.example.com`).

All requests that need an authenticated user must send the session cookie (the React app uses `credentials: 'include'`).

## Endpoints

### POST /auth/register

Create a new user.

- **Body:** `{ "email": string, "password": string, "full_name"?: string }`
- **Validation:** Email format; password min length 8 (enforce server-side).
- **Response:** `200` + `{ "id", "email", "full_name", "is_verified", "is_active" }`
- **Errors:** `400` if email already registered or validation fails.
- **Server:** Hash password (bcrypt/argon2) before storing. Optionally send verification email.

### POST /auth/login

Authenticate and set session.

- **Body:** `{ "email": string, "password": string }`
- **Response:** `200` + user object (same shape as register) and **Set-Cookie** with httpOnly session (e.g. JWT).
- **Cookie:** `HttpOnly`, `Secure` in production, `SameSite=Strict` or `Lax`.
- **Errors:** `401` invalid credentials; `403` if user inactive.

### POST /auth/logout

Clear session.

- **Response:** `200` + `{ "message": string }` and **Clear cookie** (Set-Cookie with past expiry or empty).

### GET /auth/me

Current user from session cookie.

- **Response:** `200` + user object, or `401` if no/invalid cookie.

### POST /auth/forgot-password

Request a password reset.

- **Body:** `{ "email": string }`
- **Response:** `200` + `{ "message": string }` (e.g. "If that email is registered…"). Always return 200 to avoid email enumeration.
- **Server:** Create short-lived token, store it, send link (e.g. `FRONTEND_URL/reset-password?token=...`) by email.

### POST /auth/reset-password

Set new password using token from email.

- **Body:** `{ "token": string, "new_password": string }`
- **Response:** `200` + `{ "message": string }`
- **Errors:** `400` if token invalid or expired.

### GET /auth/verify-email

Verify email from link.

- **Query:** `token=string`
- **Response:** `200` + `{ "message": string }`
- **Errors:** `400` if token invalid or expired.

## Security (server-side)

- Hash passwords with bcrypt or argon2 only on the server.
- Use HTTPS in production.
- Set cookies: `httpOnly`, `secure`, `sameSite`.
- Validate and sanitize all inputs; rate limit auth endpoints.
- Do not log or return passwords or tokens in responses.
