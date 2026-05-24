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

  const formatStopRelativeTime = (baseDepartureTimeStr?: string, timeOffsetMinutes?: number) => {
    if (!baseDepartureTimeStr || timeOffsetMinutes === undefined) return ''
    try {
      const baseTime = new Date(baseDepartureTimeStr)
      if (isNaN(baseTime.getTime())) return ''
      
      const stopTime = new Date(baseTime.getTime() + timeOffsetMinutes * 60 * 1000)
      
      const hours = String(stopTime.getHours()).padStart(2, '0')
      const minutes = String(stopTime.getMinutes()).padStart(2, '0')
      const day = String(stopTime.getDate()).padStart(2, '0')
      const month = String(stopTime.getMonth() + 1).padStart(2, '0')
      
      return `${hours}:${minutes} (${day}/${month})`
    } catch {
      return ''
    }
  }

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
      
      {pickupStop ? (
        <div className="summary-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px', padding: '12px 0' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Diem don</span>
          <strong style={{ fontSize: '14px', color: '#1e293b' }}>
            {pickupStop.pointName} <span style={{ fontWeight: 400, color: '#64748b', fontSize: '12px' }}>({pickupStop.provinceName})</span>
          </strong>
          {trip && (
            <span style={{ fontSize: '11px', color: '#2563eb', backgroundColor: '#eff6ff', padding: '1px 6px', borderRadius: '4px', fontWeight: 500, marginTop: '2px' }}>
              Thời gian đón: {formatStopRelativeTime(trip.departureTime, pickupStop.timeOffsetMinutes)}
            </span>
          )}
        </div>
      ) : (
        <div className="summary-row">
          <span>Diem don</span>
          <strong>Chua chon</strong>
        </div>
      )}

      {dropoffStop ? (
        <div className="summary-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px', padding: '12px 0' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Diem tra</span>
          <strong style={{ fontSize: '14px', color: '#1e293b' }}>
            {dropoffStop.pointName} <span style={{ fontWeight: 400, color: '#64748b', fontSize: '12px' }}>({dropoffStop.provinceName})</span>
          </strong>
          {trip && (
            <span style={{ fontSize: '11px', color: '#059669', backgroundColor: '#d1fae5', padding: '1px 6px', borderRadius: '4px', fontWeight: 500, marginTop: '2px' }}>
              Thời gian trả: {formatStopRelativeTime(trip.departureTime, dropoffStop.timeOffsetMinutes)}
            </span>
          )}
        </div>
      ) : (
        <div className="summary-row">
          <span>Diem tra</span>
          <strong>Chua chon</strong>
        </div>
      )}

      <div className="summary-total">
        <span>Tong tien</span>
        <strong>{formatCurrencyVnd(total)}</strong>
      </div>
    </aside>
  )
}

