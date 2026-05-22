import { RouteStopResponse } from '../../types/response'
import { Select } from '../ui/Select'

type RouteStopSelectProps = {
  label: string
  value?: string
  stops: RouteStopResponse[]
  onChange: (stop: RouteStopResponse | null) => void
}

export const RouteStopSelect = ({ label, value, stops, onChange }: RouteStopSelectProps) => (
  <Select
    label={label}
    value={value || ''}
    onChange={(event) => onChange(stops.find((stop) => stop.id === event.target.value) || null)}
  >
    <option value="">Chon diem</option>
    {stops.map((stop) => (
      <option key={stop.id} value={stop.id}>
        {stop.pointName} - {stop.provinceName}
      </option>
    ))}
  </Select>
)

