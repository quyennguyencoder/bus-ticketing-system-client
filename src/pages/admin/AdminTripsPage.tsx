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
  Bus,
  Clock,
  ArrowRight
} from 'lucide-react'
import { tripService } from '../../services/trip.service'
import { routeService } from '../../services/route.service'
import { TripResponse, RouteResponse } from '../../types/response'
import { TripStatus } from '../../types/enums'
import { getApiErrorMessage } from '../../utils/api-error'
import { formatCurrencyVnd } from '../../utils/format'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

export const AdminTripsPage = () => {
  const [trips, setTrips] = useState<TripResponse[]>([])
  const [routesList, setRoutesList] = useState<RouteResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination & Filtering
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  // Form State
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formRouteId, setFormRouteId] = useState('')
  const [formBusPlate, setFormBusPlate] = useState('')
  const [formBusType, setFormBusType] = useState('Giường nằm 40 chỗ')
  const [formDepartureTime, setFormDepartureTime] = useState('')
  const [formArrivalTime, setFormArrivalTime] = useState('')
  const [formBasePrice, setFormBasePrice] = useState<number>(150000)
  const [formPrice, setFormPrice] = useState<number>(150000)
  const [formDriverName, setFormDriverName] = useState('')
  const [formDriverPhoneNumber, setFormDriverPhoneNumber] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)

  const size = 10

  const fetchTrips = async () => {
    setLoading(true)
    try {
      const response = await tripService.getAllTrips(page, size, statusFilter || undefined)
      if (response.data) {
        setTrips(response.data.content)
        setTotalPages(response.data.totalPages)
        setTotalElements(response.data.totalElements)
      } else {
        throw new Error(response.message || 'Không thể tải danh sách chuyến xe')
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // Load routes once for dropdown
  useEffect(() => {
    routeService.getAllRoutes(0, 100)
      .then((res) => {
        if (res.data) {
          setRoutesList(res.data.content)
          if (res.data.content.length > 0) {
            setFormRouteId(res.data.content[0].id)
          }
        }
      })
      .catch(() => toast.error('Không thể tải danh sách tuyến đường cho biểu mẫu'))
  }, [])

  useEffect(() => {
    fetchTrips()
  }, [page, statusFilter])

  const filteredTrips = useMemo(() => {
    if (!searchTerm.trim()) return trips
    const query = searchTerm.toLowerCase()
    return trips.filter(
      (trip) =>
        trip.routeName.toLowerCase().includes(query) ||
        trip.routeCode.toLowerCase().includes(query) ||
        trip.busPlate.toLowerCase().includes(query) ||
        trip.busType.toLowerCase().includes(query)
    )
  }, [trips, searchTerm])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
    setPage(0)
  }

  const resetForm = () => {
    setIsEditing(false)
    setEditingId(null)
    if (routesList.length > 0) {
      setFormRouteId(routesList[0].id)
    }
    setFormBusPlate('')
    setFormBusType('Giường nằm 40 chỗ')
    setFormDepartureTime('')
    setFormArrivalTime('')
    setFormBasePrice(150000)
    setFormPrice(150000)
    setFormDriverName('')
    setFormDriverPhoneNumber('')
  }

  const handleEditClick = (trip: TripResponse) => {
    setIsEditing(true)
    setEditingId(trip.id)
    setFormRouteId(trip.routeId)
    setFormBusPlate(trip.busPlate)
    setFormBusType(trip.busType)

    // Convert ISO string to datetime-local compatible string (YYYY-MM-DDTHH:MM)
    if (trip.departureTime) {
      setFormDepartureTime(new Date(trip.departureTime).toISOString().substring(0, 16))
    }
    if (trip.arrivalTime) {
      setFormArrivalTime(new Date(trip.arrivalTime).toISOString().substring(0, 16))
    }
    setFormBasePrice(trip.basePrice)
    setFormPrice(trip.price)
    setFormDriverName(trip.driverName || '')
    setFormDriverPhoneNumber(trip.driverPhoneNumber || '')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formRouteId || !formBusPlate.trim() || !formDepartureTime || !formArrivalTime || formPrice <= 0) {
      toast.error('Vui lòng nhập đầy đủ thông tin chuyến xe')
      return
    }

    // Departure time must be before Arrival time
    const depDate = new Date(formDepartureTime)
    const arrDate = new Date(formArrivalTime)
    if (depDate.getTime() >= arrDate.getTime()) {
      toast.error('Thời gian xuất phát phải trước thời gian đến nơi!')
      return
    }

    setFormSubmitting(true)
    try {
      if (isEditing && editingId) {
        const data = {
          routeId: formRouteId,
          busPlate: formBusPlate.trim(),
          busType: formBusType,
          departureTime: new Date(formDepartureTime).toISOString(),
          arrivalTime: new Date(formArrivalTime).toISOString(),
          basePrice: Number(formBasePrice),
          price: Number(formPrice),
          driverName: formDriverName.trim() || undefined,
          driverPhoneNumber: formDriverPhoneNumber.trim() || undefined
        }

        const response = await tripService.updateTrip(editingId, data)
        if (response.code === 200 || !response.code) {
          toast.success('Cập nhật chuyến xe thành công!')
          fetchTrips()
          resetForm()
        } else {
          throw new Error(response.message || 'Không thể cập nhật chuyến xe')
        }
      } else {
        const data = {
          routeId: formRouteId,
          busPlate: formBusPlate.trim(),
          busType: formBusType,
          departureTime: new Date(formDepartureTime).toISOString(),
          arrivalTime: new Date(formArrivalTime).toISOString(),
          basePrice: Number(formBasePrice),
          price: Number(formPrice)
        }
        const response = await tripService.createTrip(data)
        if (response.code === 200 || !response.code) {
          toast.success('Tạo chuyến xe mới thành công!')
          fetchTrips()
          resetForm()
        } else {
          throw new Error(response.message || 'Không thể tạo chuyến xe mới')
        }
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleUpdateStatus = async (tripId: string, status: TripStatus) => {
    setStatusUpdatingId(tripId)
    try {
      const response = await tripService.updateTripStatus(tripId, status)
      if (response.code === 200 || !response.code) {
        toast.success(`Đã cập nhật trạng thái chuyến xe sang ${translateStatus(status)}`)
        fetchTrips()
      } else {
        throw new Error(response.message || 'Không thể cập nhật trạng thái')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const handleDelete = async (tripId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa chuyến xe này? Hành động này sẽ xóa hết ghế và lịch đặt kèm theo.')) return

    try {
      const response = await tripService.deleteTrip(tripId)
      if (response.code === 200 || !response.code) {
        toast.success('Xóa chuyến xe thành công!')
        fetchTrips()
      } else {
        throw new Error(response.message || 'Không thể xóa chuyến xe')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case TripStatus.COMPLETED:
        return 'badge badge-success'
      case TripStatus.SCHEDULED:
        return 'badge badge-warning'
      case TripStatus.RUNNING:
        return 'badge'
      case TripStatus.CANCELLED:
        return 'badge badge-danger'
      default:
        return 'badge'
    }
  }

  const translateStatus = (status: TripStatus) => {
    switch (status) {
      case TripStatus.SCHEDULED:
        return 'Đang chuẩn bị'
      case TripStatus.RUNNING:
        return 'Đang chạy'
      case TripStatus.COMPLETED:
        return 'Hoàn thành'
      case TripStatus.CANCELLED:
        return 'Đã hủy'
      default:
        return status
    }
  }

  const formatTripDateTime = (isoStr: string) => {
    try {
      const date = new Date(isoStr)
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      return `${hours}:${minutes} - ${day}/${month}`
    } catch {
      return isoStr
    }
  }

  // Quick stats calculations
  const stats = useMemo(() => {
    const scheduled = trips.filter(t => t.status === TripStatus.SCHEDULED).length
    const running = trips.filter(t => t.status === TripStatus.RUNNING).length
    return {
      total: totalElements,
      scheduled,
      running
    }
  }, [trips, totalElements])

  return (
    <section className="page-stack" style={{ gap: '28px' }}>
      <div className="page-heading compact">
        <span className="eyebrow">Quản trị viên</span>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '4px 0' }}>Điều hành Chuyến Xe (Trips)</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Lập lịch xe chạy, thiết lập thông tin biển kiểm soát, loại xe giường nằm và biểu phí giá vé hành trình.</p>
      </div>

      {/* Stats Cards */}
      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <article className="metric-card" style={{ background: '#f8fafc' }}>
          <span>Tổng số chuyến điều hành</span>
          <strong style={{ fontSize: '28px', color: '#1e293b' }}>{stats.total}</strong>
          <em style={{ color: '#0f766e', fontStyle: 'normal' }}>Chuyến xe chạy</em>
        </article>
        <article className="metric-card" style={{ background: '#fffbeb', border: '1px solid #fef3c7' }}>
          <span style={{ color: '#b45309' }}>Chuyến chuẩn bị khởi hành</span>
          <strong style={{ fontSize: '28px', color: '#78350f' }}>{stats.scheduled}</strong>
          <em style={{ color: '#d97706', fontStyle: 'normal' }}>Đang mở bán vé</em>
        </article>
        <article className="metric-card" style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}>
          <span style={{ color: '#1e40af' }}>Xe đang di chuyển trên đường</span>
          <strong style={{ fontSize: '28px', color: '#1e3a8a' }}>{stats.running}</strong>
          <em style={{ color: '#2563eb', fontStyle: 'normal' }}>Đang vận hành</em>
        </article>
      </div>

      {/* Filtering & Search panel */}
      <div className="panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flex: 1, gap: '12px', minWidth: '280px', maxWidth: '500px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Tìm theo Tuyến đường, Biển kiểm soát, Loại xe..."
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

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
            <option value="">Tất cả trạng thái chuyến</option>
            <option value={TripStatus.SCHEDULED}>Chuẩn bị khởi hành</option>
            <option value={TripStatus.RUNNING}>Đang vận hành chạy</option>
            <option value={TripStatus.COMPLETED}>Đã hoàn thành chặng</option>
            <option value={TripStatus.CANCELLED}>Đã hủy chuyến</option>
          </select>
        </div>
      </div>

      <div className="detail-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 380px' }}>

        {/* Left Side: Table of Trips */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
              <Spinner label="Đang tải danh sách chuyến xe..." />
            </div>
          ) : error ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#ef4444' }}>
              <AlertCircle size={40} style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Lỗi tải dữ liệu</h3>
              <p style={{ fontSize: '14px', margin: '4px 0 0' }}>{error}</p>
              <Button onClick={fetchTrips} style={{ marginTop: '16px' }} variant="secondary">Thử lại</Button>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
              <AlertCircle size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Không tìm thấy chuyến xe</h3>
              <p style={{ fontSize: '14px', margin: '4px 0 0' }}>Vui lòng thay đổi từ khóa hoặc lên lịch chuyến mới ở bảng bên phải.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #edf2f7', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '16px 20px' }}>Tuyến chạy</th>
                    <th style={{ padding: '16px 20px' }}>Xe khách</th>
                    <th style={{ padding: '16px 20px' }}>Thời gian đi/đến</th>
                    <th style={{ padding: '16px 20px' }}>Giá vé</th>
                    <th style={{ padding: '16px 20px' }}>Ghế trống</th>
                    <th style={{ padding: '16px 20px' }}>Trạng thái</th>
                    <th style={{ padding: '16px 20px', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#334155' }}>
                  {filteredTrips.map((trip, idx) => (
                    <tr
                      key={trip.id}
                      style={{
                        borderBottom: '1px solid #edf2f7',
                        backgroundColor: idx % 2 === 0 ? '#fff' : '#fcfdfe',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      {/* Route Details */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'grid', gap: '2px' }}>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>{trip.routeName}</span>
                          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>
                            {trip.routeCode}
                          </span>
                        </div>
                      </td>

                      {/* Bus details */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'grid', gap: '2px' }}>
                          <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
                            {trip.busPlate}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Bus size={12} /> {trip.busType}
                          </span>
                          {(trip.driverName || trip.driverPhoneNumber) && (
                            <span style={{ fontSize: '11px', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              👤 {trip.driverName || 'Chưa rõ'} {trip.driverPhoneNumber ? `(${trip.driverPhoneNumber})` : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Schedule dates */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'grid', gap: '2px', fontSize: '13px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0f766e', fontWeight: 600 }}>
                            <Clock size={12} /> {formatTripDateTime(trip.departureTime)}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                            <ArrowRight size={10} /> {formatTripDateTime(trip.arrivalTime)}
                          </span>
                        </div>
                      </td>

                      {/* Prices */}
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0f766e' }}>
                        {formatCurrencyVnd(trip.price)}
                      </td>

                      {/* Available Seats Count */}
                      <td style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'center' }}>
                        <span style={{ backgroundColor: trip.availableSeatCount > 0 ? '#f0fdf4' : '#fef2f2', border: trip.availableSeatCount > 0 ? '1px solid #bbf7d0' : '1px solid #fee2e2', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', color: trip.availableSeatCount > 0 ? '#166534' : '#ef4444' }}>
                          {trip.availableSeatCount}
                        </span>
                      </td>

                      {/* Status select change dropdown */}
                      <td style={{ padding: '16px 20px' }}>
                        {statusUpdatingId === trip.id ? (
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Đang lưu...</span>
                        ) : (
                          <select
                            value={trip.status}
                            onChange={(e) => handleUpdateStatus(trip.id, e.target.value as TripStatus)}
                            className={getStatusBadge(trip.status)}
                            style={{
                              border: 'none',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value={TripStatus.SCHEDULED} style={{ color: '#000', backgroundColor: '#fff' }}>Chuẩn bị</option>
                            <option value={TripStatus.RUNNING} style={{ color: '#000', backgroundColor: '#fff' }}>Đang chạy</option>
                            <option value={TripStatus.COMPLETED} style={{ color: '#000', backgroundColor: '#fff' }}>Hoàn thành</option>
                            <option value={TripStatus.CANCELLED} style={{ color: '#000', backgroundColor: '#fff' }}>Đã hủy</option>
                          </select>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleEditClick(trip)}
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
                          </button>
                          <button
                            onClick={() => handleDelete(trip.id)}
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
                Trang <strong>{page + 1}</strong> / <strong>{totalPages}</strong> ({totalElements} chuyến)
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

        {/* Right Side: Form Panel */}
        <div style={{ position: 'sticky', top: '92px' }}>
          <form className="panel" onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px', padding: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
              <Plus size={18} style={{ color: '#0f766e' }} />
              {isEditing ? 'Cập Nhật Chuyến Xe' : 'Lập Lịch Chuyến Mới'}
            </h2>

            {/* Selection Route */}
            <div style={{ display: 'grid', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Tuyến chạy *</label>
              <select
                value={formRouteId}
                onChange={(e) => setFormRouteId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  outline: 'none'
                }}
                required
              >
                {routesList.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name} ({route.code})
                  </option>
                ))}
              </select>
            </div>

            {/* BKS - busPlate */}
            <div style={{ display: 'grid', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Biển kiểm soát xe *</label>
              <input
                type="text"
                placeholder="Ví dụ: 79B-012.34"
                value={formBusPlate}
                onChange={(e) => setFormBusPlate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                required
              />
            </div>

            {/* Bus Type */}
            <div style={{ display: 'grid', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Loại xe khách *</label>
              <select
                value={formBusType}
                onChange={(e) => setFormBusType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                required
              >
                <option value="Giường nằm 40 chỗ">Giường nằm 40 chỗ</option>
                <option value="Limousine 22 chỗ VIP">Limousine 22 chỗ VIP</option>
                <option value="Limousine 34 chỗ Luxury">Limousine 34 chỗ Luxury</option>
                <option value="Ghế ngồi 29 chỗ">Ghế ngồi 29 chỗ</option>
              </select>
            </div>

            {/* Times */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Thời gian đi *</label>
                <input
                  type="datetime-local"
                  value={formDepartureTime}
                  onChange={(e) => setFormDepartureTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                  required
                />
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Thời gian đến *</label>
                <input
                  type="datetime-local"
                  value={formArrivalTime}
                  onChange={(e) => setFormArrivalTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            </div>

            {/* Prices */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Giá gốc (VND)</label>
                <input
                  type="number"
                  value={formBasePrice || ''}
                  onChange={(e) => setFormBasePrice(Number(e.target.value))}
                  min="1000"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Giá bán vé *</label>
                <input
                  type="number"
                  value={formPrice || ''}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  min="1000"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            </div>

            {/* Drivers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Tên tài xế</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={formDriverName}
                  onChange={(e) => setFormDriverName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>SĐT tài xế</label>
                <input
                  type="tel"
                  placeholder="Ví dụ: 0912345678"
                  value={formDriverPhoneNumber}
                  onChange={(e) => setFormDriverPhoneNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <Button type="button" variant="secondary" onClick={resetForm} style={{ flex: 1 }}>
                Hủy
              </Button>
              <Button type="submit" disabled={formSubmitting} style={{ flex: 2 }}>
                {formSubmitting ? 'Đang gửi...' : isEditing ? 'Cập nhật' : 'Tạo chuyến'}
              </Button>
            </div>
          </form>
        </div>

      </div>
    </section>
  )
}
