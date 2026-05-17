import { SeatStatus } from '../enums'

export interface SeatResponse {
  id: string
  seatCode: string
  status: SeatStatus
}
