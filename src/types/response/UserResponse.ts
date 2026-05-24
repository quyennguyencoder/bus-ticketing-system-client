import { UserStatus } from '../enums/UserStatus'

export interface UserResponse {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  avatar?: string
  roles: string
  status?: UserStatus
}
