/**
 * User status enumeration
 * ACTIVE: Tài khoản hoạt động bình thường
 * INACTIVE: Tài khoản chưa xác thực hoặc tạm khóa
 * BANNED: Tài khoản bị cấm (do bom hàng nhiều lần)
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
}
