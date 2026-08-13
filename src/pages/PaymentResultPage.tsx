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
      <h1>{success ? 'Thanh toan dang duoc xac nhan' : 'Thanh toan chua thanh cong'}</h1>
      <p>
        {orderId ? `Ma don: ${orderId}. ` : ''}
        He thong se cap nhat don hang sau khi cong thanh toan gui ket qua ve backend.
      </p>
      <Link to="/my-orders">
        <Button>Xem don cua toi</Button>
      </Link>
    </section>
  )
}

