import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  variant?: 'default' | 'sm' | 'lg'
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  iconLeft,
  iconRight,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const inputClasses = {
    default: 'input',
    sm: 'input input-sm',
    lg: 'input input-lg'
  }[variant]

  return (
    <div className="space-y-1">
      {label && (
        <label className="label">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="flex items-center gap-2">
        {iconLeft && (
          <div className="flex items-center text-gray-500 dark:text-gray-400" aria-hidden="true">
            {iconLeft}
          </div>
        )}

        <input
          ref={ref}
          className={`${inputClasses} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className} flex-1`}
          aria-invalid={!!error}
          {...props}
        />

        {iconRight && (
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            {iconRight}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input