import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'

export function HomePage() {
  const { user } = useAuth()
  return (
    <div>
      <h1>Welcome</h1>
      {user ? (
        <p>
          Signed in as <strong>{user.email}</strong>. <Link to="/profile">Go to profile</Link>.
        </p>
      ) : (
        <p>
          <Link to="/login">Log in</Link> or <Link to="/signup">Sign up</Link>.
        </p>
      )}
    </div>
  )
}
