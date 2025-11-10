import React from 'react'
import { Loader2 } from 'lucide-react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  icon,
  iconPosition = 'left',
  className = '', 
  children, 
  disabled,
  ...props 
}: ButtonProps) {
  const base = 'btn '
  const sizeCls = size === 'xs' ? 'btn-xs' : size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : 'btn-md'
  const variantCls = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger'
  }[variant]

  const isDisabled = disabled || loading

  return (
    <button 
      className={`${base} ${sizeCls} ${variantCls} ${className}`} 
      disabled={isDisabled}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  )
}