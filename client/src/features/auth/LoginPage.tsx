import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Email and password are required.')
      return
    }
    setLoading(true)
    try {
      const user = await authApi.login({ email: email.trim(), password })
      setUser(user)
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '20rem' }}>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        <Link to="/forgot-password">Forgot password?</Link> · <Link to="/signup">Sign up</Link>
      </p>
    </div>
  )
}
