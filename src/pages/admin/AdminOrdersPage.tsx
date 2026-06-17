import React, { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { orderService } from '../../services/order.service'
import { OrderResponse } from '../../types/response'
import { OrderStatus, PaymentMethod } from '../../types/enums'
import { getApiErrorMessage } from '../../utils/api-error'
import { formatCurrencyVnd } from '../../utils/format'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Pagination & Filtering state
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const size = 10

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await orderService.getAllOrders(page, size, statusFilter || undefined)
      if (response.data) {
        setOrders(response.data.content)
        setTotalPages(response.data.totalPages)
        setTotalElements(response.data.totalElements)
      } else {
        throw new Error(response.message || 'Không thể tải danh sách đơn hàng')
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [page, statusFilter])

  // Local Client Filtering for search term to make it instant and extremely responsive
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders
    const query = searchTerm.toLowerCase()
    return orders.filter(
      (order) =>
        order.fullName.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.phoneNumber.includes(query) ||
        order.orderId.toLowerCase().includes(query)
    )
  }, [orders, searchTerm])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
    setPage(0) // Reset to first page on filter change
  }

  const handleConfirmPayment = async (orderId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xác nhận thanh toán bằng tiền mặt cho đơn hàng này?')) return
    
    setActionLoadingId(orderId)
    try {
      const response = await orderService.confirmCashPayment(orderId)
      if (response.code === 200 || !response.code) {
        toast.success('Xác nhận thanh toán thành công!')
        fetchOrders()
      } else {
        throw new Error(response.message || 'Không thể xác nhận thanh toán')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này? Ghế sẽ được trả lại trạng thái trống.')) return
    
    setActionLoadingId(orderId)
    try {
      const response = await orderService.cancelOrder(orderId)
      if (response.code === 200 || !response.code) {
        toast.success('Đã hủy đơn hàng thành công!')
        fetchOrders()
      } else {
        throw new Error(response.message || 'Không thể hủy đơn hàng')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setActionLoadingId(null)
    }
  }

  // Calculate quick metrics for visual dashboard cards
  const metrics = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.status === OrderStatus.PAID)
      .reduce((sum, o) => sum + o.totalAmount, 0)
    const paidCount = orders.filter((o) => o.status === OrderStatus.PAID).length
    const pendingCount = orders.filter(
      (o) => o.status === OrderStatus.PENDING || o.status === OrderStatus.UNPAID
    ).length

    return {
      totalRevenue,
      paidCount,
      pendingCount,
      totalCount: totalElements
    }
  }, [orders, totalElements])

  // Get status badge class
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PAID:
      case OrderStatus.COMPLETED:
        return 'badge badge-success'
      case OrderStatus.PENDING:
      case OrderStatus.UNPAID:
        return 'badge badge-warning'
      case OrderStatus.CANCELLED:
        return 'badge badge-danger'
      default:
        return 'badge'
    }
  }

  // Translate status to Vietnamese
  const translateStatus = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PAID:
        return 'Đã thanh toán'
      case OrderStatus.PENDING:
        return 'Chờ thanh toán'
      case OrderStatus.UNPAID:
        return 'Chưa thanh toán'
      case OrderStatus.CANCELLED:
        return 'Đã hủy'
      case OrderStatus.REFUND:
        return 'Hoàn tiền'
      case OrderStatus.COMPLETED:
        return 'Đã hoàn thành'
      default:
        return status
    }
  }

  const formatOrderDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <section className="page-stack" style={{ gap: '28px' }}>
      <div className="page-heading compact" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="eyebrow">Quản trị viên</span>
          <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '4px 0' }}>Quản lý Đơn hàng</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Theo dõi, xác nhận thanh toán tiền mặt và hủy vé của hành khách.</p>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <article className="metric-card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe' }}>
          <span style={{ color: '#1e40af' }}>Tổng đơn hàng toàn hệ thống</span>
          <strong style={{ color: '#1e3a8a', fontSize: '32px' }}>{metrics.totalCount}</strong>
          <em style={{ color: '#2563eb', fontWeight: 600, fontStyle: 'normal' }}>Đơn hàng</em>
        </article>
        
        <article className="metric-card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0' }}>
          <span style={{ color: '#166534' }}>Doanh thu (trang hiện tại)</span>
          <strong style={{ color: '#14532d', fontSize: '32px' }}>{formatCurrencyVnd(metrics.totalRevenue)}</strong>
          <em style={{ color: '#16a34a', fontWeight: 600, fontStyle: 'normal' }}>Đã xác nhận</em>
        </article>

        <article className="metric-card" style={{ background: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)', border: '1px solid #fef08a' }}>
          <span style={{ color: '#854d0e' }}>Đơn chờ thanh toán (trang hiện tại)</span>
          <strong style={{ color: '#713f12', fontSize: '32px' }}>{metrics.pendingCount}</strong>
          <em style={{ color: '#ca8a04', fontWeight: 600, fontStyle: 'normal' }}>Đang chờ xử lý</em>
        </article>
      </div>

      {/* Filters Bar */}
      <div className="panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flex: 1, gap: '12px', minWidth: '280px', maxWidth: '500px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Tìm theo Mã đơn, Họ tên, Email, Số điện thoại..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
            <Filter size={16} />
            <span>Trạng thái:</span>
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            style={{
              padding: '10px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#fff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value={OrderStatus.PENDING}>Chờ thanh toán</option>
            <option value={OrderStatus.UNPAID}>Chưa thanh toán</option>
            <option value={OrderStatus.PAID}>Đã thanh toán</option>
            <option value={OrderStatus.COMPLETED}>Đã hoàn thành</option>
            <option value={OrderStatus.CANCELLED}>Đã hủy</option>
            <option value={OrderStatus.REFUND}>Hoàn tiền</option>
          </select>
        </div>
      </div>

      {/* Main Table / Content List */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
            <Spinner label="Đang tải dữ liệu đơn hàng..." />
          </div>
        ) : error ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#ef4444' }}>
            <AlertCircle size={40} style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Lỗi tải dữ liệu</h3>
            <p style={{ fontSize: '14px', margin: '4px 0 0' }}>{error}</p>
            <Button onClick={fetchOrders} style={{ marginTop: '16px' }} variant="secondary">Thử lại</Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
            <AlertCircle size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Không tìm thấy đơn hàng</h3>
            <p style={{ fontSize: '14px', margin: '4px 0 0' }}>
              {searchTerm ? 'Không tìm thấy kết quả khớp với từ khóa tìm kiếm.' : 'Chưa có đơn hàng nào khớp bộ lọc.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #edf2f7', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '16px 20px' }}>Mã Đơn hàng</th>
                  <th style={{ padding: '16px 20px' }}>Hành khách</th>
                  <th style={{ padding: '16px 20px' }}>Vé ghế</th>
                  <th style={{ padding: '16px 20px' }}>Tổng tiền</th>
                  <th style={{ padding: '16px 20px' }}>Thanh toán</th>
                  <th style={{ padding: '16px 20px' }}>Trạng thái</th>
                  <th style={{ padding: '16px 20px' }}>Ngày mua</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody style={{ color: '#334155' }}>
                {filteredOrders.map((order, idx) => {
                  const isActionable = 
                    order.status === OrderStatus.PENDING || 
                    order.status === OrderStatus.UNPAID

                  return (
                    <tr 
                      key={order.orderId} 
                      style={{ 
                        borderBottom: '1px solid #edf2f7', 
                        backgroundColor: idx % 2 === 0 ? '#fff' : '#fcfdfe',
                        transition: 'background-color 0.2s'
                      }}
                      className="table-row-hover"
                    >
                      {/* Order ID */}
                      <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                        <span title={order.orderId} style={{ fontFamily: 'monospace', color: '#0f172a' }}>
                          #{order.orderId.substring(0, 8)}...
                        </span>
                      </td>

                      {/* Customer Details */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'grid', gap: '2px' }}>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{order.fullName}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                            <Phone size={12} /> {order.phoneNumber}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                            <Mail size={12} /> {order.email}
                          </span>
                        </div>
                      </td>

                      {/* Seats */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {order.seats.map((seat) => (
                            <span 
                              key={seat.id} 
                              style={{ 
                                display: 'inline-block', 
                                backgroundColor: '#f1f5f9', 
                                border: '1px solid #e2e8f0', 
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#475569'
                              }}
                            >
                              {seat.seatCode}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0f766e' }}>
                        {formatCurrencyVnd(order.totalAmount)}
                      </td>

                      {/* Payment Method */}
                      <td style={{ padding: '16px 20px' }}>
                        <span 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            fontSize: '13px', 
                            fontWeight: 500,
                            color: order.paymentMethod === PaymentMethod.VNPAY ? '#2563eb' : '#b45309'
                          }}
                        >
                          <CreditCard size={14} />
                          {order.paymentMethod === PaymentMethod.VNPAY ? 'VNPAY' : 'Tiền mặt'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        <span className={getStatusBadge(order.status)}>
                          {translateStatus(order.status)}
                        </span>
                      </td>

                      {/* Created At */}
                      <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '13px' }}>
                        {formatOrderDate(order.createdAt)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {isActionable && order.paymentMethod === PaymentMethod.CASH && (
                            <button
                              onClick={() => handleConfirmPayment(order.orderId)}
                              disabled={actionLoadingId !== null}
                              title="Xác nhận thanh toán tiền mặt"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: '#10b981',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                            >
                              <CheckCircle size={14} />
                              Xác nhận
                            </button>
                          )}
                          
                          {isActionable && (
                            <button
                              onClick={() => handleCancelOrder(order.orderId)}
                              disabled={actionLoadingId !== null}
                              title="Hủy đơn hàng"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                            >
                              <XCircle size={14} />
                              Hủy đơn
                            </button>
                          )}

                          {!isActionable && (
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', paddingRight: '8px' }}>
                              Không thao tác
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Panel */}
        {!loading && !error && totalPages > 1 && (
          <div style={{ borderTop: '1px solid #edf2f7', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              Hiển thị trang <strong>{page + 1}</strong> trên tổng số <strong>{totalPages}</strong> trang ({totalElements} đơn)
            </span>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="secondary"
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page === 0}
                style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ChevronLeft size={16} />
                Trước
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={page === totalPages - 1}
                style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Sau
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
