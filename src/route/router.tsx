import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { BookingLayout } from '../layouts/BookingLayout'
import { MainLayout } from '../layouts/MainLayout'
import { UserProfileLayout } from '../layouts/UserProfileLayout'
import { ProtectedRoute } from '../route/ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage'
import { AdminPointsPage } from '../pages/admin/AdminPointsPage'
import { AdminProfilePage } from '../pages/admin/AdminProfilePage'
import { AdminRouteStopsPage } from '../pages/admin/AdminRouteStopsPage'
import { AdminRoutesPage } from '../pages/admin/AdminRoutesPage'
import { AdminSeatsPage } from '../pages/admin/AdminSeatsPage'
import { AdminTripsPage } from '../pages/admin/AdminTripsPage'
import { AdminUsersPage } from '../pages/admin/AdminUsersPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { MyOrdersPage } from '../pages/MyOrdersPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PaymentResultPage } from '../pages/PaymentResultPage'
import { ProfilePage } from '../pages/ProfilePage'
import { RegisterPage } from '../pages/RegisterPage'
import { OrderDetailPage } from '../pages/OrderDetailPage'
import { TripDetailPage } from '../pages/TripDetailPage'
import { TripSearchPage } from '../pages/TripSearchPage'
import { TripStopsPage } from '../pages/TripStopsPage'
import { SocialCallbackPage } from '../pages/SocialCallbackPage'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/trips/search', element: <TripSearchPage /> },
      {
        element: <BookingLayout />,
        children: [
          { path: '/trips/:tripId', element: <TripDetailPage /> },
          { path: '/trips/:tripId/stops', element: <TripStopsPage /> },
          {
            element: <ProtectedRoute />,
            children: [{ path: '/checkout', element: <CheckoutPage /> }],
          },
        ],
      },
      { path: '/payment-result', element: <PaymentResultPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/auth/:provider/callback/', element: <SocialCallbackPage /> },
    ],
  },
  {
    element: <UserProfileLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/my-orders', element: <MyOrdersPage /> },
          { path: '/my-orders/:orderId', element: <OrderDetailPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <RoleRoute roles={['ADMIN', 'STAFF']} />,
            children: [
              { path: '/admin', element: <Navigate to="/admin/dashboard" replace /> },
              { path: '/admin/dashboard', element: <AdminDashboardPage /> },
              { path: '/admin/orders', element: <AdminOrdersPage /> },
              { path: '/admin/trips', element: <AdminTripsPage /> },
              { path: '/admin/seats', element: <AdminSeatsPage /> },
              { path: '/admin/points', element: <AdminPointsPage /> },
              { path: '/admin/routes', element: <AdminRoutesPage /> },
              { path: '/admin/route-stops', element: <AdminRouteStopsPage /> },
              { path: '/admin/users', element: <AdminUsersPage /> },
              { path: '/admin/profile', element: <AdminProfilePage /> },
            ],
          },
        ],
      },
    ],
  },
])

