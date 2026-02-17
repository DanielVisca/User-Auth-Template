import { AuthProvider } from '@/auth/AuthContext'
import { Routes } from '@/routes'

export function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  )
}
