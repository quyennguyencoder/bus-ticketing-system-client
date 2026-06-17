import React, { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { 
  Bus, 
  Plus, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  HelpCircle,
  XCircle,
  Clock,
  Layers
} from 'lucide-react'
import { tripService } from '../../services/trip.service'
import { seatService } from '../../services/seat.service'
import { TripResponse, SeatResponse } from '../../types/response'
import { SeatStatus } from '../../types/enums'
import { getApiErrorMessage } from '../../utils/api-error'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

export const AdminSeatsPage = () => {
  const [tripsList, setTripsList] = useState<TripResponse[]>([])
  const [selectedTripId, setSelectedTripId] = useState<string>('')
  const [seats, setSeats] = useState<SeatResponse[]>([])
  const [tripsLoading, setTripsLoading] = useState(true)
  const [seatsLoading, setSeatsLoading] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Add Seat Form State
  const [newSeatCode, setNewSeatCode] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Selected Seat for editing details
  const [selectedSeat, setSelectedSeat] = useState<SeatResponse | null>(null)

  // Fetch trips for dropdown list
  useEffect(() => {
    const fetchTrips = async () => {
      setTripsLoading(true)
      try {
        const response = await tripService.getAllTrips(0, 100)
        if (response.data) {
          setTripsList(response.data.content)
          if (response.data.content.length > 0) {
            setSelectedTripId(response.data.content[0].id)
          }
        }
      } catch (err) {
        toast.error('Không thể tải danh sách chuyến xe')
      } finally {
        setTripsLoading(false)
      }
    }
    fetchTrips()
  }, [])

  // Fetch seats whenever selectedTripId changes
  const fetchSeats = async () => {
    if (!selectedTripId) {
      setSeats([])
      return
    }
    setSeatsLoading(true)
    try {
      const response = await seatService.getSeatsByTrip(selectedTripId)
      if (response.data) {
        // Sort seats alphanumeric (e.g. A01, A02, B01...)
        const sorted = [...response.data].sort((a, b) => 
          a.seatCode.localeCompare(b.seatCode, undefined, { numeric: true, sensitivity: 'base' })
        )
        setSeats(sorted)
        setSelectedSeat(null) // Reset selection
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setSeatsLoading(false)
    }
  }

  useEffect(() => {
    fetchSeats()
  }, [selectedTripId])



  const handleAddSeat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTripId || !newSeatCode.trim()) {
      toast.error('Vui lòng điền mã ghế')
      return
    }

    const code = newSeatCode.trim().toUpperCase()

    // Client-side duplicate check
    if (seats.some(s => s.seatCode === code)) {
      toast.error(`Mã ghế ${code} đã tồn tại trong chuyến xe này!`)
      return
    }

    setFormSubmitting(true)
    try {
      const response = await seatService.createSeat({
        tripId: selectedTripId,
        seatCode: code
      })
      if (response.code === 200 || !response.code) {
        toast.success(`Đã thêm ghế ${code} thành công!`)
        setNewSeatCode('')
        fetchSeats()
      } else {
        throw new Error(response.message || 'Không thể thêm ghế')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleUpdateStatus = async (seatId: string, status: SeatStatus) => {
    setActionLoadingId(seatId)
    try {
      const response = await seatService.updateSeatStatus(seatId, status)
      if (response.code === 200 || !response.code) {
        toast.success('Cập nhật trạng thái ghế thành công!')
        fetchSeats()
      } else {
        throw new Error(response.message || 'Không thể cập nhật trạng thái')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteSeat = async (seatId: string, code: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ghế ${code} ra khỏi chuyến xe này?`)) return
    
    setActionLoadingId(seatId)
    try {
      const response = await seatService.deleteSeat(seatId)
      if (response.code === 200 || !response.code) {
        toast.success(`Đã xóa ghế ${code} thành công!`)
        fetchSeats()
      } else {
        throw new Error(response.message || 'Không thể xóa ghế')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setActionLoadingId(null)
    }
  }

  // Group seats by prefix row letter (e.g. A, B...) to render neat double decker or structured grids
  const seatLayoutRows = useMemo(() => {
    const rows: Record<string, SeatResponse[]> = {}
    seats.forEach((seat) => {
      const firstChar = seat.seatCode.charAt(0).toUpperCase()
      const rowKey = isNaN(Number(firstChar)) ? firstChar : 'Hàng'
      if (!rows[rowKey]) rows[rowKey] = []
      rows[rowKey].push(seat)
    })
    return Object.entries(rows).sort((a, b) => a[0].localeCompare(b[0]))
  }, [seats])

  const stats = useMemo(() => {
    const total = seats.length
    const available = seats.filter(s => s.status === SeatStatus.AVAILABLE).length
    const holding = seats.filter(s => s.status === SeatStatus.HOLDING).length
    const sold = seats.filter(s => s.status === SeatStatus.SOLD).length
    return { total, available, holding, sold }
  }, [seats])

  const getSeatColor = (status: SeatStatus, isChosen: boolean) => {
    if (isChosen) return '#2563eb' // Selected for editing
    switch (status) {
      case SeatStatus.SOLD:
        return '#f4d8d8' // red
      case SeatStatus.HOLDING:
        return '#fff4d6' // yellow
      default:
        return '#f1f5f9' // grey/available
    }
  }

  const getSeatTextColor = (status: SeatStatus, isChosen: boolean) => {
    if (isChosen) return '#fff'
    switch (status) {
      case SeatStatus.SOLD:
        return '#9b1c1c'
      case SeatStatus.HOLDING:
        return '#806000'
      default:
        return '#334155'
    }
  }

  const getSeatBorder = (status: SeatStatus, isChosen: boolean) => {
    if (isChosen) return '2px solid #2563eb'
    switch (status) {
      case SeatStatus.SOLD:
        return '1px solid #f87171'
      case SeatStatus.HOLDING:
        return '1px solid #fbbf24'
      default:
        return '1px solid #cbd5e1'
    }
  }

  return (
    <section className="page-stack" style={{ gap: '28px' }}>
      <div className="page-heading compact">
        <span className="eyebrow">Quản trị viên</span>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '4px 0' }}>Quản lý Trạng Thái Ghế (Seats)</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Giám sát trạng thái ghế nằm thực tế của từng chuyến xe, mở khóa ghế đang giữ và thay đổi sơ đồ phân phối chỗ ngồi.</p>
      </div>

      {/* Select Trip Header bar */}
      <div className="panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', background: 'linear-gradient(to right, #f8fafc, #f1f5f9)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#334155' }}>
          <Bus size={18} style={{ color: '#0f766e' }} />
          <span>Vui lòng chọn Chuyến xe:</span>
        </div>
        
        {tripsLoading ? (
          <Spinner label="Đang tải chuyến..." />
        ) : (
          <select
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            style={{
              minWidth: '320px',
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
            {tripsList.map((trip) => {
              const formattedDate = new Date(trip.departureTime).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })
              return (
                <option key={trip.id} value={trip.id}>
                  {trip.routeName} ({trip.busPlate}) - Khởi hành: {formattedDate}
                </option>
              )
            })}
          </select>
        )}
      </div>

      <div className="detail-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 360px' }}>
        
        {/* Left Side: Seat Map & Quick Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quick Metrics */}
          <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <article className="metric-card" style={{ background: '#f8fafc', padding: '12px' }}>
              <span style={{ fontSize: '12px' }}>Tổng số ghế</span>
              <strong style={{ fontSize: '24px' }}>{stats.total}</strong>
            </article>
            <article className="metric-card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px' }}>
              <span style={{ fontSize: '12px', color: '#166534' }}>Ghế trống</span>
              <strong style={{ fontSize: '24px', color: '#14532d' }}>{stats.available}</strong>
            </article>
            <article className="metric-card" style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '12px' }}>
              <span style={{ fontSize: '12px', color: '#b45309' }}>Đang giữ</span>
              <strong style={{ fontSize: '24px', color: '#78350f' }}>{stats.holding}</strong>
            </article>
            <article className="metric-card" style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '12px' }}>
              <span style={{ fontSize: '12px', color: '#991b1b' }}>Đã bán</span>
              <strong style={{ fontSize: '24px', color: '#7f1d1d' }}>{stats.sold}</strong>
            </article>
          </div>

          {/* Sơ đồ ghế */}
          <div className="panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Sơ đồ phân phối chỗ ngồi của chuyến xe
              </h3>
              
              <div className="seat-legend" style={{ fontSize: '12px' }}>
                <span><span className="legend available"></span>Trống</span>
                <span><span className="legend holding"></span>Đang giữ</span>
                <span><span className="legend sold"></span>Đã bán</span>
              </div>
            </div>

            {seatsLoading ? (
              <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
                <Spinner label="Đang tải sơ đồ ghế..." />
              </div>
            ) : seats.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b' }}>
                <AlertCircle size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Chuyến xe chưa khởi tạo ghế nào</h3>
                <p style={{ fontSize: '13px', margin: '4px 0 0' }}>Sử dụng form bên phải để thiết lập ghế cho chuyến xe này.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {seatLayoutRows.map(([rowName, rowSeats]) => (
                  <div key={rowName} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Tầng / Hàng {rowName}
                    </div>
                    
                    <div 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', 
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px dashed #e2e8f0'
                      }}
                    >
                      {rowSeats.map((seat) => {
                        const isChosen = selectedSeat?.id === seat.id
                        
                        return (
                          <button
                            key={seat.id}
                            disabled={actionLoadingId === seat.id}
                            onClick={() => setSelectedSeat(seat)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '10px 4px',
                              borderRadius: '8px',
                              backgroundColor: getSeatColor(seat.status, isChosen),
                              color: getSeatTextColor(seat.status, isChosen),
                              border: getSeatBorder(seat.status, isChosen),
                              fontSize: '14px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'all 0.15s ease',
                              boxShadow: isChosen ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'
                            }}
                          >
                            <span>{seat.seatCode}</span>
                            {seat.status === SeatStatus.HOLDING && (
                              <span style={{ fontSize: '9px', fontWeight: 500, marginTop: '2px', opacity: 0.85 }}>
                                <Clock size={8} style={{ display: 'inline', marginRight: '2px' }} />
                                Giữ ghế
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Form Panel */}
        <div style={{ position: 'sticky', top: '92px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Form to Add Individual Seat */}
          <form className="panel" onSubmit={handleAddSeat} style={{ display: 'grid', gap: '14px', padding: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
              <Plus size={18} style={{ color: '#0f766e' }} />
              Thêm Ghế Thủ Công
            </h2>
            
            <div style={{ display: 'grid', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Mã số ghế mới *</label>
              <input
                type="text"
                placeholder="Ví dụ: A03, B12..."
                value={newSeatCode}
                onChange={(e) => setNewSeatCode(e.target.value)}
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
                Ký tự đầu đại diện cho hàng ghế hoặc tầng của sơ đồ.
              </span>
            </div>

            <Button type="submit" disabled={formSubmitting} style={{ width: '100%' }}>
              {formSubmitting ? 'Đang thêm...' : 'Thêm Ghế Mới'}
            </Button>
          </form>

          {/* Actions & details panel for Selected Seat */}
          {selectedSeat ? (
            <div className="panel" style={{ display: 'grid', gap: '16px', padding: '20px', borderLeft: '4px solid #2563eb' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <Layers size={18} style={{ color: '#2563eb' }} />
                Ghế được chọn: <span style={{ color: '#2563eb', fontWeight: 900 }}>{selectedSeat.seatCode}</span>
              </h2>
              
              <div style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#475569', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <div>Trạng thái hiện tại: <strong>
                  {selectedSeat.status === SeatStatus.AVAILABLE ? 'Ghế trống (AVAILABLE)' : 
                   selectedSeat.status === SeatStatus.HOLDING ? 'Đang giữ (HOLDING)' : 'Đã bán (SOLD)'}
                </strong></div>
                {(selectedSeat as any).holdExpiresAt && (
                  <div style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <Clock size={12} /> Hết hạn giữ: {new Date((selectedSeat as any).holdExpiresAt).toLocaleTimeString('vi-VN')}
                  </div>
                )}
              </div>

              {/* Status Update Buttons */}
              <div style={{ display: 'grid', gap: '10px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Cập nhật trạng thái</label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedSeat.status !== SeatStatus.AVAILABLE && (
                    <Button 
                      variant="secondary"
                      onClick={() => handleUpdateStatus(selectedSeat.id, SeatStatus.AVAILABLE)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', borderColor: '#10b981', color: '#047857' }}
                    >
                      <CheckCircle size={14} /> Giải phóng / Đặt lại trống
                    </Button>
                  )}

                  {selectedSeat.status !== SeatStatus.SOLD && (
                    <Button 
                      onClick={() => handleUpdateStatus(selectedSeat.id, SeatStatus.SOLD)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', backgroundColor: '#ef4444', color: '#fff' }}
                    >
                      <XCircle size={14} /> Khóa ghế / Chuyển đã bán
                    </Button>
                  )}

                  {selectedSeat.status !== SeatStatus.HOLDING && (
                    <Button 
                      variant="secondary"
                      onClick={() => handleUpdateStatus(selectedSeat.id, SeatStatus.HOLDING)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                    >
                      <Clock size={14} /> Chuyển sang Giữ ghế
                    </Button>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '14px', marginTop: '4px', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleDeleteSeat(selectedSeat.id, selectedSeat.seatCode)}
                  style={{
                    width: '100%',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#ef4444',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Trash2 size={14} /> Xóa ghế này
                </button>
              </div>
            </div>
          ) : (
            <div className="panel" style={{ padding: '24px', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1' }}>
              <HelpCircle size={32} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
              <p style={{ fontSize: '13px', margin: 0 }}>
                Hãy <strong>click chọn 1 ghế</strong> trên sơ đồ để xem thông tin chi tiết và thao tác cập nhật trạng thái hoặc xóa ghế.
              </p>
            </div>
          )}

        </div>

      </div>
    </section>
  )
}
