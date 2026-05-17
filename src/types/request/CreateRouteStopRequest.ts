export interface CreateRouteStopRequest {
  routeId: string
  pointId: string
  orderIndex: number
  timeOffsetMinutes?: number
  isPickUp?: boolean
  isDropOff?: boolean
}
