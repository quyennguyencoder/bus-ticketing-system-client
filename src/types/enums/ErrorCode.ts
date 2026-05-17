export enum ErrorCode {
  // ==========================================
  // Nhóm 10xx: System & Common Errors
  // ==========================================
  INTERNAL_SERVER_ERROR = 1000,
  INVALID_REQUEST = 1001,
  UNAUTHORIZED = 1002,
  ACCESS_DENIED = 1003,
  TOO_MANY_REQUESTS = 1004,

  // ==========================================
  // Nhóm 20xx: User & Authentication
  // ==========================================
  USER_NOT_FOUND = 2001,
  USER_ALREADY_EXISTS = 2002,
  EMAIL_ALREADY_EXISTS = 2003,
  PASSWORD_MISMATCH = 2004,
  INVALID_CREDENTIALS = 2005,
  ACCOUNT_NOT_VERIFIED = 2006,
  ACCOUNT_BANNED = 2007,
  INVALID_TOKEN = 2008,
  ROLE_NOT_FOUND = 2009,

  // ==========================================
  // Nhóm 30xx: Master Data (Province, Point, Route)
  // ==========================================
  PROVINCE_NOT_FOUND = 3001,
  PROVINCE_ALREADY_EXISTS = 3002,
  POINT_NOT_FOUND = 3003,
  ROUTE_NOT_FOUND = 3004,
  ROUTE_STOP_NOT_FOUND = 3005,

  // ==========================================
  // Nhóm 40xx: Trip & Seat Booking
  // ==========================================
  TRIP_NOT_FOUND = 4001,
  TRIP_NOT_SCHEDULED = 4002,
  SEAT_NOT_FOUND = 4003,
  SEAT_NOT_AVAILABLE = 4004,
  SEAT_NOT_BELONG_TO_TRIP = 4005,
  SEAT_OPTIMISTIC_LOCK = 4006,
  SEAT_LOCK_FAILED = 4007,
  SEAT_MAX_EXCEEDED = 4008,

  // ==========================================
  // Nhóm 50xx: Order & Payment
  // ==========================================
  ORDER_NOT_FOUND = 5001,
  ORDER_ALREADY_PROCESSED = 5002,
  ORDER_CANNOT_BE_CANCELLED = 5003,
  PAYMENT_VERIFICATION_FAILED = 5004,
  PAYMENT_AMOUNT_MISMATCH = 5005,
}

export interface ErrorDetail {
  code: ErrorCode;
  message: string;
  httpStatus: number;
}

