import { ReactNode } from 'react'

export const EmptyState = ({ title, children }: { title: string; children?: ReactNode }) => (
  <div className="state">
    <h2>{title}</h2>
    {children ? <p>{children}</p> : null}
  </div>
)

