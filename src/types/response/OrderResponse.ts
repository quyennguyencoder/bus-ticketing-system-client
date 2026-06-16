import { OrderStatus, PaymentMethod } from '../enums'
import { SeatResponse } from './SeatResponse'

export interface OrderResponse {
  orderId: string
  tripId: string
  fullName: string
  email: string
  phoneNumber: string
  pickUp: string
  dropOff: string
  totalAmount: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  createdAt: string // ISO-8601 DateTime string
  updatedAt: string // ISO-8601 DateTime string
  paymentUrl?: string
  seats: SeatResponse[]
}
