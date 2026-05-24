import React, { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { 
  Search, 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react'
import { pointService } from '../../services/point.service'
import { PointResponse } from '../../types/response'
import { getApiErrorMessage } from '../../utils/api-error'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import POPULAR_PROVINCES from '../../assets/provinces.json'

export const AdminPointsPage = () => {
  const [points, setPoints] = useState<PointResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Pagination & Filtering
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Form State
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formProvinceCode, setFormProvinceCode] = useState('79')
  const [formSubmitting, setFormSubmitting] = useState(false)

  const size = 10

  const fetchPoints = async () => {
    setLoading(true)
    try {
      const response = await pointService.getAllPoints(page, size)
      if (response.data) {
        setPoints(response.data.content)
        setTotalPages(response.data.totalPages)
        setTotalElements(response.data.totalElements)
      } else {
        throw new Error(response.message || 'Không thể tải danh sách trạm dừng')
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPoints()
  }, [page])

  const filteredPoints = useMemo(() => {
    if (!searchTerm.trim()) return points
    const query = searchTerm.toLowerCase()
    return points.filter(
      (point) =>
        point.name.toLowerCase().includes(query) ||
        point.provinceName.toLowerCase().includes(query) ||
        point.id.toLowerCase().includes(query)
    )
  }, [points, searchTerm])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const resetForm = () => {
    setIsEditing(false)
    setEditingId(null)
    setFormName('')
    setFormProvinceCode('79')
  }

  const handleEditClick = (point: PointResponse) => {
    setIsEditing(true)
    setEditingId(point.id)
    setFormName(point.name)
    setFormProvinceCode(point.provinceCode)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên trạm dừng')
      return
    }

    setFormSubmitting(true)
    try {
      if (isEditing && editingId) {
        // Update point (Note: UpdatePointRequest only contains name)
        const response = await pointService.updatePoint(editingId, { name: formName })
        if (response.code === 200 || !response.code) {
          toast.success('Cập nhật trạm dừng thành công!')
          fetchPoints()
          resetForm()
        } else {
          throw new Error(response.message || 'Không thể cập nhật trạm dừng')
        }
      } else {
        // Create point
        const response = await pointService.createPoint({
          name: formName,
          provinceCode: formProvinceCode
        })
        if (response.code === 200 || !response.code) {
          toast.success('Thêm trạm dừng thành công!')
          fetchPoints()
          resetForm()
        } else {
          throw new Error(response.message || 'Không thể thêm trạm dừng')
        }
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDelete = async (pointId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa trạm dừng này? Hành động này không thể hoàn tác.')) return
    
    try {
      const response = await pointService.deletePoint(pointId)
      if (response.code === 200 || !response.code) {
        toast.success('Xóa trạm dừng thành công!')
        fetchPoints()
      } else {
        throw new Error(response.message || 'Không thể xóa trạm dừng')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  const uniqueProvincesCount = useMemo(() => {
    const provinceSet = new Set(points.map((p) => p.provinceCode))
    return provinceSet.size
  }, [points])

  return (
    <section className="page-stack" style={{ gap: '28px' }}>
      <div className="page-heading compact">
        <span className="eyebrow">Quản trị viên</span>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '4px 0' }}>Trạm Trung Chuyển (Points)</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Quản lý các địa điểm đón trả khách, bến xe trung chuyển của nhà xe.</p>
      </div>

      {/* Main Grid: Form on Left/Right, List on the other side */}
      <div className="detail-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 360px' }}>
        
        {/* Left Side: Table of Points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quick Metrics */}
          <div className="metric-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <article className="metric-card" style={{ background: '#f8fafc' }}>
              <span>Tổng số trạm dừng</span>
              <strong style={{ fontSize: '28px', color: '#1e293b' }}>{totalElements}</strong>
              <em style={{ color: '#0f766e', fontStyle: 'normal' }}>Bến xe & Trạm trung chuyển</em>
            </article>
            <article className="metric-card" style={{ background: '#f8fafc' }}>
              <span>Số tỉnh/thành hoạt động</span>
              <strong style={{ fontSize: '28px', color: '#1e293b' }}>{uniqueProvincesCount}</strong>
              <em style={{ color: '#2563eb', fontStyle: 'normal' }}>Khu vực địa lý</em>
            </article>
          </div>

          {/* Search Box */}
          <div className="panel" style={{ padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '32px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm nhanh theo tên trạm hoặc tỉnh thành..."
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

          {/* Table Panel */}
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
                <Button onClick={fetchPoints} style={{ marginTop: '16px' }} variant="outline">Thử lại</Button>
              </div>
            ) : filteredPoints.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
                <AlertCircle size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Không có trạm dừng nào</h3>
                <p style={{ fontSize: '14px', margin: '4px 0 0' }}>Vui lòng thêm trạm dừng mới ở bảng bên phải.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #edf2f7', color: '#475569', fontWeight: 600 }}>
                      <th style={{ padding: '16px 20px' }}>Tên Trạm / Điểm Đón</th>
                      <th style={{ padding: '16px 20px' }}>Tỉnh / Thành Phố</th>
                      <th style={{ padding: '16px 20px', textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPoints.map((point, idx) => (
                      <tr 
                        key={point.id} 
                        style={{ 
                          borderBottom: '1px solid #edf2f7', 
                          backgroundColor: idx % 2 === 0 ? '#fff' : '#fcfdfe',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: '#1e293b' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={16} style={{ color: '#0f766e' }} />
                            {point.name}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#475569' }}>
                          <span style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, color: '#2563eb' }}>
                            {point.provinceName}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleEditClick(point)}
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
                              className="btn-action-hover"
                            >
                              <Edit2 size={12} />
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(point.id)}
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
                  Trang <strong>{page + 1}</strong> / <strong>{totalPages}</strong> ({totalElements} trạm)
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={{ padding: '4px 10px' }}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
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

        {/* Right Side: Form Panel */}
        <div style={{ position: 'sticky', top: '92px' }}>
          <form className="panel" onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
              <Plus size={18} style={{ color: '#0f766e' }} />
              {isEditing ? 'Cập Nhật Trạm Dừng' : 'Thêm Trạm Dừng'}
            </h2>
            
            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Tên Trạm dừng *</label>
              <input
                type="text"
                placeholder="Ví dụ: Bến xe Miền Đông mới"
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

            {/* Province Code Selection (Only when creating because pointService.updatePoint only receives "name") */}
            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Tỉnh / Thành Phố *</label>
              <select
                value={formProvinceCode}
                onChange={(e) => setFormProvinceCode(e.target.value)}
                disabled={isEditing}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: isEditing ? '#f1f5f9' : '#fff',
                  cursor: isEditing ? 'not-allowed' : 'pointer',
                  outline: 'none'
                }}
                required
              >
                {POPULAR_PROVINCES.map((prov) => (
                  <option key={prov.code} value={prov.code}>
                    {prov.name}
                  </option>
                ))}
              </select>
              {isEditing && (
                <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Info size={12} /> Không thể chỉnh sửa Tỉnh/Thành phố sau khi tạo.
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {isEditing && (
                <Button type="button" variant="secondary" onClick={resetForm} style={{ flex: 1 }}>
                  Hủy
                </Button>
              )}
              <Button type="submit" disabled={formSubmitting} style={{ flex: 2 }}>
                {formSubmitting ? 'Đang gửi...' : isEditing ? 'Cập nhật' : 'Thêm trạm'}
              </Button>
            </div>
          </form>
        </div>

      </div>
    </section>
  )
}
