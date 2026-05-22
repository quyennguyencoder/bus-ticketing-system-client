import { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  icon?: ReactNode
}

export const Button = ({ className = '', variant = 'primary', icon, children, ...props }: ButtonProps) => (
  <button className={`btn btn-${variant} ${className}`} {...props}>
    {icon}
    {children}
  </button>
)

