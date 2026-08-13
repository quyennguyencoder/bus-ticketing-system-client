import { CheckCircle2, XCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export const PaymentResultPage = () => {
  const [params] = useSearchParams()
  const responseCode = params.get('vnp_ResponseCode')
  const orderId = params.get('vnp_TxnRef')
  const success = responseCode === '00'

  return (
    <section className="state payment-result">
      {success ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
      <h1>{success ? 'Thanh toán thành công!' : 'Thanh toán chưa thành công'}</h1>
      <p>
        {orderId ? `Mã đơn: ${orderId}. ` : ''}
        {success 
          ? 'Đơn hàng của bạn đã được thanh toán thành công. Hệ thống đang tiến hành xuất vé và gửi về email của bạn.'
          : 'Giao dịch của bạn đã bị huỷ hoặc có lỗi xảy ra trong quá trình thanh toán.'}
      </p>
      <Link to="/my-orders">
        <Button>Xem đơn của tôi</Button>
      </Link>
    </section>
  )
}

