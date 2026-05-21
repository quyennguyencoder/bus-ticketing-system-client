import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ShieldCheck } from 'lucide-react'
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
import { formatCurrencyVnd, formatDateTime } from '../utils/format'
import { useSeatSocket } from '../hooks/useSeatSocket'

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
    setHoldExpiresAt,
  } = useBookingStore()
  const [loading, setLoading] = useState(true)
  const [holding, setHolding] = useState(false)
  const [error, setError] = useState('')

  useSeatSocket(tripId)

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
      toast.error('Hay chon it nhat mot ghe')
      return
    }
    try {
      await seatService.holdSeats({ tripId, seatIds: selectedSeatIds })
      setHoldExpiresAt(new Date(Date.now() + 5 * 60 * 1000).toISOString())
      toast.success('Da giu ghe, vui long hoan tat dat ve trong 5 phut')
      navigate(`/trips/${tripId}/stops`)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }, [isAuthenticated, navigate, selectedSeatIds, selectedSeats.length, setHoldExpiresAt, tripId])

  const handleHoldSeats = useCallback(async () => {
    setHolding(true)
    try {
      await holdSeats()
    } finally {
      setHolding(false)
    }
  }, [holdSeats])

  const autoCheckout = (location.state as { autoCheckout?: boolean } | null)?.autoCheckout

  useEffect(() => {
    if (!autoCheckout) return
    navigate(location.pathname, { replace: true, state: null })
    void holdSeats()
  }, [autoCheckout, holdSeats, location.pathname, navigate])

  if (loading) return <Spinner label="Dang tai chuyen xe" />
  if (error) return <ErrorState message={error} />

  return (
    <section className="page-stack">
      <div className="detail-grid">
        <div className="detail-main">
          <div className="page-heading compact">
            <span className="eyebrow">Chon ghe</span>
            <h1>{selectedTrip?.routeName}</h1>
            <p>
              {formatDateTime(selectedTrip?.departureTime)} - {selectedTrip?.busType} -{' '}
              {selectedTrip ? formatCurrencyVnd(selectedTrip.price) : ''}
            </p>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <h2>So do ghe</h2>
              <span>{seats.filter((seat) => seat.status === SeatStatus.AVAILABLE).length} ghe trong</span>
            </div>
            <SeatMap seats={seats} selectedSeatIds={selectedSeatIds} onToggle={toggleSeat} />
          </div>

        </div>

        <div className="detail-side">
          <Button className="full-width" variant="secondary" onClick={() => navigate(`/trips/${tripId}/stops`)}>
            Chon diem don va diem tra
          </Button>
          <BookingSummary trip={selectedTrip} seats={selectedSeats} pickupStop={pickupStop} dropoffStop={dropoffStop} />
          <Button className="full-width" onClick={handleHoldSeats} disabled={holding} icon={<ShieldCheck size={16} />}>
            {holding ? 'Dang giu ghe' : 'Giu ghe va tiep tuc'}
          </Button>
        </div>
      </div>
    </section>
  )
}
