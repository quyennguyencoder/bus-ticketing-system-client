import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LogIn } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuthStore } from '../stores/auth.store'
import { getApiErrorMessage } from '../utils/api-error'
import { authService } from '../services/auth.service'
import authBg from '../assets/auth_bg.png'

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    try {
      await login({ email, password })
      toast.success('Dang nhap thanh cong')
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setLoading(true)
    try {
      const response = await authService.socialLogin(provider)
      if (response.data?.authUrl) {
        window.location.href = response.data.authUrl
      } else {
        throw new Error('Khong the lay dia chi dang nhap')
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error))
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: -1,
        backgroundImage: `url(${authBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />
      <section className="auth-page" style={{ 
        minHeight: 'calc(100svh - 150px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 0 40px'
      }}>
      <form className="auth-card" onSubmit={handleSubmit} style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', padding: '40px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', minWidth: '400px', border: '1px solid rgba(255,255,255,0.4)' }}>
        <h1>Dang nhap</h1>
        <p>Tiep tuc dat ve va quan ly cac don hang cua ban.</p>
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Input
          label="Mat khau"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <Button type="submit" disabled={loading} icon={<LogIn size={16} />}>
          {loading ? 'Dang xu ly' : 'Dang nhap'}
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 12px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
          <span style={{ padding: '0 16px', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Hoặc đăng nhập với
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
          <Button
            type="button"
            variant="secondary"
            style={{ flex: 1, display: 'flex', justifyContent: 'center', color: '#db4437', borderColor: '#f8d7da', backgroundColor: '#fff' }}
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            }
          >
            Google
          </Button>
          <Button
            type="button"
            variant="secondary"
            style={{ flex: 1, display: 'flex', justifyContent: 'center', color: '#4267B2', borderColor: '#d1e7dd', backgroundColor: '#fff' }}
            onClick={() => handleSocialLogin('facebook')}
            disabled={loading}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
              </svg>
            }
          >
            Facebook
          </Button>
        </div>

        <span style={{ textAlign: 'center', display: 'block', marginTop: '16px' }}>
          Chua co tai khoan? <Link to="/register" style={{ fontWeight: 600 }}>Dang ky</Link>
        </span>
      </form>
      </section>
    </>
  )
}

