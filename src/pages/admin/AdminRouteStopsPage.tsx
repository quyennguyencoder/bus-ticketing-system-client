import React, { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle,
  Compass,
  MapPin,
  Clock,
  ArrowRight,
  Navigation,
  Check,
  X
} from 'lucide-react'
import { routeService } from '../../services/route.service'
import { pointService } from '../../services/point.service'
import { routeStopService } from '../../services/route-stop.service'
import { RouteResponse, PointResponse, RouteStopResponse } from '../../types/response'
import { getApiErrorMessage } from '../../utils/api-error'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

export const AdminRouteStopsPage = () => {
  // Dropdown lists
  const [routesList, setRoutesList] = useState<RouteResponse[]>([])
  const [pointsList, setPointsList] = useState<PointResponse[]>([])
  
  // Selected Route & its Stops
  const [selectedRouteId, setSelectedRouteId] = useState<string>('')
  const [routeStops, setRouteStops] = useState<RouteStopResponse[]>([])
  const [stopsLoading, setStopsLoading] = useState(false)

  // Form State
  const [isEditing, setIsEditing] = useState(false)
  const [editingStopId, setEditingStopId] = useState<string | null>(null)
  
  const [formPointId, setFormPointId] = useState('')
  const [formOrderIndex, setFormOrderIndex] = useState<number>(1)
  const [formTimeOffsetMinutes, setFormTimeOffsetMinutes] = useState<number>(0)
  const [formIsPickUp, setFormIsPickUp] = useState<boolean>(true)
  const [formIsDropOff, setFormIsDropOff] = useState<boolean>(true)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Load routes and points for select dropdowns
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [routesRes, pointsRes] = await Promise.all([
          routeService.getAllRoutes(0, 100),
          pointService.getAllPoints(0, 100)
        ])
        if (routesRes.data) {
          setRoutesList(routesRes.data.content)
          if (routesRes.data.content.length > 0) {
            setSelectedRouteId(routesRes.data.content[0].id)
          }
        }
        if (pointsRes.data) {
          setPointsList(pointsRes.data.content)
          if (pointsRes.data.content.length > 0) {
            setFormPointId(pointsRes.data.content[0].id)
          }
        }
      } catch (err) {
        toast.error('Không thể khởi tạo danh sách tuyến và trạm dừng')
      }
    }
    loadDropdownData()
  }, [])

  // Load stops whenever the selected Route changes
  const fetchStops = async () => {
    if (!selectedRouteId) {
      setRouteStops([])
      return
    }
    setStopsLoading(true)
    try {
      const response = await routeStopService.getRouteStopsByRoute(selectedRouteId)
      if (response.data) {
        const sorted = [...response.data].sort((a, b) => a.orderIndex - b.orderIndex)
        setRouteStops(sorted)
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setStopsLoading(false)
    }
  }

  useEffect(() => {
    fetchStops()
    resetForm()
  }, [selectedRouteId])

  const resetForm = () => {
    setIsEditing(false)
    setEditingStopId(null)
    if (pointsList.length > 0) {
      setFormPointId(pointsList[0].id)
    }
    
    // Auto-increment orderIndex based on current routeStops length
    const nextOrder = routeStops.length > 0 ? Math.max(...routeStops.map(s => s.orderIndex)) + 1 : 1
    const lastOffset = routeStops.length > 0 ? Math.max(...routeStops.map(s => s.timeOffsetMinutes)) + 60 : 0

    setFormOrderIndex(nextOrder)
    setFormTimeOffsetMinutes(lastOffset)
    setFormIsPickUp(true)
    setFormIsDropOff(true)
  }

  const handleEditClick = (stop: RouteStopResponse) => {
    setIsEditing(true)
    setEditingStopId(stop.id)
    setFormPointId(stop.pointId)
    setFormOrderIndex(stop.orderIndex)
    setFormTimeOffsetMinutes(stop.timeOffsetMinutes)
    setFormIsPickUp(stop.isPickUp)
    setFormIsDropOff(stop.isDropOff)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedRouteId || !formPointId || formOrderIndex <= 0 || formTimeOffsetMinutes < 0) {
      toast.error('Vui lòng nhập đầy đủ thông tin trạm dừng')
      return
    }

    setFormSubmitting(true)
    try {
      if (isEditing && editingStopId) {
        // Update
        const response = await routeStopService.updateRouteStop(editingStopId, {
          orderIndex: Number(formOrderIndex),
          timeOffsetMinutes: Number(formTimeOffsetMinutes),
          isPickUp: formIsPickUp,
          isDropOff: formIsDropOff
        })
        if (response.code === 200 || !response.code) {
          toast.success('Cập nhật trạm dừng thành công!')
          fetchStops()
          resetForm()
        } else {
          throw new Error(response.message || 'Không thể cập nhật trạm dừng')
        }
      } else {
        // Check if Point already exists in route stops of the current route to avoid duplicates
        const pointExists = routeStops.some(s => s.pointId === formPointId)
        if (pointExists) {
          if (!window.confirm('Trạm dừng này đã tồn tại trong tuyến. Bạn vẫn muốn thêm tiếp?')) {
            setFormSubmitting(false)
            return
          }
        }

        // Create
        const response = await routeStopService.createRouteStop({
          routeId: selectedRouteId,
          pointId: formPointId,
          orderIndex: Number(formOrderIndex),
          timeOffsetMinutes: Number(formTimeOffsetMinutes),
          isPickUp: formIsPickUp,
          isDropOff: formIsDropOff
        })
        if (response.code === 200 || !response.code) {
          toast.success('Thêm trạm dừng vào tuyến thành công!')
          fetchStops()
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

  const handleDelete = async (stopId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa trạm dừng này ra khỏi tuyến đường?')) return
    
    try {
      const response = await routeStopService.deleteRouteStop(stopId)
      if (response.code === 200 || !response.code) {
        toast.success('Đã xóa trạm dừng thành công!')
        fetchStops()
      } else {
        throw new Error(response.message || 'Không thể xóa trạm dừng')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  const selectedRouteName = useMemo(() => {
    const route = routesList.find(r => r.id === selectedRouteId)
    return route ? `${route.name} (${route.code})` : ''
  }, [selectedRouteId, routesList])

  return (
    <section className="page-stack" style={{ gap: '28px' }}>
      <div className="page-heading compact">
        <span className="eyebrow">Quản trị viên</span>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '4px 0' }}>Trạm Dừng của Tuyến (Route Stops)</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Quản lý thứ tự di chuyển, thời gian dự kiến và hành động đón trả tại mỗi trạm dừng của từng Tuyến đường.</p>
      </div>

      {/* Select Route Selection Header Panel */}
      <div className="panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', background: 'linear-gradient(to right, #f8fafc, #f1f5f9)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#334155' }}>
          <Compass size={18} style={{ color: '#2563eb' }} />
          <span>Vui lòng chọn Tuyến đường quản lý:</span>
        </div>
        <select
          value={selectedRouteId}
          onChange={(e) => setSelectedRouteId(e.target.value)}
          style={{
            minWidth: '240px',
            padding: '10px 14px',
            border: '2px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#1e293b',
            outline: 'none',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          {routesList.map((route) => (
            <option key={route.id} value={route.id}>
              {route.name} ({route.code})
            </option>
          ))}
        </select>
      </div>

      <div className="detail-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 360px' }}>
        
        {/* Left column: Visual Timeline & Sequence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} style={{ color: '#0f766e' }} />
              Sơ đồ Lộ trình Tuyến: <span style={{ color: '#2563eb', fontWeight: 800 }}>{selectedRouteName}</span>
            </h3>

            {stopsLoading ? (
              <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
                <Spinner label="Đang tải sơ đồ..." />
              </div>
            ) : routeStops.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b' }}>
                <AlertCircle size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Tuyến đường chưa thiết lập Trạm dừng</h3>
                <p style={{ fontSize: '13px', margin: '4px 0 0' }}>Hãy thêm trạm dừng xuất phát và trạm dừng dọc đường bằng form bên phải.</p>
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '32px', margin: '12px 0' }}>
                {/* Visual vertical bar line */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    left: '11px', 
                    top: '12px', 
                    bottom: '12px', 
                    width: '3px', 
                    background: 'linear-gradient(180deg, #3b82f6 0%, #10b981 100%)',
                    borderRadius: '2px'
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {routeStops.map((stop, idx) => {
                    const isFirst = stop.orderIndex === 1
                    
                    return (
                      <div key={stop.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', position: 'relative' }}>
                        {/* Node circle */}
                        <div 
                          style={{ 
                            position: 'absolute', 
                            left: '-29px', 
                            top: '4px', 
                            width: '18px', 
                            height: '18px', 
                            borderRadius: '50%', 
                            backgroundColor: isFirst ? '#2563eb' : '#10b981', 
                            border: isFirst ? '3px solid #eff6ff' : '3px solid #d1fae5',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            zIndex: 2
                          }}
                        />

                        {/* Stop details */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>
                              #{stop.orderIndex}. {stop.pointName}
                            </span>

                            {/* Province */}
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                              ({stop.provinceName})
                            </span>

                            {/* Cumulative time offset badge */}
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              fontSize: '12px', 
                              fontWeight: 600, 
                              color: isFirst ? '#2563eb' : '#475569',
                              backgroundColor: isFirst ? '#eff6ff' : '#f1f5f9',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              border: isFirst ? '1px solid #bfdbfe' : '1px solid #e2e8f0'
                            }}>
                              <Clock size={12} />
                              {isFirst ? 'Xuất phát (0m)' : `+${stop.timeOffsetMinutes} phút (~${Math.round(stop.timeOffsetMinutes/60*10)/10}h)`}
                            </span>

                            {/* Pickup/Dropoff Badges */}
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {stop.isPickUp && (
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb', backgroundColor: '#dbeafe', padding: '1px 6px', borderRadius: '4px' }}>
                                  Đón khách
                                </span>
                              )}
                              {stop.isDropOff && (
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669', backgroundColor: '#d1fae5', padding: '1px 6px', borderRadius: '4px' }}>
                                  Trả khách
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', justifyContent: 'flex-start' }}>
                            <button
                              onClick={() => handleEditClick(stop)}
                              style={{
                                border: 'none',
                                background: 'none',
                                color: '#475569',
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              <Edit2 size={12} /> Sửa chi tiết
                            </button>
                            <button
                              onClick={() => handleDelete(stop.id)}
                              style={{
                                border: 'none',
                                background: 'none',
                                color: '#ef4444',
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              <Trash2 size={12} /> Xóa khỏi tuyến
                            </button>
                          </div>
                        </div>

                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right column: Form */}
        <div style={{ position: 'sticky', top: '92px' }}>
          <form className="panel" onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
              <Plus size={18} style={{ color: '#0f766e' }} />
              {isEditing ? 'Cập Nhật Trạm Dừng' : 'Thêm Trạm Vào Tuyến'}
            </h2>

            {/* Trạm Trung Chuyển (Point Selection) */}
            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Trạm trung chuyển / Bến xe *</label>
              <select
                value={formPointId}
                onChange={(e) => setFormPointId(e.target.value)}
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
                {pointsList.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name} ({pt.provinceName})
                  </option>
                ))}
              </select>
            </div>

            {/* Thứ tự chặng chạy (orderIndex) */}
            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Thứ tự chặng chạy (Order Index) *</label>
              <input
                type="number"
                value={formOrderIndex}
                onChange={(e) => setFormOrderIndex(Number(e.target.value))}
                min="1"
                placeholder="Ví dụ: 1 cho trạm xuất phát, 2 cho trạm kế..."
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
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Thứ tự bằng <strong>1</strong> tương đương với thời gian xuất phát của chuyến.
              </span>
            </div>

            {/* Thời gian tích lũy (timeOffsetMinutes) */}
            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Thời gian di chuyển tích lũy (Phút) *</label>
              <input
                type="number"
                value={formTimeOffsetMinutes}
                onChange={(e) => setFormTimeOffsetMinutes(Number(e.target.value))}
                min="0"
                placeholder="Ví dụ: 0 cho điểm đầu, 60 cho điểm cách 1 giờ chạy"
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
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Số phút di chuyển tích lũy tính từ điểm xuất phát của tuyến xe.
              </span>
            </div>

            {/* PickUp / DropOff checkboxes */}
            <div style={{ display: 'grid', gap: '10px', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formIsPickUp}
                  onChange={(e) => setFormIsPickUp(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Có đón khách tại trạm này (Is Pick Up)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formIsDropOff}
                  onChange={(e) => setFormIsDropOff(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Có trả khách tại trạm này (Is Drop Off)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <Button type="button" variant="secondary" onClick={resetForm} style={{ flex: 1 }}>
                Hủy / Reset
              </Button>
              <Button type="submit" disabled={formSubmitting} style={{ flex: 2 }}>
                {formSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Thêm trạm'}
              </Button>
            </div>
          </form>
        </div>

      </div>
    </section>
  )
}
