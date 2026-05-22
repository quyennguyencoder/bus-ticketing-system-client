import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RouteStopSelect } from '../components/booking/RouteStopSelect'
import { Button } from '../components/ui/Button'
import { ErrorState } from '../components/ui/ErrorState'
import { Spinner } from '../components/ui/Spinner'
import { tripService } from '../services/trip.service'
import { useBookingStore } from '../stores/booking.store'
import { getApiErrorMessage } from '../utils/api-error'

export const TripStopsPage = () => {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { routeStops, pickupStop, dropoffStop, setRouteStops, setPickupStop, setDropoffStop } = useBookingStore()
  const [loading, setLoading] = useState(() => !routeStops.length)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tripId) return
    if (routeStops.length) return
    tripService
      .getRouteStopsByTrip(tripId)
      .then((response) => setRouteStops(response.data || []))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [routeStops.length, setRouteStops, tripId])

  const pickupStops = useMemo(() => routeStops.filter((stop) => stop.isPickUp), [routeStops])
  const dropoffStops = useMemo(() => routeStops.filter((stop) => stop.isDropOff), [routeStops])

  const handleConfirm = () => {
    if (!pickupStop || !dropoffStop) return
    navigate('/checkout')
  }

  if (loading) return <Spinner label="Dang tai diem don/tra" />
  if (error) return <ErrorState message={error} />

  return (
    <section className="page-stack">
      <div className="page-heading compact">
        <span className="eyebrow">Chon diem don/tra</span>
        <h1>Lua chon diem don va diem tra</h1>
      </div>

      <div className="panel two-cols">
        <RouteStopSelect label="Diem don" stops={pickupStops} value={pickupStop?.id} onChange={setPickupStop} />
        <RouteStopSelect label="Diem tra" stops={dropoffStops} value={dropoffStop?.id} onChange={setDropoffStop} />
      </div>

      <div className="panel-actions">
        <Button variant="secondary" onClick={() => navigate(`/trips/${tripId}`)}>
          Quay lai
        </Button>
        <Button onClick={handleConfirm} disabled={!pickupStop || !dropoffStop}>
          Xac nhan
        </Button>
      </div>
    </section>
  )
}
