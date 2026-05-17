export interface RouteStopResponse {
  id: string
  routeId: string
  routeName: string
  pointId: string
  pointName: string
  provinceCode: string
  provinceName: string
  orderIndex: number
  timeOffsetMinutes: number
  isPickUp: boolean
  isDropOff: boolean
}
