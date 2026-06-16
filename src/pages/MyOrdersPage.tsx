import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import { orderService } from '../services/order.service'
import { OrderResponse } from '../types/response'
import { getApiErrorMessage } from '../utils/api-error'
import { formatCurrencyVnd, formatDateTime } from '../utils/format'
import userBg from '../assets/user_bg.png'

const statusTone = (status: string) => {
  if (status === 'PAID' || status === 'COMPLETED') return 'success'
  if (status === 'CANCELLED' || status === 'REFUND') return 'danger'
  if (status === 'UNPAID') return 'warning'
  return 'neutral'
}

export const MyOrdersPage = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<string>('')

  useEffect(() => {
    setLoading(true)
    orderService
      .getMyOrders(0, 50, activeTab || undefined)
      .then((response) => setOrders(response.data?.content || []))
      .catch((error) => toast.error(getApiErrorMessage(error)))
      .finally(() => setLoading(false))
  }, [activeTab])

  return (
    <div style={{
      backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.75), rgba(248, 250, 252, 0.9)), url(${userBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: 'calc(100svh - 76px)',
      padding: '40px 0',
      width: '100vw',
      position: 'relative',
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      marginTop: '-34px',
      marginBottom: '-48px'
    }}>
      <section className="page-stack" style={{ maxWidth: '1000px', margin: '100px auto 40px', padding: '0 24px' }}>
        <div className="page-heading compact">
          <span className="eyebrow">Tai khoan</span>
          <h1>Don hang cua toi</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
          {[
            { label: 'Tất cả', value: '' },
            { label: 'Chưa thanh toán', value: 'UNPAID' },
            { label: 'Đã thanh toán', value: 'PAID' },
            { label: 'Đã hủy', value: 'CANCELLED' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: activeTab === tab.value ? '#0f766e' : '#f1f5f9',
                color: activeTab === tab.value ? '#fff' : '#475569',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? <Spinner label="Đang tải đơn hàng..." /> : null}
        {!loading && !orders.length ? <EmptyState title="Bạn chưa có đơn hàng nào">Các vé đã đặt sẽ xuất hiện tại đây.</EmptyState> : null}
        <div className="order-list">
          {orders.map((order) => (
            <article
              className="order-card"
              key={order.orderId}
              onClick={() => navigate(`/my-orders/${order.orderId}`)}
              style={{ cursor: 'pointer', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', borderRadius: '16px' }}
            >
              <div>
                <h3>Don {order.orderId}</h3>
                <p>{formatDateTime(order.createdAt)}</p>
                <p>Ghe: {order.seats?.map((seat) => seat.seatCode).join(', ') || 'Dang cap nhat'}</p>
              </div>
              <div className="order-side">
                <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                <strong>{formatCurrencyVnd(order.totalAmount)}</strong>
                <span>{order.paymentMethod}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

