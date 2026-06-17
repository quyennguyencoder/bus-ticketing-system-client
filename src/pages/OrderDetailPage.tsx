import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, User, Receipt, CreditCard } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { orderService } from '../services/order.service'
import { tripService } from '../services/trip.service'
import { OrderResponse, TripResponse } from '../types/response'
import { getApiErrorMessage } from '../utils/api-error'
import { formatCurrencyVnd, formatDateTime } from '../utils/format'
import userBg from '../assets/user_bg.png'

const statusTone = (status: string) => {
  if (status === 'PAID') return 'success'
  if (status === 'CANCELLED' || status === 'REFUND') return 'danger'
  if (status === 'UNPAID') return 'warning'
  return 'neutral'
}

export const OrderDetailPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const [trip, setTrip] = useState<TripResponse | null>(null)

  useEffect(() => {
    if (!orderId) return
    orderService
      .getOrderById(orderId)
      .then((response) => {
        setOrder(response.data || null)
        if (response.data?.tripId) {
          tripService.getTripById(response.data.tripId)
            .then(res => setTrip(res.data || null))
            .catch(console.error)
        }
      })
      .catch((error) => toast.error(getApiErrorMessage(error)))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) return <Spinner label="Đang tải chi tiết đơn hàng..." />
  if (!order) return <div style={{ textAlign: 'center', padding: '40px' }}>Không tìm thấy đơn hàng.</div>

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return
    try {
      setLoading(true)
      await orderService.cancelOrder(order.orderId)
      toast.success('Đã hủy đơn hàng thành công')
      const response = await orderService.getOrderById(order.orderId)
      setOrder(response.data || null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: -1,
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.75), rgba(248, 250, 252, 0.9)), url(${userBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />
    <section className="page-stack" style={{ gap: '20px', maxWidth: '1000px', margin: '100px auto 40px', padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <button 
          onClick={() => navigate('/my-orders')} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b', padding: '4px' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Chi tiết vé #{order.orderId}</h1>
        <Badge tone={statusTone(order.status)}>{order.status}</Badge>
      </div>

      <div className="detail-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="panel" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', margin: '0 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <Receipt size={18} style={{ color: '#0f766e' }} />
              Thông tin chuyến đi
            </h3>
            <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tuyến đường:</span>
                <strong style={{ textAlign: 'right' }}>{trip?.routeName || 'Đang cập nhật...'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Khởi hành:</span>
                <strong style={{ textAlign: 'right' }}>{trip ? formatDateTime(trip.departureTime) : 'Đang cập nhật...'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Xe:</span>
                <strong style={{ textAlign: 'right' }}>{trip?.busPlate} ({trip?.busType})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tên tài xế:</span>
                <strong style={{ textAlign: 'right' }}>
                  {trip?.driverName ? trip.driverName : 'Chưa cập nhật'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>SĐT tài xế:</span>
                <strong style={{ textAlign: 'right' }}>
                  {trip?.driverPhoneNumber ? trip.driverPhoneNumber : 'Chưa cập nhật'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Ghế đã đặt:</span>
                <strong style={{ textAlign: 'right', color: '#0f766e' }}>{order.seats?.map(s => s.seatCode).join(', ') || 'N/A'}</strong>
              </div>
              {order.pickUp && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Điểm đón:</span>
                  <strong style={{ textAlign: 'right' }}>{order.pickUp}</strong>
                </div>
              )}
              {order.dropOff && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Điểm trả:</span>
                  <strong style={{ textAlign: 'right' }}>{order.dropOff}</strong>
                </div>
              )}
            </div>
          </div>
          
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="panel" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(248, 250, 252, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', margin: '0 0 16px 0' }}>
              <CreditCard size={18} style={{ color: '#0f766e' }} />
              Thanh toán
            </h3>
            <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Ngày đặt:</span>
                <strong style={{ textAlign: 'right' }}>{formatDateTime(order.createdAt)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Phương thức:</span>
                <strong style={{ textAlign: 'right' }}>{order.paymentMethod}</strong>
              </div>
              <div style={{ borderTop: '1px dashed #cbd5e1', margin: '8px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#334155', fontWeight: 600 }}>Tổng tiền:</span>
                <strong style={{ fontSize: '20px', color: '#0f766e' }}>{formatCurrencyVnd(order.totalAmount)}</strong>
              </div>
            </div>
            
            {order.status === 'UNPAID' && (
              <div style={{ marginTop: '20px' }}>
                {order.paymentMethod === 'VNPAY' && (
                  <Button 
                    className="full-width" 
                    variant="primary" 
                    style={{ marginBottom: '10px' }}
                    onClick={() => {
                      if (order.paymentUrl) {
                        window.location.href = order.paymentUrl
                      } else {
                        toast.error('Không tìm thấy link thanh toán')
                      }
                    }}
                  >
                    Thanh toán ngay
                  </Button>
                )}
                <Button className="full-width" variant="secondary" onClick={handleCancel}>
                  Hủy đơn hàng
                </Button>
              </div>
            )}
          </div>

          <div className="panel" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', margin: '0 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <User size={18} style={{ color: '#0f766e' }} />
              Hành khách
            </h3>
            <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Họ tên:</span>
                <strong style={{ textAlign: 'right' }}>{order.fullName || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Số ĐT:</span>
                <strong style={{ textAlign: 'right' }}>{order.phoneNumber || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Email:</span>
                <strong style={{ textAlign: 'right' }}>{order.email || 'N/A'}</strong>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
    </>
  )
}
