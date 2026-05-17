import { SeatResponse } from './SeatResponse'

/**
 * Payload private reply về /user/queue/hold-result.
 * success=false: ghế bị tranh chấp, kèm message lý do.
 * success=true: giữ ghế thành công, kèm thông tin đơn tạm thời.
 */
export interface HoldSeatsResponse {
  success: boolean
  message: string
  tripId: string
  heldSeats: SeatResponse[]
  holdExpireAt: string // ISO-8601 DateTime string
}
