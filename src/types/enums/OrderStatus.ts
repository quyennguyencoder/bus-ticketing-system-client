/**
 * Order status enumeration
 * PENDING: Đơn hàng vừa được tạo, chờ thanh toán
 * UNPAID: Đơn hàng chưa thanh toán
 * PAID: Đơn hàng đã thanh toán, vé được xác nhận
 * CANCELLED: Đơn hàng bị hủy, ghế trả lại
 * REFUND: Đơn hàng bị hoàn tiền
 * COMPLETED: Đơn hàng đã hoàn thành (chuyến đi kết thúc)
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  UNPAID = 'UNPAID',
  PAID = 'PAID',
    COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUND = 'REFUND',
}
