import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authApi } from '@/api/client'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Missing verification token.')
      return
    }
    setStatus('loading')
    authApi
      .verifyEmail(token)
      .then((res) => {
        setStatus('ok')
        setMessage(res.message)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Verification failed.')
      })
  }, [token])

  if (status === 'idle' || status === 'loading') {
    return <p>Verifying your email…</p>
  }

  return (
    <div>
      <h1>Email verification</h1>
      <p style={{ color: status === 'ok' ? '#0f5132' : '#dc3545' }}>{message}</p>
      <p>
        <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}
