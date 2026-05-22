import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  BusFront,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  PanelLeftClose,
  Settings,
  Shield,
  Ticket,
  Users,
  User,
  Circle,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuthStore } from '../../stores/auth.store'

type AdminSubMenuItem = {
  label: string
  path: string
}

type AdminMenuGroup = {
  key: string
  label: string
  icon: typeof BusFront
  items: AdminSubMenuItem[]
}

const menuGroups: AdminMenuGroup[] = [
  {
    key: 'orders',
    label: 'Quản lý Đơn hàng',
    icon: Ticket,
    items: [{ label: 'Tất cả đơn hàng', path: '/admin/orders' }],
  },
  {
    key: 'trips',
    label: 'Điều hành Chuyến xe',
    icon: BusFront,
    items: [
      { label: 'Danh sách chuyến xe', path: '/admin/trips' },
      { label: 'Quản lý trạng thái ghế', path: '/admin/seats' },
    ],
  },
  {
    key: 'routes',
    label: 'Tuyến đường & Điểm đỗ',
    icon: Map,
    items: [
      { label: 'Tỉnh thành & Điểm đỗ', path: '/admin/points' },
      { label: 'Tuyến đường', path: '/admin/routes' },
      { label: 'Trạm dừng', path: '/admin/route-stops' },
    ],
  },
  {
    key: 'users',
    label: 'Tài khoản & Phân quyền',
    icon: Users,
    items: [{ label: 'Danh sách người dùng', path: '/admin/users' }],
  },
  {
    key: 'profile',
    label: 'Cá nhân',
    icon: Settings,
    items: [{ label: 'Hồ sơ của tôi', path: '/admin/profile' }],
  },
]

const isPathActive = (pathname: string, path: string) => pathname === path || pathname.startsWith(`${path}/`)

const isGroupActive = (pathname: string, group: AdminMenuGroup) => group.items.some((item) => isPathActive(pathname, item.path))

const getInitialOpenGroups = (pathname: string) =>
  menuGroups.reduce<Record<string, boolean>>((accumulator, group) => {
    accumulator[group.key] = isGroupActive(pathname, group)
    return accumulator
  }, {})

export const AdminSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => getInitialOpenGroups(location.pathname))

  useEffect(() => {
    setOpenGroups((current) => {
      const next = { ...current }
      menuGroups.forEach((group) => {
        if (isGroupActive(location.pathname, group)) {
          next[group.key] = true
        }
      })
      return next
    })
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((current) => ({
      ...current,
      [groupKey]: !current[groupKey],
    }))
  }

  return (
    <aside className={`admin-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="admin-sidebar__header">
        <Link to="/admin/dashboard" className="admin-sidebar__brand" title="Tổng quan">
          <Shield size={24} />
          <span className="admin-sidebar__label">Admin Center</span>
        </Link>

        <button
          type="button"
          className="admin-sidebar__collapse"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {collapsed ? <Menu size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Admin navigation">
        <NavLink
          to="/admin/dashboard"
          title="Tổng quan"
          className={({ isActive }) => `admin-sidebar__link ${isActive ? 'is-active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span className="admin-sidebar__label">Tổng quan</span>
        </NavLink>

        {menuGroups.map((group) => {
          const active = isGroupActive(location.pathname, group)
          const open = openGroups[group.key] || active
          const Icon = group.icon

          return (
            <div key={group.key} className="admin-sidebar__group">
              <button
                type="button"
                className={`admin-sidebar__group-trigger ${active ? 'is-active' : ''}`}
                onClick={() => toggleGroup(group.key)}
                aria-expanded={open}
                title={group.label}
              >
                <Icon size={18} />
                <span className="admin-sidebar__label">{group.label}</span>
                <span className="admin-sidebar__chevron">{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
              </button>

              {open ? (
                <div className="admin-sidebar__submenu">
                  {group.items.map((item) => {
                    const itemActive = isPathActive(location.pathname, item.path)
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        title={item.label}
                        className={`admin-sidebar__sublink ${itemActive ? 'is-active' : ''}`}
                      >
                        <Circle size={10} />
                        <span className="admin-sidebar__label">{item.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        })}
      </nav>

      <div className="admin-sidebar__footer">
        <Link to="/admin/profile" className="admin-sidebar__user-pill" title="Hồ sơ của tôi">
          <User size={16} />
          <span className="admin-sidebar__user-text">{user?.fullName || user?.email || 'Administrator'}</span>
        </Link>
        <Button variant="ghost" onClick={handleLogout} icon={<LogOut size={16} />}>
          <span className="admin-sidebar__label">Thoát</span>
        </Button>
      </div>
    </aside>
  )
}
