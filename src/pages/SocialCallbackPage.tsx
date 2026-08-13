import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../stores/auth.store'
import { getApiErrorMessage } from '../utils/api-error'

export const SocialCallbackPage = () => {
  const { provider } = useParams<{ provider: string }>()
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const isCalled = useRef(false)

  useEffect(() => {
    if (isCalled.current) return
    isCalled.current = true

    const verifyCallback = async () => {
      if (!provider || !code) {
        toast.error('Tham số xác thực không hợp lệ')
        navigate('/login', { replace: true })
        return
      }

      try {
        const response = await authService.socialLoginCallback(provider, code)
        if (response.data) {
          setAuth(response.data)
          toast.success('Đăng nhập thành công')
          navigate('/', { replace: true })
        } else {
          throw new Error('Không nhận được dữ liệu xác thực')
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error))
        navigate('/login', { replace: true })
      }
    }

    verifyCallback()
  }, [provider, code, navigate, setAuth])

  return (
    <section className="auth-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto 16px', color: '#2563eb' }} />
        <h2>Đang xác thực...</h2>
        <p style={{ color: '#64748b' }}>Vui lòng đợi trong giây lát</p>
      </div>
    </section>
  )
}
