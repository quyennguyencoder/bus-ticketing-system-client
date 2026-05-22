import { SelectHTMLAttributes } from 'react'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
}

export const Select = ({ label, error, className = '', children, ...props }: SelectProps) => (
  <label className={`field ${className}`}>
    <span>{label}</span>
    <select {...props}>{children}</select>
    {error ? <small className="field-error">{error}</small> : null}
  </label>
)

