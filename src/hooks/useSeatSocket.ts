import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { SeatStatusUpdateResponse, HoldSeatsResponse } from '../types/response'
import { useAuthStore } from '../stores/auth.store'
import { useBookingStore } from '../stores/booking.store'

export const useSeatSocket = (tripId?: string, onHoldResult?: (success: boolean) => void) => {
  const accessToken = useAuthStore((state) => state.accessToken)
  const updateSeats = useBookingStore((state) => state.updateSeats)
  const setHoldExpiresAt = useBookingStore((state) => state.setHoldExpiresAt)

  useEffect(() => {
    if (!tripId) return

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    const client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
      connectHeaders: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      reconnectDelay: 5000,
      debug: () => undefined,
    })

    client.onConnect = () => {
      client.subscribe(`/topic/trips/${tripId}/seats`, (message) => {
        const payload = JSON.parse(message.body) as SeatStatusUpdateResponse
        const selectedBefore = useBookingStore.getState().selectedSeats.map((seat) => seat.id)
        updateSeats(payload.updatedSeats)
        const selectedAfter = useBookingStore.getState().selectedSeats.map((seat) => seat.id)
        if (selectedAfter.length < selectedBefore.length) {
          toast('Một ghế bạn đang chọn vừa thay đổi trạng thái')
        }
      })

      if (accessToken) {
        client.subscribe('/user/queue/hold-result', (message) => {
          const payload = JSON.parse(message.body) as HoldSeatsResponse
          if (payload.success) {
            toast.success(payload.message || 'Giữ ghế thành công!')
            setHoldExpiresAt(payload.holdExpireAt)
            onHoldResult?.(true)
          } else {
            toast.error(payload.message || 'Giữ ghế thất bại!')
            onHoldResult?.(false)
          }
        })
      }
    }

    client.activate()
    return () => {
      void client.deactivate()
    }
  }, [accessToken, tripId, updateSeats, setHoldExpiresAt, onHoldResult])
}

