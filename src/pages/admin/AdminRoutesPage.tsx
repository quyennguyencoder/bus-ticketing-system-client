import React, { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { 
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Compass
} from 'lucide-react'
import { routeService } from '../../services/route.service'
import { RouteResponse } from '../../types/response'
import { getApiErrorMessage } from '../../utils/api-error'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

export const AdminRoutesPage = () => {
  const [routes, setRoutes] = useState<RouteResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Pagination & Search
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Form State
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formCode, setFormCode] = useState('')
  const [formName, setFormName] = useState('')
  const [formDistanceKm, setFormDistanceKm] = useState(0)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const size = 10

  const fetchRoutes = async () => {
    setLoading(true)
    try {
      const response = await routeService.getAllRoutes(page, size)
      if (response.data) {
        setRoutes(response.data.content)
        setTotalPages(response.data.totalPages)
        setTotalElements(response.data.totalElements)
      } else {
        throw new Error(response.message || 'Không thể tải danh sách tuyến đường')
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [page])

  const filteredRoutes = useMemo(() => {
    if (!searchTerm.trim()) return routes
    const query = searchTerm.toLowerCase()
    return routes.filter(
      (route) =>
        route.name.toLowerCase().includes(query) ||
        route.code.toLowerCase().includes(query) ||
        route.id.toLowerCase().includes(query)
    )
  }, [routes, searchTerm])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const resetForm = () => {
    setIsEditing(false)
    setEditingId(null)
    setFormCode('')
    setFormName('')
    setFormDistanceKm(0)
  }

  const handleEditClick = (route: RouteResponse) => {
    setIsEditing(true)
    setEditingId(route.id)
    setFormCode(route.code)
    setFormName(route.name)
    setFormDistanceKm(route.distanceKm)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formCode.trim() || !formName.trim() || formDistanceKm <= 0) {
      toast.error('Vui lòng điền đầy đủ và chính xác thông tin tuyến đường')
      return
    }

    setFormSubmitting(true)
    try {
      const data = {
        code: formCode.trim(),
        name: formName.trim(),
        distanceKm: Number(formDistanceKm)
      }

      if (isEditing && editingId) {
        const response = await routeService.updateRoute(editingId, data)
        if (response.code === 200 || !response.code) {
          toast.success('Cập nhật tuyến đường thành công!')
          fetchRoutes()
          resetForm()
        } else {
          throw new Error(response.message || 'Không thể cập nhật tuyến đường')
        }
      } else {
        const response = await routeService.createRoute(data)
        if (response.code === 200 || !response.code) {
          toast.success('Thêm tuyến đường thành công!')
          fetchRoutes()
          resetForm()
        } else {
          throw new Error(response.message || 'Không thể thêm tuyến đường')
        }
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDelete = async (routeId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa tuyến đường này? Việc này sẽ ảnh hưởng tới các chặng dừng và chuyến xe thuộc tuyến.')) return
    
    try {
      const response = await routeService.deleteRoute(routeId)
      if (response.code === 200 || !response.code) {
        toast.success('Xóa tuyến đường thành công!')
        fetchRoutes()
      } else {
        throw new Error(response.message || 'Không thể xóa tuyến đường')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  const avgDistance = useMemo(() => {
    if (routes.length === 0) return 0
    const total = routes.reduce((sum, r) => sum + r.distanceKm, 0)
    return Math.round(total / routes.length)
  }, [routes])

  return (
    <section className="page-stack" style={{ gap: '28px' }}>
      <div className="page-heading compact">
        <span className="eyebrow">Quản trị viên</span>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '4px 0' }}>Tuyến Xe Chạy (Routes)</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Thiết lập các tuyến đường vận chuyển, khoảng cách giữa các khu vực địa lý.</p>
      </div>

      {/* Main layout grid */}
      <div className="detail-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 360px' }}>
        
        {/* Left column: List of routes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Dashboard Cards */}
          <div className="metric-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <article className="metric-card" style={{ background: '#f8fafc' }}>
              <span>Tổng số tuyến chạy</span>
              <strong style={{ fontSize: '28px', color: '#1e293b' }}>{totalElements}</strong>
              <em style={{ color: '#0f766e', fontStyle: 'normal' }}>Tuyến hoạt động</em>
            </article>
            <article className="metric-card" style={{ background: '#f8fafc' }}>
              <span>Khoảng cách trung bình</span>
              <strong style={{ fontSize: '28px', color: '#1e293b' }}>{avgDistance} km</strong>
              <em style={{ color: '#2563eb', fontStyle: 'normal' }}>Bán kính di chuyển</em>
            </article>
          </div>

          {/* Search Box */}
          <div className="panel" style={{ padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '32px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm theo Mã tuyến, Tên tuyến xe..."
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

          {/* Table list */}
          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
                <Spinner label="Đang tải dữ liệu..." />
              </div>
            ) : error ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: '#ef4444' }}>
                <AlertCircle size={40} style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Lỗi tải dữ liệu</h3>
                <p style={{ fontSize: '14px', margin: '4px 0 0' }}>{error}</p>
                <Button onClick={fetchRoutes} style={{ marginTop: '16px' }} variant="secondary">Thử lại</Button>
              </div>
            ) : filteredRoutes.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
                <AlertCircle size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Không tìm thấy tuyến đường</h3>
                <p style={{ fontSize: '14px', margin: '4px 0 0' }}>Vui lòng kiểm tra lại từ khóa hoặc tạo mới.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #edf2f7', color: '#475569', fontWeight: 600 }}>
                      <th style={{ padding: '16px 20px' }}>Mã Tuyến</th>
                      <th style={{ padding: '16px 20px' }}>Tên Tuyến Xe</th>
                      <th style={{ padding: '16px 20px' }}>Khoảng cách</th>
                      <th style={{ padding: '16px 20px', textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoutes.map((route, idx) => (
                      <tr 
                        key={route.id} 
                        style={{ 
                          borderBottom: '1px solid #edf2f7', 
                          backgroundColor: idx % 2 === 0 ? '#fff' : '#fcfdfe',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <td style={{ padding: '16px 20px', fontWeight: 700, fontFamily: 'monospace', color: '#1e40af' }}>
                          {route.code}
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: '#0f172a' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Compass size={16} style={{ color: '#2563eb' }} />
                            {route.name}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#475569', fontWeight: 500 }}>
                          <span style={{ backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                            {route.distanceKm} km
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleEditClick(route)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#fff',
                                color: '#475569',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <Edit2 size={12} />
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(route.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fee2e2',
                                color: '#ef4444',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <Trash2 size={12} />
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div style={{ borderTop: '1px solid #edf2f7', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Trang <strong>{page + 1}</strong> / <strong>{totalPages}</strong> ({totalElements} tuyến)
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="secondary"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={{ padding: '4px 10px' }}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    style={{ padding: '4px 10px' }}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Form */}
        <div style={{ position: 'sticky', top: '92px' }}>
          <form className="panel" onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
              <Plus size={18} style={{ color: '#2563eb' }} />
              {isEditing ? 'Cập Nhật Tuyến Xe' : 'Thêm Tuyến Xe Mới'}
            </h2>
            
            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Mã Tuyến đường *</label>
              <input
                type="text"
                placeholder="Ví dụ: SG-NT"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
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
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Tên Tuyến Xe *</label>
              <input
                type="text"
                placeholder="Ví dụ: Sài Gòn - Nha Trang"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
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
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Khoảng cách (km) *</label>
              <input
                type="number"
                placeholder="Ví dụ: 430"
                value={formDistanceKm || ''}
                onChange={(e) => setFormDistanceKm(Number(e.target.value))}
                min="1"
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

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {isEditing && (
                <Button type="button" variant="secondary" onClick={resetForm} style={{ flex: 1 }}>
                  Hủy
                </Button>
              )}
              <Button type="submit" disabled={formSubmitting} style={{ flex: 2 }}>
                {formSubmitting ? 'Đang gửi...' : isEditing ? 'Cập nhật' : 'Thêm tuyến'}
              </Button>
            </div>
          </form>
        </div>

      </div>
    </section>
  )
}
