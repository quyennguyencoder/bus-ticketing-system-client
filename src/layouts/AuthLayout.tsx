import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Navbar } from '../components/layout/Navbar'

export const AuthLayout = () => (
  <div className="app-shell auth-shell">
    <Navbar />
    <main className="app-main">
      <Outlet />
    </main>
    {/* <Footer /> */}
    <Toaster position="top-right" toastOptions={{ duration: 3200 }} />
  </div>
)
