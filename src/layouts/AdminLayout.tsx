import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AdminSidebar } from '../components/layout/AdminSidebar.tsx'
import { Footer } from '../components/layout/Footer'

export const AdminLayout = () => (
  <div className="app-shell admin-shell">
    <AdminSidebar />
    <div className="admin-content">
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
    <Toaster position="top-right" toastOptions={{ duration: 3200 }} />
  </div>
)
