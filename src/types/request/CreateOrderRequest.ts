import { PaymentMethod } from '../enums'

export interface CreateOrderRequest {
  seatIds: string[]
  tripId: string
  fullName: string
  email: string
  phoneNumber: string
  pickUpRouteStopId: string
  dropOffRouteStopId: string
  paymentMethod: PaymentMethod
}
