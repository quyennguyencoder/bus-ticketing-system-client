import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { seatService } from '../services/seat.service'
import { useBookingStore } from '../stores/booking.store'

export const BookingLayout = () => {
  const navigate = useNavigate()
  const holdExpiresAt = useBookingStore(state => state.holdExpiresAt)
  const setHoldExpiresAt = useBookingStore(state => state.setHoldExpiresAt)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    return () => {
      const { selectedTrip, selectedSeats, clearBooking } = useBookingStore.getState()
      if (!selectedTrip || !selectedSeats.length) return

      void (async () => {
        try {
          await seatService.releaseSeats({
            tripId: selectedTrip.id,
            seatIds: selectedSeats.map((seat) => seat.id),
          })
        } finally {
          clearBooking()
        }
      })()
    }
  }, [])

  useEffect(() => {
    if (!holdExpiresAt) {
      setTimeLeft(null)
      return
    }
    const interval = setInterval(() => {
      const remaining = Math.floor((new Date(holdExpiresAt).getTime() - Date.now()) / 1000)
      if (remaining <= 0) {
        clearInterval(interval)
        setTimeLeft(0)
        setHoldExpiresAt(null)
        toast.error('Đã hết thời gian giữ ghế. Vui lòng chọn lại.')
        const { selectedTrip } = useBookingStore.getState()
        if (selectedTrip) {
          navigate(`/trips/${selectedTrip.id}`)
        }
      } else {
        setTimeLeft(remaining)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [holdExpiresAt, setHoldExpiresAt, navigate])

  const formatTimeLeft = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {holdExpiresAt && timeLeft !== null && timeLeft > 0 && (
        <div style={{ 
          backgroundColor: '#fffbeb', 
          border: '1px solid #fde68a', 
          padding: '12px 24px', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          fontSize: '15px',
          fontWeight: 600,
          color: '#92400e',
          boxShadow: '0 2px 4px rgba(251, 191, 36, 0.1)',
          marginTop: '10px'
        }}>
          <Clock size={20} />
          <span>Thời gian giữ ghế còn lại:</span>
          <span style={{ fontSize: '20px', color: '#b45309', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {formatTimeLeft(timeLeft)}
          </span>
        </div>
      )}
      <Outlet />
    </div>
  )
}
