import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Clock, MapPin, User, Receipt, CreditCard } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { orderService } from '../services/order.service'
import { tripService } from '../services/trip.service'
import { OrderResponse } from '../types/response'
import { getApiErrorMessage } from '../utils/api-error'
import { formatCurrencyVnd, formatDateTime } from '../utils/format'

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

  const [trip, setTrip] = useState<any>(null)

  useEffect(() => {
    if (!orderId) return
    orderService
      .getOrderById(orderId)
      .then((response) => {
        setOrder(response.data)
        if (response.data?.tripId) {
          tripService.getTripById(response.data.tripId)
            .then(res => setTrip(res.data))
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
      await orderService.cancelOrder(order.id)
      toast.success('Đã hủy đơn hàng thành công')
      const response = await orderService.getOrderById(order.id)
      setOrder(response.data)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-stack" style={{ gap: '20px' }}>
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
          
          <div className="panel" style={{ padding: '24px', borderRadius: '16px' }}>
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
                <span style={{ color: '#64748b' }}>Ghế đã đặt:</span>
                <strong style={{ textAlign: 'right', color: '#0f766e' }}>{order.seats?.map(s => s.seatCode).join(', ') || 'N/A'}</strong>
              </div>
            </div>
          </div>
          
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="panel" style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
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
                <Button className="full-width" variant="primary" style={{ marginBottom: '10px' }}>
                  Thanh toán ngay
                </Button>
                <Button className="full-width" variant="outline" onClick={handleCancel}>
                  Hủy đơn hàng
                </Button>
              </div>
            )}
          </div>

          <div className="panel" style={{ padding: '24px', borderRadius: '16px' }}>
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
  )
}
