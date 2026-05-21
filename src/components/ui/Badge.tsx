import { ReactNode } from 'react'

export const Badge = ({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) => (
  <span className={`badge badge-${tone}`}>{children}</span>
)

