import { SeatResponse } from './SeatResponse'

/**
 * Payload broadcast qua WebSocket khi ghế thay đổi trạng thái.
 * Gửi tới: /topic/trips/{tripId}/seats
 */
export interface SeatStatusUpdateResponse {
  tripId: string
  updatedSeats: SeatResponse[]
}
