import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Resources from './pages/Resources'
import ResourceDetail from './pages/ResourceDetail'
import Bookings from './pages/Bookings'
import BookingDetail from './pages/BookingDetail'
import BookingForm from './pages/BookingForm'
import Tickets from './pages/Tickets'
import TicketDetail from './pages/TicketDetail'
import TicketForm from './pages/TicketForm'
import AdminCheckIn from './pages/AdminCheckIn'
import Admin from './pages/Admin'
import AdminResources from './pages/AdminResources'
import AdminBookings from './pages/AdminBookings'
import AdminTickets from './pages/AdminTickets'
import TechnicianTickets from './pages/TechnicianTickets'
import AdminUsers from './pages/AdminUsers'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Unauthorized from './pages/Unauthorized'
import { LoadingSpinner } from './components/Common'

function App() {
  const { user, fetchCurrentUser, loading } = useAuthStore()
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await fetchCurrentUser()
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setInitializing(false)
      }
    }

    initializeAuth()
  }, [])

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const isAdmin = user?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN')
  const isTechnician = user?.authorities?.some(auth => auth.authority === 'ROLE_TECHNICIAN')

  const ProtectedRoute = ({ component: Component, ...rest }) => {
    if (!user) {
      return <Navigate to="/login" />
    }
    return <Component {...rest} />
  }

  const AdminRoute = ({ component: Component, ...rest }) => {
    if (!user) {
      return <Navigate to="/login" />
    }
    if (!isAdmin) {
      return <Navigate to="/unauthorized" />
    }
    return <Component {...rest} />
  }

  const TechnicianRoute = ({ component: Component, ...rest }) => {
    if (!user) {
      return <Navigate to="/login" />
    }
    if (!isTechnician) {
      return <Navigate to="/unauthorized" />
    }
    return <Component {...rest} />
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '1rem',
            padding: '1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
          },
        }}
        richColors
        closeButton
      />
      <Router>
        <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Landing page - full page without layout */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/:id" element={<ResourceDetail />} />
          <Route path="/bookings" element={<ProtectedRoute component={Bookings} />} />
          <Route path="/bookings/:id" element={<ProtectedRoute component={BookingDetail} />} />
          <Route path="/booking/new" element={<ProtectedRoute component={BookingForm} />} />
          <Route path="/booking/:id/edit" element={<ProtectedRoute component={BookingForm} />} />
          <Route path="/tickets" element={<ProtectedRoute component={Tickets} />} />
          <Route path="/tickets/:id" element={<ProtectedRoute component={TicketDetail} />} />
          <Route path="/ticket/new" element={<ProtectedRoute component={TicketForm} />} />
          <Route path="/profile" element={<ProtectedRoute component={Profile} />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute component={Admin} />} />
          <Route path="/admin/checkin" element={<AdminRoute component={AdminCheckIn} />} />
          <Route path="/admin/resources" element={<AdminRoute component={AdminResources} />} />
          <Route path="/admin/bookings" element={<AdminRoute component={AdminBookings} />} />
          <Route path="/admin/tickets" element={<AdminRoute component={AdminTickets} />} />
          <Route path="/admin/users" element={<AdminRoute component={AdminUsers} />} />

          {/* Technician Routes */}
          <Route path="/technician/tickets" element={<TechnicianRoute component={TechnicianTickets} />} />
        </Route>
      </Routes>
    </Router>
    </>
  )
}

export default App
