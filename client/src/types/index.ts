export interface User {
  id: number
  email: string
  full_name: string | null
  is_verified: boolean
  is_active: boolean
}

export interface ApiError {
  detail: string | { msg: string; loc?: string[] }[]
}
