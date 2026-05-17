/**
 * Seat status enumeration
 * AVAILABLE: Ghế trống, có thể đặt
 * HOLDING: Ghế đang được giữ (tạm thời, có TTL)
 * SOLD: Ghế đã bán, không thể đặt
 */
export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  HOLDING = 'HOLDING',
  SOLD = 'SOLD',
}
