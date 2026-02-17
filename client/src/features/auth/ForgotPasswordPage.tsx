import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '@/api/client'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    setLoading(true)
    try {
      await authApi.forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div>
        <h1>Check your email</h1>
        <p>If that email is registered, you will receive a password reset link.</p>
        <p>
          <Link to="/login">Back to log in</Link>
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1>Forgot password</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '20rem' }}>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        <Link to="/login">Back to log in</Link>
      </p>
    </div>
  )
}
