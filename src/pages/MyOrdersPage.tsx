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

  useEffect(() => {
    orderService
      .getMyOrders(0, 20)
      .then((response) => setOrders(response.data?.content || []))
      .catch((error) => toast.error(getApiErrorMessage(error)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="page-stack">
      <div className="page-heading compact">
        <span className="eyebrow">Tai khoan</span>
        <h1>Don hang cua toi</h1>
      </div>
      {loading ? <Spinner label="Dang tai don hang" /> : null}
      {!loading && !orders.length ? <EmptyState title="Ban chua co don hang">Cac ve da dat se xuat hien tai day.</EmptyState> : null}
      <div className="order-list">
        {orders.map((order) => (
          <article 
            className="order-card" 
            key={order.orderId} 
            onClick={() => navigate(`/my-orders/${order.orderId}`)}
            style={{ cursor: 'pointer' }}
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
  )
}

