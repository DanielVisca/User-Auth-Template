import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/client'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'

const MIN_PASSWORD_LENGTH = 8

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!token) {
      setError('Missing reset token. Use the link from your email.')
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
      await authApi.resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div>
        <h1>Password updated</h1>
        <p>You can log in with your new password. Redirecting…</p>
        <Link to="/login">Log in</Link>
      </div>
    )
  }

  return (
    <div>
      <h1>Set new password</h1>
      {!token && (
        <p style={{ color: '#856404', marginBottom: '1rem' }}>
          Use the link from your password reset email. <Link to="/forgot-password">Request a new link</Link>.
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ maxWidth: '20rem' }}>
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && <p style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</p>}
        <Button type="submit" disabled={loading || !token}>
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        <Link to="/login">Back to log in</Link>
      </p>
    </div>
  )
}
