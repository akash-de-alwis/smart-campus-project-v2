import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Notifications from './Notifications'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    // First navigate to home page
    navigate('/')
    // Clear auth state
    logout()
    // Call backend logout (fire and forget - don't wait for response)
    fetch('http://localhost:8080/logout', { credentials: 'include', mode: 'no-cors' }).catch(() => {})
  }

  // Extract role from authorities
  const userRole = user?.authorities?.find(auth => 
    auth.authority?.includes('ROLE_')
  )?.authority?.replace('ROLE_', '') || 'USER'

  return (
    <nav className="bg-white border-b border-gray-200 h-16 flex items-center px-6 sticky top-0 z-40">
      {/* Search Bar - Center */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-6">
        {/* Notifications */}
        <Notifications />

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* User Profile */}
        <Link to="/profile" className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
            {user?.profileImage ? (
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/files/${user.profileImage}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>
        </Link>
      </div>
    </nav>
  )
}
