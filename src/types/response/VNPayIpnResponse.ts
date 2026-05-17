/**
 * VNPay yêu cầu response IPN phải đúng format này.
 * RspCode="00" & Message="Confirm Success" = server đã xử lý thành công.
 * Bất kỳ response nào khác -> VNPay sẽ retry IPN.
 */
export interface VNPayIpnResponse {
  RspCode: string
  Message: string
}
