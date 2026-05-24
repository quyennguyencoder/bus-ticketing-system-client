import React, { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  Search,
  User,
  Mail,
  Phone,
  Shield,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  UserMinus,
  Edit2
} from 'lucide-react'
import { userService } from '../../services/user.service'
import { UserResponse } from '../../types/response'
import { UserRole, UserStatus } from '../../types/enums'
import { getApiErrorMessage } from '../../utils/api-error'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination & Filtering state
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Edit Profile Modal State
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)

  const size = 10

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await userService.getAllUsers(page, size)
      if (response.data) {
        setUsers(response.data.content)
        setTotalPages(response.data.totalPages)
        setTotalElements(response.data.totalElements)
      } else {
        throw new Error(response.message || 'Không thể tải danh sách người dùng')
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page])

  // Multi-criteria client side filtering for instant user feedback
  const filteredUsers = useMemo(() => {
    let result = users

    // Role filter
    if (roleFilter) {
      result = result.filter(u => u.roles.includes(roleFilter))
    }

    // Status filter
    if (statusFilter) {
      result = result.filter(u => u.status === statusFilter)
    }

    // Search term
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase()
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.phoneNumber.includes(query) ||
          u.id.toLowerCase().includes(query)
      )
    }

    return result
  }, [users, searchTerm, roleFilter, statusFilter])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value)
  }

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
  }

  const handleChangeStatus = async (userId: string, newStatus: UserStatus, userName: string) => {
    const statusText = newStatus === UserStatus.ACTIVE ? 'Hoạt động' : newStatus === UserStatus.INACTIVE ? 'Tạm khóa' : 'Bị cấm'

    if (!window.confirm(`Bạn có chắc muốn thay đổi trạng thái của người dùng ${userName} thành "${statusText}"?`)) return

    setActionLoadingId(userId)
    try {
      const response = await userService.changeUserStatus(userId, newStatus)
      if (response.code === 200 || !response.code) {
        toast.success(`Đã cập nhật trạng thái thành ${statusText}!`)
        fetchUsers()
      } else {
        throw new Error(response.message || 'Không thể thay đổi trạng thái')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleChangeRole = async (userId: string, newRole: UserRole, userName: string) => {
    const roleText = newRole === UserRole.ADMIN ? 'Quản trị viên' : newRole === UserRole.STAFF ? 'Nhân viên' : 'Khách hàng'

    if (!window.confirm(`Bạn có chắc muốn cấp quyền ${roleText} cho người dùng ${userName}?`)) return

    setActionLoadingId(userId)
    try {
      const response = await userService.updateUserRole(userId, newRole)
      if (response.code === 200 || !response.code) {
        toast.success(`Đã cập nhật phân quyền thành ${roleText}!`)
        fetchUsers()
      } else {
        throw new Error(response.message || 'Không thể thay đổi quyền')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleOpenEditModal = (user: UserResponse) => {
    setSelectedUser(user)
    setEditName(user.fullName)
    setEditPhone(user.phoneNumber)
  }

  const handleCloseEditModal = () => {
    setSelectedUser(null)
    setEditName('')
    setEditPhone('')
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    if (!editName.trim() || !editPhone.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setEditSubmitting(true)
    try {
      const response = await userService.updateUserProfile(selectedUser.id, {
        fullName: editName.trim(),
        phoneNumber: editPhone.trim()
      })
      if (response.code === 200 || !response.code) {
        toast.success('Cập nhật hồ sơ thành công!')
        fetchUsers()
        handleCloseEditModal()
      } else {
        throw new Error(response.message || 'Không thể cập nhật hồ sơ')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setEditSubmitting(false)
    }
  }

  // Calculate metrics for user dashboard top stats
  const metrics = useMemo(() => {
    const adminCount = users.filter(u => u.roles.includes(UserRole.ADMIN)).length
    const activeCount = users.filter(u => u.status === UserStatus.ACTIVE || !u.status).length
    const bannedCount = users.filter(u => u.status === UserStatus.BANNED).length

    return {
      total: totalElements,
      adminCount,
      activeCount,
      bannedCount
    }
  }, [users, totalElements])

  return (
    <section className="page-stack" style={{ gap: '28px' }}>
      <div className="page-heading compact" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="eyebrow">Quản trị viên</span>
          <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '4px 0' }}>Quản lý Người Dùng</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Theo dõi tài khoản khách hàng, phân quyền quản trị và thực thi khóa/cấm tài khoản vi phạm.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <article className="metric-card" style={{ background: '#f8fafc' }}>
          <span>Tổng số tài khoản đăng ký</span>
          <strong style={{ fontSize: '28px', color: '#1e293b' }}>{metrics.total}</strong>
          <em style={{ color: '#0f766e', fontStyle: 'normal' }}>Thành viên hệ thống</em>
        </article>
        <article className="metric-card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <span style={{ color: '#166534' }}>Tài khoản đang hoạt động</span>
          <strong style={{ fontSize: '28px', color: '#14532d' }}>{metrics.activeCount}</strong>
          <em style={{ color: '#16a34a', fontStyle: 'normal' }}>Đang khả dụng</em>
        </article>
        <article className="metric-card" style={{ background: '#fef2f2', border: '1px solid #fee2e2' }}>
          <span style={{ color: '#991b1b' }}>Tài khoản bị cấm (Banned)</span>
          <strong style={{ fontSize: '28px', color: '#7f1d1d' }}>{metrics.bannedCount}</strong>
          <em style={{ color: '#ef4444', fontStyle: 'normal' }}>Vi phạm điều khoản</em>
        </article>
      </div>

      {/* Filters Bar */}
      <div className="panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flex: 1, gap: '12px', minWidth: '280px', maxWidth: '400px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Tìm theo Tên, Email, Số điện thoại..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={roleFilter}
            onChange={handleRoleFilterChange}
            style={{
              padding: '10px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#fff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Tất cả vai trò</option>
            <option value={UserRole.USER}>Khách hàng</option>
            <option value={UserRole.STAFF}>Nhân viên</option>
            <option value={UserRole.ADMIN}>Quản trị viên</option>
          </select>

          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            style={{
              padding: '10px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#fff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value={UserStatus.ACTIVE}>Hoạt động</option>
            <option value={UserStatus.INACTIVE}>Tạm khóa</option>
            <option value={UserStatus.BANNED}>Bị cấm</option>
          </select>
        </div>
      </div>

      {/* Users List Table */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
            <Spinner label="Đang tải dữ liệu người dùng..." />
          </div>
        ) : error ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#ef4444' }}>
            <AlertCircle size={40} style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Lỗi tải danh sách người dùng</h3>
            <p style={{ fontSize: '14px', margin: '4px 0 0' }}>{error}</p>
            <Button onClick={fetchUsers} style={{ marginTop: '16px' }} variant="outline">Thử lại</Button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
            <AlertCircle size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Không tìm thấy người dùng</h3>
            <p style={{ fontSize: '14px', margin: '4px 0 0' }}>
              {searchTerm ? 'Không tìm thấy kết quả khớp với từ khóa tìm kiếm.' : 'Chưa có người dùng nào khớp bộ lọc.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #edf2f7', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '16px 20px' }}>Họ tên thành viên</th>
                  <th style={{ padding: '16px 20px' }}>Địa chỉ Email</th>
                  <th style={{ padding: '16px 20px' }}>Số điện thoại</th>
                  <th style={{ padding: '16px 20px' }}>Vai trò</th>
                  <th style={{ padding: '16px 20px' }}>Trạng thái</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody style={{ color: '#334155' }}>
                {filteredUsers.map((user, idx) => {
                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid #edf2f7',
                        backgroundColor: idx % 2 === 0 ? '#fff' : '#fcfdfe',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      {/* Avatar & Full Name */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.fullName}
                              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '15px',
                              border: '1px solid #bfdbfe'
                            }}>
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span style={{ fontWeight: 600, color: '#1e293b', display: 'block' }}>{user.fullName}</span>
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>ID: {user.id.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                          <Mail size={14} style={{ color: '#94a3b8' }} />
                          {user.email}
                        </span>
                      </td>

                      {/* Phone */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                          <Phone size={14} style={{ color: '#94a3b8' }} />
                          {user.phoneNumber || 'Chưa cập nhật'}
                        </span>
                      </td>

                      {/* Roles */}
                      <td style={{ padding: '16px 20px' }}>
                        <select
                          value={user.roles.includes(UserRole.ADMIN) ? UserRole.ADMIN : user.roles.includes(UserRole.STAFF) ? UserRole.STAFF : UserRole.USER}
                          onChange={(e) => handleChangeRole(user.id, e.target.value as UserRole, user.fullName)}
                          disabled={actionLoadingId !== null}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: user.roles.includes(UserRole.ADMIN) ? '#fca5a5' : user.roles.includes(UserRole.STAFF) ? '#fde047' : '#bfdbfe',
                            fontSize: '12px',
                            fontWeight: 600,
                            outline: 'none',
                            cursor: 'pointer',
                            backgroundColor: user.roles.includes(UserRole.ADMIN) ? '#fef2f2' : user.roles.includes(UserRole.STAFF) ? '#fefce8' : '#eff6ff',
                            color: user.roles.includes(UserRole.ADMIN) ? '#dc2626' : user.roles.includes(UserRole.STAFF) ? '#ca8a04' : '#2563eb',
                          }}
                        >
                          <option value={UserRole.USER}>Khách hàng</option>
                          <option value={UserRole.STAFF}>Nhân viên</option>
                          <option value={UserRole.ADMIN}>Quản trị viên</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        <select
                          value={user.status || UserStatus.ACTIVE}
                          onChange={(e) => handleChangeStatus(user.id, e.target.value as UserStatus, user.fullName)}
                          disabled={actionLoadingId !== null}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: user.status === UserStatus.BANNED ? '#fca5a5' : user.status === UserStatus.INACTIVE ? '#d1d5db' : '#bbf7d0',
                            fontSize: '12px',
                            fontWeight: 600,
                            outline: 'none',
                            cursor: 'pointer',
                            backgroundColor: user.status === UserStatus.BANNED ? '#fef2f2' : user.status === UserStatus.INACTIVE ? '#f3f4f6' : '#f0fdf4',
                            color: user.status === UserStatus.BANNED ? '#dc2626' : user.status === UserStatus.INACTIVE ? '#4b5563' : '#16a34a',
                          }}
                        >
                          <option value={UserStatus.ACTIVE}>Hoạt động</option>
                          <option value={UserStatus.INACTIVE}>Tạm khóa</option>
                          <option value={UserStatus.BANNED}>Bị cấm</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            title="Sửa hồ sơ thành viên"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#fff',
                              color: '#475569',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Edit2 size={12} />
                            Sửa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Panel */}
        {!loading && !error && totalPages > 1 && (
          <div style={{ borderTop: '1px solid #edf2f7', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Hiển thị trang <strong>{page + 1}</strong> trên tổng số <strong>{totalPages}</strong> trang ({totalElements} người dùng)
            </span>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page === 0}
                style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ChevronLeft size={16} />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={page === totalPages - 1}
                style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Sau
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Profile Dialog (Modal Overlay) */}
      {selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <form
            onSubmit={handleUpdateProfile}
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              width: '100%',
              maxWidth: '420px',
              padding: '24px',
              display: 'grid',
              gap: '16px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Sửa thông tin thành viên</h3>
              <button
                type="button"
                onClick={handleCloseEditModal}
                style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8', fontWeight: 700 }}
              >
                &times;
              </button>
            </div>

            <div style={{ fontSize: '13px', color: '#64748b', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontFamily: 'monospace' }}>
              <div>Email: <strong>{selectedUser.email}</strong></div>
              <div style={{ marginTop: '2px' }}>ID: <strong>{selectedUser.id}</strong></div>
            </div>

            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Họ và tên *</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                required
              />
            </div>

            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Số điện thoại *</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
              <Button type="button" variant="secondary" onClick={handleCloseEditModal}>
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={editSubmitting}>
                {editSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
