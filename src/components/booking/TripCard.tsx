import { ArrowRight, Armchair, BusFront, Clock } from 'lucide-react'
import { TripResponse } from '../../types/response'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { formatCurrencyVnd, formatTime, formatTripDuration } from '../../utils/format'

export const TripCard = ({ trip, onSelect }: { trip: TripResponse; onSelect: () => void }) => (
  <article className="trip-card">
    <div>
      <div className="trip-route">
        <h3>{trip.routeName}</h3>
        <Badge tone={trip.status === 'SCHEDULED' ? 'success' : 'neutral'}>{trip.status}</Badge>
      </div>
      <div className="trip-meta">
        <span>
          <Clock size={16} />
          {formatTime(trip.departureTime)} - {formatTime(trip.arrivalTime)}
        </span>
        <span>{formatTripDuration(trip.departureTime, trip.arrivalTime)}</span>
        <span>
          <BusFront size={16} />
          {trip.busType}
        </span>
      </div>
    </div>
    <div className="trip-side">
      <strong>{formatCurrencyVnd(trip.price)}</strong>
      <span>
        <Armchair size={16} />
        {trip.availableSeatCount} ghe trong
      </span>
      <Button onClick={onSelect} icon={<ArrowRight size={16} />}>
        Chon chuyen
      </Button>
    </div>
  </article>
)

