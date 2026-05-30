import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CreditCard } from 'lucide-react'
import { BookingStepper } from '../components/booking/BookingStepper'
import { BookingSummary } from '../components/booking/BookingSummary'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { orderService } from '../services/order.service'
import { useAuthStore } from '../stores/auth.store'
import { useBookingStore } from '../stores/booking.store'
import { PaymentMethod } from '../types/enums'
import { getApiErrorMessage } from '../utils/api-error'

export const CheckoutPage = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const {
    selectedTrip,
    selectedSeats,
    pickupStop,
    dropoffStop,
    passengerInfo,
    holdExpiresAt,
    setPassengerInfo,
    clearBooking,
  } = useBookingStore()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!selectedTrip || !selectedSeats.length || !pickupStop || !dropoffStop) {
      navigate('/trips/search', { replace: true })
      return
    }
    if (user) {
      setPassengerInfo({
        fullName: passengerInfo.fullName || user.fullName,
        email: passengerInfo.email || user.email,
        phoneNumber: passengerInfo.phoneNumber || user.phoneNumber,
      })
    }
  }, [dropoffStop, navigate, passengerInfo.email, passengerInfo.fullName, passengerInfo.phoneNumber, pickupStop, selectedSeats.length, selectedTrip, setPassengerInfo, user])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedTrip || !pickupStop || !dropoffStop) return
    setSubmitting(true)
    try {
      const response = await orderService.createOrder({
        tripId: selectedTrip.id,
        seatIds: selectedSeats.map((seat) => seat.id),
        fullName: passengerInfo.fullName,
        email: passengerInfo.email,
        phoneNumber: passengerInfo.phoneNumber,
        pickUpRouteStopId: pickupStop.id,
        dropOffRouteStopId: dropoffStop.id,
        paymentMethod: passengerInfo.paymentMethod,
      })

      if (!response.data) throw new Error(response.message || 'Khong tao duoc don hang')
      if (response.data.paymentMethod === PaymentMethod.VNPAY && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl
        return
      }

      toast.success('Tao don hang thanh cong')
      clearBooking()
      navigate('/my-orders')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page-stack">
      <BookingStepper currentStep={3} />
      <div className="page-heading compact">
        <span className="eyebrow">Thanh toan</span>
        <h1>Hoan tat thong tin dat ve</h1>
        <p>Ghe duoc giu tam thoi trong 5 phut. Hay hoan tat truoc khi het han.</p>
      </div>

      <div className="detail-grid">
        <form className="panel checkout-form" onSubmit={handleSubmit}>
          {holdExpiresAt ? <div className="notice">Han giu ghe: {new Date(holdExpiresAt).toLocaleTimeString('vi-VN')}</div> : null}
          
          {pickupStop && dropoffStop && selectedTrip && (
            <div 
              style={{ 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Thông tin hành trình đã chọn</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Tuyến: <strong>{selectedTrip.routeName}</strong></span>
              </div>
              
              <div style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '24px', paddingTop: '4px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6', zIndex: 2 }} />
                  <div style={{ flex: 1, width: '2px', borderLeft: '2px dashed #cbd5e1', margin: '4px 0', zIndex: 1 }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', zIndex: 2 }} />
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                      Đón: {pickupStop.pointName} <span style={{ fontWeight: 400, color: '#64748b' }}>({pickupStop.provinceName})</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 500, marginTop: '2px' }}>
                      Thời gian đón: {(() => {
                        try {
                          const baseTime = new Date(selectedTrip.departureTime)
                          const stopTime = new Date(baseTime.getTime() + pickupStop.timeOffsetMinutes * 60 * 1000)
                          const hours = String(stopTime.getHours()).padStart(2, '0')
                          const minutes = String(stopTime.getMinutes()).padStart(2, '0')
                          const day = String(stopTime.getDate()).padStart(2, '0')
                          const month = String(stopTime.getMonth() + 1).padStart(2, '0')
                          return `${hours}:${minutes} (${day}/${month})`
                        } catch {
                          return ''
                        }
                      })()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                      Trả: {dropoffStop.pointName} <span style={{ fontWeight: 400, color: '#64748b' }}>({dropoffStop.provinceName})</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#059669', fontWeight: 500, marginTop: '2px' }}>
                      Thời gian trả: {(() => {
                        try {
                          const baseTime = new Date(selectedTrip.departureTime)
                          const stopTime = new Date(baseTime.getTime() + dropoffStop.timeOffsetMinutes * 60 * 1000)
                          const hours = String(stopTime.getHours()).padStart(2, '0')
                          const minutes = String(stopTime.getMinutes()).padStart(2, '0')
                          const day = String(stopTime.getDate()).padStart(2, '0')
                          const month = String(stopTime.getMonth() + 1).padStart(2, '0')
                          return `${hours}:${minutes} (${day}/${month})`
                        } catch {
                          return ''
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Input
            label="Ho ten"
            value={passengerInfo.fullName}
            onChange={(event) => setPassengerInfo({ fullName: event.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={passengerInfo.email}
            onChange={(event) => setPassengerInfo({ email: event.target.value })}
            required
          />
          <Input
            label="So dien thoai"
            value={passengerInfo.phoneNumber}
            onChange={(event) => setPassengerInfo({ phoneNumber: event.target.value })}
            required
          />
          <Select
            label="Phuong thuc thanh toan"
            value={passengerInfo.paymentMethod}
            onChange={(event) => setPassengerInfo({ paymentMethod: event.target.value as PaymentMethod })}
          >
            <option value={PaymentMethod.VNPAY}>VNPAY</option>
            <option value={PaymentMethod.CASH}>Tien mat tai ben</option>
          </Select>
          <div className="form-actions">
            <Button type="submit" disabled={submitting} icon={<CreditCard size={16} />}>
              {submitting ? 'Dang tao don' : 'Tao don hang'}
            </Button>
          </div>
        </form>

        <BookingSummary trip={selectedTrip} seats={selectedSeats} pickupStop={pickupStop} dropoffStop={dropoffStop} />
      </div>
    </section>
  )
}

