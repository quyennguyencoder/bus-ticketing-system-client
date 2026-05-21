import { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => (
  <label className={`field ${className}`}>
    <span>{label}</span>
    <input {...props} />
    {error ? <small className="field-error">{error}</small> : null}
  </label>
)

