import { useAuth } from '@/auth/AuthContext'

export function ProfilePage() {
  const { user } = useAuth()
  if (!user) return null
  return (
    <div>
      <h1>Profile</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Name:</strong> {user.full_name ?? '—'}</p>
      <p><strong>Verified:</strong> {user.is_verified ? 'Yes' : 'No'}</p>
    </div>
  )
}
