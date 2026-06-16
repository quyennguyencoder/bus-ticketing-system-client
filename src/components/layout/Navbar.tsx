import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bus, LogOut, Ticket, User, LayoutDashboard, Search, Home } from 'lucide-react'
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
    <div style={{ position: 'fixed', top: '16px', left: 0, right: 0, zIndex: 1000, padding: '0 24px', display: 'flex', justifyContent: 'center' }}>
      <header style={{
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        borderRadius: '24px',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '1200px',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)', color: 'white', padding: '10px', borderRadius: '14px', display: 'flex', boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)' }}>
            <Bus size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontSize: '20px', color: '#0f172a', lineHeight: '1.2', fontWeight: 800 }}>BusTicket</strong>
            <small style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.02em' }}>Hành trình của bạn</small>
          </div>
        </Link>

        <nav style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.4)', padding: '6px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)' }}>
          <NavLink to="/" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`} end>
            <Home size={16} /> Trang chủ
          </NavLink>
          <NavLink to="/trips/search" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
            <Search size={16} /> Tìm chuyến
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/my-orders" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
              <Ticket size={16} /> Đơn của tôi
            </NavLink>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {(user?.roles?.includes('ADMIN') || user?.roles?.includes('STAFF')) && (
            <Button variant="outline" onClick={() => navigate('/admin/dashboard')} icon={<LayoutDashboard size={16} />} style={{ borderRadius: '14px', background: 'rgba(15, 118, 110, 0.05)', color: '#0f766e', borderColor: 'rgba(15, 118, 110, 0.2)' }}>
              Quản trị
            </Button>
          )}
          
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '6px 6px 6px 16px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{user?.fullName?.split(' ').pop() || 'User'}</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e2e8f0', color: '#64748b' }}>
                  {user?.avatar ? (
                    <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:8080/api/v1/files/${user.avatar}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : <User size={16} />}
                </div>
              </Link>
              <Button variant="ghost" onClick={handleLogout} style={{ padding: '8px', minWidth: 'auto', borderRadius: '50%', color: '#ef4444', background: '#fef2f2' }} title="Đăng xuất">
                <LogOut size={16} />
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="ghost" onClick={() => navigate('/login')} style={{ borderRadius: '14px', color: '#475569', fontWeight: 600 }}>Đăng nhập</Button>
              <Button onClick={() => navigate('/register')} style={{ borderRadius: '14px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white', fontWeight: 600, boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)' }}>Đăng ký</Button>
            </div>
          )}
        </div>
        
        <style>{`
          .nav-link-custom {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            text-decoration: none;
            color: #64748b;
            font-size: 14px;
            font-weight: 600;
            border-radius: 12px;
            transition: all 0.2s ease;
          }
          .nav-link-custom:hover {
            color: #0f172a;
            background: rgba(255,255,255,0.7);
          }
          .nav-link-custom.active {
            color: #0f766e;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
        `}</style>
      </header>
    </div>
  )
}

