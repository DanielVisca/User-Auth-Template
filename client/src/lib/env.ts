/** Only VITE_* env vars are exposed to the client. Dev: use /api so Vite proxy hits backend. */
export const API_BASE = import.meta.env.VITE_API_URL ?? '/api'
