import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bus, LogOut, Ticket, User, LayoutDashboard } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuthStore } from '../../stores/auth.store'

export const Navbar = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="app-header site-header">
      <Link to="/" className="site-brand">
        <span className="site-brand__icon">
          <Bus size={22} />
        </span>
        <span className="site-brand__text">
          <strong>BusTicket</strong>
          <small>Đặt vé nhanh, rõ ràng, an toàn</small>
        </span>
      </Link>

      <nav className="site-nav" aria-label="Điều hướng chính">
        <NavLink to="/trips/search" className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`}>
          Tìm chuyến
        </NavLink>
        {isAuthenticated ? (
          <NavLink to="/my-orders" className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`}>
            Đơn của tôi
          </NavLink>
        ) : null}
      </nav>

      <div className="site-actions">
        {user?.roles?.includes('ADMIN') || user?.roles?.includes('STAFF') ? (
          <NavLink to="/admin/dashboard" className={({ isActive }) => `site-action-link site-action-link--admin ${isActive ? 'is-active' : ''}`}>
            <LayoutDashboard size={16} />
            <span>Quản trị</span>
          </NavLink>
        ) : null}

        {isAuthenticated ? (
          <>
            <Link to="/profile" className="site-user-pill">
              <span className="site-user-pill__avatar">
                <User size={15} />
              </span>
              <span className="site-user-pill__meta">
                <strong>{user?.fullName || 'Người dùng'}</strong>
                <small>{user?.email}</small>
              </span>
            </Link>
            <Button variant="ghost" className="site-logout" onClick={handleLogout} icon={<LogOut size={16} />}>
              Thoát
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" className="site-login" onClick={() => navigate('/login')} icon={<User size={16} />}>
              Đăng nhập
            </Button>
            <Button className="site-register" onClick={() => navigate('/register')} icon={<Ticket size={16} />}>
              Đăng ký
            </Button>
          </>
        )}
      </div>
    </header>
  )
}