export const ErrorCodeDetails: Record<ErrorCode, ErrorDetail> = {
  [ErrorCode.INTERNAL_SERVER_ERROR]: { code: 1000, message: "Lỗi hệ thống, vui lòng thử lại", httpStatus: 500 },
  [ErrorCode.INVALID_REQUEST]: { code: 1001, message: "Dữ liệu đầu vào không hợp lệ", httpStatus: 400 },
  [ErrorCode.UNAUTHORIZED]: { code: 1002, message: "Bạn cần đăng nhập để truy cập tài nguyên này", httpStatus: 401 },
  [ErrorCode.ACCESS_DENIED]: { code: 1003, message: "Bạn không có quyền truy cập tài nguyên này", httpStatus: 403 },
  [ErrorCode.TOO_MANY_REQUESTS]: { code: 1004, message: "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau", httpStatus: 429 },

  [ErrorCode.USER_NOT_FOUND]: { code: 2001, message: "Không tìm thấy người dùng", httpStatus: 404 },
  [ErrorCode.USER_ALREADY_EXISTS]: { code: 2002, message: "Người dùng đã tồn tại", httpStatus: 409 },
  [ErrorCode.EMAIL_ALREADY_EXISTS]: { code: 2003, message: "Email đã được sử dụng", httpStatus: 409 },
  [ErrorCode.PASSWORD_MISMATCH]: { code: 2004, message: "Mật khẩu không khớp", httpStatus: 400 },
  [ErrorCode.INVALID_CREDENTIALS]: { code: 2005, message: "Email hoặc mật khẩu không chính xác", httpStatus: 401 },
  [ErrorCode.ACCOUNT_NOT_VERIFIED]: { code: 2006, message: "Tài khoản chưa được xác thực", httpStatus: 403 },
  [ErrorCode.ACCOUNT_BANNED]: { code: 2007, message: "Tài khoản của bạn đã bị khóa", httpStatus: 403 },
  [ErrorCode.INVALID_TOKEN]: { code: 2008, message: "Token không hợp lệ hoặc đã hết hạn", httpStatus: 401 },
  [ErrorCode.ROLE_NOT_FOUND]: { code: 2009, message: "Không tìm thấy vai trò (Role) trong hệ thống", httpStatus: 404 },

  [ErrorCode.PROVINCE_NOT_FOUND]: { code: 3001, message: "Không tìm thấy tỉnh thành", httpStatus: 404 },
  [ErrorCode.PROVINCE_ALREADY_EXISTS]: { code: 3002, message: "Tỉnh thành đã tồn tại", httpStatus: 409 },
  [ErrorCode.POINT_NOT_FOUND]: { code: 3003, message: "Không tìm thấy điểm dừng", httpStatus: 404 },
  [ErrorCode.ROUTE_NOT_FOUND]: { code: 3004, message: "Không tìm thấy tuyến đường", httpStatus: 404 },
  [ErrorCode.ROUTE_STOP_NOT_FOUND]: { code: 3005, message: "Không tìm thấy điểm dừng tuyến đường", httpStatus: 404 },

  [ErrorCode.TRIP_NOT_FOUND]: { code: 4001, message: "Không tìm thấy chuyến xe", httpStatus: 404 },
  [ErrorCode.TRIP_NOT_SCHEDULED]: { code: 4002, message: "Chuyến xe không ở trạng thái hoạt động", httpStatus: 400 },
  [ErrorCode.SEAT_NOT_FOUND]: { code: 4003, message: "Không tìm thấy ghế", httpStatus: 404 },
  [ErrorCode.SEAT_NOT_AVAILABLE]: { code: 4004, message: "Một hoặc nhiều ghế đã được đặt, vui lòng chọn lại", httpStatus: 409 },
  [ErrorCode.SEAT_NOT_BELONG_TO_TRIP]: { code: 4005, message: "Ghế không thuộc chuyến xe này", httpStatus: 400 },
  [ErrorCode.SEAT_OPTIMISTIC_LOCK]: { code: 4006, message: "Dữ liệu ghế vừa thay đổi, vui lòng thử lại", httpStatus: 409 },
  [ErrorCode.SEAT_LOCK_FAILED]: { code: 4007, message: "Hệ thống đang xử lý, vui lòng thử lại sau", httpStatus: 503 },
  [ErrorCode.SEAT_MAX_EXCEEDED]: { code: 4008, message: "Chỉ được chọn tối đa 5 ghế mỗi lần", httpStatus: 400 },

  [ErrorCode.ORDER_NOT_FOUND]: { code: 5001, message: "Không tìm thấy đơn hàng", httpStatus: 404 },
  [ErrorCode.ORDER_ALREADY_PROCESSED]: { code: 5002, message: "Đơn hàng đã được xử lý trước đó", httpStatus: 409 },
  [ErrorCode.ORDER_CANNOT_BE_CANCELLED]: { code: 5003, message: "Đơn hàng không thể bị hủy ở trạng thái hiện tại", httpStatus: 409 },
  [ErrorCode.PAYMENT_VERIFICATION_FAILED]: { code: 5004, message: "Xác minh chữ ký thanh toán thất bại", httpStatus: 400 },
  [ErrorCode.PAYMENT_AMOUNT_MISMATCH]: { code: 5005, message: "Số tiền thanh toán không khớp", httpStatus: 400 },
};

/**
 * Utility function to get human-readable error message from an error code
 */
export const getErrorMessage = (code: ErrorCode | number): string => {
  return ErrorCodeDetails[code as ErrorCode]?.message || "Đã có lỗi xảy ra, vui lòng thử lại sau";
};
