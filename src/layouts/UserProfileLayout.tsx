import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'

export const UserProfileLayout = () => (
  <div className="app-shell profile-shell">
    <Navbar />
    <main className="app-main">
      <Outlet />
    </main>
    <Footer />
    <Toaster position="top-right" toastOptions={{ duration: 3200 }} />
  </div>
)
