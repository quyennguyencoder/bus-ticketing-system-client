/**
 * Order status enumeration
 * PENDING: Đơn hàng vừa được tạo, chờ thanh toán
 * UNPAID: Đơn hàng chưa thanh toán
 * PAID: Đơn hàng đã thanh toán, vé được xác nhận
 * CANCELLED: Đơn hàng bị hủy, ghế trả lại
 * REFUND: Đơn hàng bị hoàn tiền
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REFUND = 'REFUND',
}
