import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', type = 'button', children, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      style={{
        padding: '0.5rem 1rem',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        backgroundColor: variant === 'primary' ? '#0d6efd' : '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
      }}
      {...props}
    >
      {children}
    </button>
  )
}
