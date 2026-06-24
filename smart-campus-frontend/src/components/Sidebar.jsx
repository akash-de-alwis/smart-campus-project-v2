import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Home,
  Library,
  Calendar,
  AlertCircle,
  Settings,
  LogOut,
  Shield,
  Wrench,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const isAdmin = user?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN')
  const isTechnician = user?.authorities?.some(auth => auth.authority === 'ROLE_TECHNICIAN')

  const handleLogout = async () => {
    // First navigate to home page
    navigate('/')
    // Clear auth state
    logout()
    // Show success toast
    toast.success('Logged out successfully')
    // Call backend logout (fire and forget - don't wait for response)
    fetch('http://localhost:8080/logout', { credentials: 'include', mode: 'no-cors' }).catch(() => {})
  }

  const isActive = (path) => location.pathname === path

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Resources', path: '/resources', icon: Library },
    { name: 'My Bookings', path: '/bookings', icon: Calendar },
    { name: 'Support Tickets', path: '/tickets', icon: AlertCircle },
  ]

  const adminItems = isAdmin ? [
    { name: 'Admin Panel', path: '/admin', icon: Settings },
    { name: 'Manage Resources', path: '/admin/resources', icon: Library },
    { name: 'Manage Bookings', path: '/admin/bookings', icon: Calendar },
    { name: 'Manage Tickets', path: '/admin/tickets', icon: AlertCircle },
    { name: 'Manage Users', path: '/admin/users', icon: Shield },
  ] : []

  const technicianItems = isTechnician ? [
    { name: 'Technician Panel', path: '/technician/tickets', icon: Wrench },
  ] : []

  const NavItem = ({ item }) => {
    const Icon = item.icon
    const active = isActive(item.path)
    return (
      <Link
        key={item.path}
        to={item.path}
        className="relative group flex items-center justify-center py-3 mx-2"
        title={item.name}
      >
        <div
          className={`p-3 rounded-xl transition-all duration-200 ${
            active
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Icon size={22} strokeWidth={active ? 2.5 : 2} />
        </div>
        {/* Tooltip */}
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
          {item.name}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      </Link>
    )
  }

  return (
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-100">
        <img 
          src="https://i.pinimg.com/1200x/7e/f6/9e/7ef69e2c667f0e9a53d69151a0071fb8.jpg"
          alt="Smart Campus Logo"
          className="w-10 h-10 object-contain rounded-lg"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
        {menuItems.map(item => <NavItem key={item.path} item={item} />)}

        {adminItems.length > 0 && (
          <>
            <div className="my-4 mx-4 border-t border-gray-100" />
            {adminItems.map(item => <NavItem key={item.path} item={item} />)}
          </>
        )}

        {technicianItems.length > 0 && (
          <>
            <div className="my-4 mx-4 border-t border-gray-100" />
            {technicianItems.map(item => <NavItem key={item.path} item={item} />)}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-100 p-4">
        <button
          onClick={handleLogout}
          className="relative group flex items-center justify-center w-full py-3"
          title="Logout"
        >
          <div className="p-3 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
            <LogOut size={22} />
          </div>
          {/* Tooltip */}
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
            Logout
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </button>
      </div>
    </div>
  )
}
