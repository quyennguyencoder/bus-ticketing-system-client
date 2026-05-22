export const formatCurrencyVnd = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

export const formatDateTime = (value?: string) => {
  if (!value) return 'Chua co du lieu'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export const formatTime = (value?: string) => {
  if (!value) return '--:--'
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export const formatTripDuration = (departureTime?: string, arrivalTime?: string) => {
  if (!departureTime || !arrivalTime) return 'Dang cap nhat'
  const diffMs = new Date(arrivalTime).getTime() - new Date(departureTime).getTime()
  if (!Number.isFinite(diffMs) || diffMs <= 0) return 'Dang cap nhat'
  const minutes = Math.round(diffMs / 60000)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins ? `${hours}h ${mins}m` : `${hours}h`
}

