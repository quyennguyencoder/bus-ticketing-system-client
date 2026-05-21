import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'

export const RoleRoute = ({ roles }: { roles: string[] }) => {
  const user = useAuthStore((state) => state.user)
  const roleText = user?.roles || ''

  if (!roles.some((role) => roleText.includes(role))) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

