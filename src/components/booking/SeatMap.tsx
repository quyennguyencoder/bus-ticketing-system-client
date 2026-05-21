import { SeatStatus } from '../../types/enums'
import { SeatResponse } from '../../types/response'

type SeatMapProps = {
  seats: SeatResponse[]
  selectedSeatIds: string[]
  onToggle: (seat: SeatResponse) => void
}

export const SeatMap = ({ seats, selectedSeatIds, onToggle }: SeatMapProps) => {
  const sortedSeats = [...seats].sort((a, b) => a.seatCode.localeCompare(b.seatCode, 'vi', { numeric: true }))

  return (
    <div className="seat-map-wrap">
      <div className="seat-map">
        {sortedSeats.map((seat) => {
          const selected = selectedSeatIds.includes(seat.id)
          const disabled = seat.status !== SeatStatus.AVAILABLE
          return (
            <button
              key={seat.id}
              type="button"
              className={`seat seat-${seat.status.toLowerCase()} ${selected ? 'seat-selected' : ''}`}
              disabled={disabled}
              onClick={() => onToggle(seat)}
              title={`${seat.seatCode} - ${seat.status}`}
            >
              {seat.seatCode}
            </button>
          )
        })}
      </div>
      <div className="seat-legend">
        <span><i className="legend available" /> Trong</span>
        <span><i className="legend selected" /> Dang chon</span>
        <span><i className="legend holding" /> Dang giu</span>
        <span><i className="legend sold" /> Da ban</span>
      </div>
    </div>
  )
}

