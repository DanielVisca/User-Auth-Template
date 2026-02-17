import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, id, ...props }: InputProps) {
  const inputId = id ?? label.replace(/\s+/g, '-').toLowerCase()
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={inputId} style={{ display: 'block', marginBottom: '0.25rem' }}>
        {label}
      </label>
      <input
        id={inputId}
        style={{
          width: '100%',
          maxWidth: '20rem',
          padding: '0.5rem',
          border: error ? '1px solid #dc3545' : '1px solid #ced4da',
          borderRadius: '4px',
        }}
        {...props}
      />
      {error && <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  )
}
