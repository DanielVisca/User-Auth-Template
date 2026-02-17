import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/client'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'

const MIN_PASSWORD_LENGTH = 8

export function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await authApi.register({
        email: email.trim(),
        password,
        full_name: fullName.trim() || undefined,
      })
      navigate('/login', { replace: true, state: { message: 'Account created. Please log in.' } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '20rem' }}>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Full name (optional)"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && <p style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </Button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        <Link to="/login">Already have an account? Log in</Link>
      </p>
    </div>
  )
}
