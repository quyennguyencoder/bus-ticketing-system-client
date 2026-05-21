import { TripResponse, SeatResponse, RouteStopResponse } from '../../types/response'
import { formatCurrencyVnd, formatTime } from '../../utils/format'

type BookingSummaryProps = {
  trip: TripResponse | null
  seats: SeatResponse[]
  pickupStop?: RouteStopResponse | null
  dropoffStop?: RouteStopResponse | null
}

export const BookingSummary = ({ trip, seats, pickupStop, dropoffStop }: BookingSummaryProps) => {
  const total = (trip?.price || 0) * seats.length

  return (
    <aside className="summary-panel">
      <h2>Tam tinh</h2>
      {trip ? (
        <>
          <div className="summary-row">
            <span>Tuyen</span>
            <strong>{trip.routeName}</strong>
          </div>
          <div className="summary-row">
            <span>Gio di</span>
            <strong>{formatTime(trip.departureTime)}</strong>
          </div>
        </>
      ) : null}
      <div className="summary-row">
        <span>Ghe</span>
        <strong>{seats.length ? seats.map((seat) => seat.seatCode).join(', ') : 'Chua chon'}</strong>
      </div>
      <div className="summary-row">
        <span>Diem don</span>
        <strong>{pickupStop?.pointName || 'Chua chon'}</strong>
      </div>
      <div className="summary-row">
        <span>Diem tra</span>
        <strong>{dropoffStop?.pointName || 'Chua chon'}</strong>
      </div>
      <div className="summary-total">
        <span>Tong tien</span>
        <strong>{formatCurrencyVnd(total)}</strong>
      </div>
    </aside>
  )
}

