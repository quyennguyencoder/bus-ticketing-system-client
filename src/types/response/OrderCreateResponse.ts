import { OrderStatus, PaymentMethod } from '../enums'

export interface OrderCreateResponse {
  orderId: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  totalAmount: number
  createdAt: string // ISO-8601 DateTime string
  /**
   * Chỉ có giá trị khi paymentMethod = VNPAY.
   * Client redirect user đến URL này để thanh toán.
   */
  paymentUrl?: string
}
