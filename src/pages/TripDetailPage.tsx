import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  ShieldCheck, 
  Bus, 
  Calendar, 
  Clock, 
  Sparkles,
  Info,
  UserCheck
} from 'lucide-react'
import { BookingStepper } from '../components/booking/BookingStepper'
import { BookingSummary } from '../components/booking/BookingSummary'
import { SeatMap } from '../components/booking/SeatMap'
import { Button } from '../components/ui/Button'
import { ErrorState } from '../components/ui/ErrorState'
import { Spinner } from '../components/ui/Spinner'
import { seatService } from '../services/seat.service'
import { tripService } from '../services/trip.service'
import { useAuthStore } from '../stores/auth.store'
import { useBookingStore } from '../stores/booking.store'
import { SeatStatus } from '../types/enums'
import { getApiErrorMessage } from '../utils/api-error'
import { formatCurrencyVnd } from '../utils/format'
import { useSeatSocket } from '../hooks/useSeatSocket'
import bookingBg from '../assets/booking_bg.png'

export const TripDetailPage = () => {
  const { tripId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const {
    selectedTrip,
    seats,
    selectedSeats,
    pickupStop,
    dropoffStop,
    setSelectedTrip,
    setSeats,
    toggleSeat,
    setRouteStops,
  } = useBookingStore()
  const [loading, setLoading] = useState(true)
  const [holding, setHolding] = useState(false)
  const [error, setError] = useState('')

  const onHoldResult = useCallback((success: boolean) => {
    setHolding(false)
    if (success && tripId) {
      navigate(`/trips/${tripId}/stops`)
    }
  }, [navigate, tripId])

  useSeatSocket(tripId, onHoldResult)

  // Handle back navigation: if component mounts and hold is active, release seats
  useEffect(() => {
    const { holdExpiresAt: currentHold, selectedTrip: currentTrip, selectedSeats: currentSeats, setHoldExpiresAt: clearHold } = useBookingStore.getState()
    if (currentHold && currentTrip && currentSeats.length > 0) {
      void seatService.releaseSeats({
        tripId: currentTrip.id,
        seatIds: currentSeats.map((s) => s.id),
      }).catch(console.error)
      clearHold(null)
    }
  }, [])

  useEffect(() => {
    if (!tripId) return
    void Promise.resolve().then(() => {
      setLoading(true)
      return Promise.all([
        tripService.getTripById(tripId),
        tripService.getSeatsByTrip(tripId),
        tripService.getRouteStopsByTrip(tripId),
      ])
        .then(([tripResponse, seatResponse, stopResponse]) => {
          if (tripResponse.data) setSelectedTrip(tripResponse.data)
          setSeats(seatResponse.data || [])
          setRouteStops(stopResponse.data || [])
        })
        .catch((err) => setError(getApiErrorMessage(err)))
        .finally(() => setLoading(false))
    })
  }, [setRouteStops, setSeats, setSelectedTrip, tripId])

  const selectedSeatIds = selectedSeats.map((seat) => seat.id)

  const holdSeats = useCallback(async () => {
    if (!tripId) return
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/trips/${tripId}` } } })
      return
    }
    if (!selectedSeats.length) {
      toast.error('Vui lòng chọn ít nhất một ghế để tiếp tục')
      return
    }
    try {
      await seatService.holdSeats({ tripId, seatIds: selectedSeatIds })
    } catch (err) {
      toast.error(getApiErrorMessage(err))
      setHolding(false)
    }
  }, [isAuthenticated, navigate, selectedSeatIds, selectedSeats.length, tripId])

  const handleHoldSeats = useCallback(async () => {
    setHolding(true)
    await holdSeats()
  }, [holdSeats])

  const autoCheckout = (location.state as { autoCheckout?: boolean } | null)?.autoCheckout

  useEffect(() => {
    if (!autoCheckout) return
    navigate(location.pathname, { replace: true, state: null })
    void holdSeats()
  }, [autoCheckout, holdSeats, location.pathname, navigate])

  const formatTripTime = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const formatTripDate = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return ''
    }
  }

  if (loading) return <Spinner label="Đang tải sơ đồ ghế xe..." />
  if (error) return <ErrorState message={error} />

  const availableSeatsCount = seats.filter((seat) => seat.status === SeatStatus.AVAILABLE).length

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: -1,
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.75), rgba(248, 250, 252, 0.9)), url(${bookingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />
    <section className="page-stack" style={{ maxWidth: '1000px', margin: '100px auto 40px', padding: '0 24px', gap: '24px' }}>
      
      {/* Visual Stepper / Progress Bar */}
      <BookingStepper currentStep={1} />

      {/* Gorgeous Header Banner */}
      <header style={{ 
        background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
        color: '#fff',
        borderRadius: '16px',
        padding: '24px 28px',
        boxShadow: '0 4px 20px rgba(15, 118, 110, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle geometric overlay background */}
        <div style={{
          position: 'absolute',
          right: '-50px',
          top: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          zIndex: 1
        }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                backgroundColor: 'rgba(255,255,255,0.15)', 
                padding: '4px 10px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: 600,
                color: '#ccfbf1',
                marginBottom: '8px'
              }}>
                <Sparkles size={12} />
                Đối tác vận tải hàng đầu
              </span>
              <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#fff' }}>
                {selectedTrip?.routeName}
              </h1>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '13px', opacity: 0.85, display: 'block' }}>Giá vé đồng nhất</span>
              <strong style={{ fontSize: '26px', fontWeight: 800, color: '#2dd4bf' }}>
                {selectedTrip ? formatCurrencyVnd(selectedTrip.price) : ''}
              </strong>
              <span style={{ fontSize: '12px', opacity: 0.85, display: 'block' }}>/ vé</span>
            </div>
          </div>

          <div style={{ 
            borderTop: '1px solid rgba(255,255,255,0.15)', 
            paddingTop: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            fontSize: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} style={{ color: '#2dd4bf' }} />
              <span>{formatTripDate(selectedTrip?.departureTime)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: '#2dd4bf' }} />
              <span>Giờ xuất phát: <strong>{formatTripTime(selectedTrip?.departureTime)}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bus size={16} style={{ color: '#2dd4bf' }} />
              <span>{selectedTrip?.busType} ({selectedTrip?.busPlate})</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="detail-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '24px' }}>
        
        {/* Left: Seat Map Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="panel" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <div className="panel-heading" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid #edf2f7',
              paddingBottom: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#1e293b' }}>Sơ đồ chỗ ngồi</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>Vui lòng nhấp vào vị trí ghế mong muốn để đặt.</p>
              </div>
              <span style={{ 
                backgroundColor: '#f0fdf4', 
                border: '1px solid #bbf7d0', 
                color: '#166534', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '13px', 
                fontWeight: 600 
              }}>
                {availableSeatsCount} ghế còn trống
              </span>
            </div>

            {/* Sơ đồ ghế thực tế */}
            <div style={{ padding: '12px 0' }}>
              <SeatMap seats={seats} selectedSeatIds={selectedSeatIds} onToggle={toggleSeat} />
            </div>

            {/* Legend guide */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '24px', 
              borderTop: '1px solid #edf2f7',
              paddingTop: '20px',
              marginTop: '16px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#475569'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', display: 'inline-block' }} />
                Có thể chọn
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #0f766e', backgroundColor: '#0f766e', display: 'inline-block' }} />
                Đang chọn
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #fee2e2', backgroundColor: '#fee2e2', display: 'inline-block' }} />
                Đã được mua
              </span>
            </div>
          </div>

        </div>

        {/* Right: Booking Summary & Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '92px' }}>
          
          {/* Main Booking summary card */}
          <div className="panel" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ 
              backgroundColor: '#f8fafc', 
              borderBottom: '1px solid #edf2f7', 
              padding: '16px 20px' 
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={18} style={{ color: '#0f766e' }} />
                Tóm tắt vé đặt
              </h3>
            </div>
            
            <div style={{ padding: '20px' }}>
              <BookingSummary trip={selectedTrip} seats={selectedSeats} pickupStop={pickupStop} dropoffStop={dropoffStop} />
            </div>
          </div>

          {/* Seat temporary hold notification check */}
          <div style={{ 
            backgroundColor: '#eff6ff', 
            border: '1px solid #bfdbfe', 
            padding: '14px 16px', 
            borderRadius: '12px', 
            display: 'flex', 
            gap: '10px', 
            fontSize: '12px',
            lineHeight: 1.4,
            color: '#1e40af'
          }}>
            <Info size={18} style={{ flexShrink: 0, color: '#2563eb' }} />
            <div>
              <strong>Lưu ý:</strong> Sau khi nhấn Tiếp tục, hệ thống sẽ tạm khóa các ghế này trong vòng <strong>5 phút</strong> để bạn có thời gian chọn điểm dừng và hoàn tất giao dịch.
            </div>
          </div>

          {/* Checkout CTA button */}
          <Button 
            className="full-width" 
            onClick={handleHoldSeats} 
            disabled={holding} 
            icon={<ShieldCheck size={18} />}
            style={{ 
              padding: '14px', 
              fontSize: '15px', 
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)',
              borderRadius: '10px'
            }}
          >
            {holding ? 'Đang xử lý giữ chỗ...' : 'Giữ ghế & Tiếp tục'}
          </Button>
        </div>

      </div>
    </section>
    </>
  )
}
