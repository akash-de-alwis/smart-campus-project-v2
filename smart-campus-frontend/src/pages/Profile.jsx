import { useEffect, useState, useRef } from 'react'
import { User, Mail, Phone, Building, Calendar, Edit2, Save, X, Shield, Clock, Bell, Ticket, BookOpen, CheckCircle2, Loader2, Camera } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { userAPI, bookingAPI, ticketAPI } from '../services/api'
import { LoadingSpinner, ErrorAlert, SuccessAlert, Badge } from '../components/Common'
import NotificationPreferences from '../components/NotificationPreferences'

export default function Profile() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    department: '',
    building: '',
  })
  const [validationErrors, setValidationErrors] = useState({})
  const [stats, setStats] = useState({
    activeBookings: 0,
    openTickets: 0,
    resourcesUsed: 0,
  })
  const [statsLoading, setStatsLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data } = await userAPI.getProfile().catch(() => ({ data: user }))
      setProfile(data)
      setFormData({
        phone: data.phone || '',
        department: data.department || '',
        building: data.building || '',
      })
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const [bookingsRes, ticketsRes] = await Promise.all([
        bookingAPI.getMyBookings().catch(() => ({ data: [] })),
        ticketAPI.getMyTickets().catch(() => ({ data: [] })),
      ])

      const bookings = bookingsRes.data || []
      const tickets = ticketsRes.data || []

      // Active bookings = not CANCELLED or REJECTED
      const activeBookings = bookings.filter(b => 
        b.status !== 'CANCELLED' && b.status !== 'REJECTED'
      ).length

      // Open tickets = OPEN or IN_PROGRESS
      const openTickets = tickets.filter(t => 
        t.status === 'OPEN' || t.status === 'IN_PROGRESS'
      ).length

      // Unique resources used (from all bookings)
      const uniqueResources = new Set(bookings.map(b => b.resourceId)).size

      setStats({
        activeBookings,
        openTickets,
        resourcesUsed: uniqueResources,
      })
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  const validateField = (name, value) => {
    const errors = {}
    
    if (name === 'phone') {
      if (value && !/^\d{10}$/.test(value)) {
        errors.phone = 'Phone number must be exactly 10 digits'
      }
    }
    
    if (name === 'department') {
      if (!value || value === '') {
        errors.department = 'Please select a department'
      }
    }
    
    if (name === 'building') {
      if (!value || value.trim() === '') {
        errors.building = 'Building / Office is required'
      } else if (value.trim().length < 2) {
        errors.building = 'Building name must be at least 2 characters'
      } else if (value.trim().length > 100) {
        errors.building = 'Building name must not exceed 100 characters'
      }
    }
    
    return errors
  }

  const validateForm = () => {
    const errors = {}
    
    // Phone validation (optional field but if provided must be exactly 10 digits)
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits'
    }
    
    // Department validation (required)
    if (!formData.department || formData.department === '') {
      errors.department = 'Please select a department'
    }
    
    // Building validation (required)
    if (!formData.building || formData.building.trim() === '') {
      errors.building = 'Building / Office is required'
    } else if (formData.building.trim().length < 2) {
      errors.building = 'Building name must be at least 2 characters'
    } else if (formData.building.trim().length > 100) {
      errors.building = 'Building name must not exceed 100 characters'
    }
    
    return errors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }))
    }
    
    // Real-time validation for the changed field
    const fieldErrors = validateField(name, value)
    if (fieldErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: fieldErrors[name] }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all fields before submission
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      setValidationErrors({})
      const response = await userAPI.updateProfile(formData)
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
      
      // Refresh profile data with updated information
      setProfile(response.data)
      
      // Update form data to reflect changes
      setFormData({
        phone: response.data.phone || '',
        department: response.data.department || '',
        building: response.data.building || '',
      })
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setImageUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await userAPI.uploadProfileImage(formData)
      setProfile(prev => ({ ...prev, profileImage: response.data.profileImage }))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to upload profile image')
      setTimeout(() => setError(null), 3000)
    } finally {
      setImageUploading(false)
    }
  }

  if (loading && !profile) return <LoadingSpinner />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">View and manage your profile information</p>
      </div>

      {error && <ErrorAlert message={error} />}
      {success && <SuccessAlert message="Profile updated successfully!" />}

      {/* Hero Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 text-white shadow-2xl shadow-orange-500/20"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold shadow-inner group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {profile?.profileImage ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/files/${profile.profileImage}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {imageUploading ? (
                    <Loader2 size={24} className="animate-spin text-white" />
                  ) : (
                    <Camera size={24} className="text-white" />
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={imageUploading}
              />
              <div className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg">
                {user?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN') ? (
                  <Shield size={16} className="text-orange-500" />
                ) : user?.authorities?.some(auth => auth.authority === 'ROLE_TECHNICIAN') ? (
                  <Ticket size={16} className="text-blue-500" />
                ) : (
                  <User size={16} className="text-green-500" />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-1">{user?.name || 'User'}</h2>
              <p className="text-white/80 text-lg mb-4">{user?.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Badge variant="light" className="bg-white/20 text-white border-0 backdrop-blur-sm">
                  {user?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN') 
                    ? 'Administrator' 
                    : user?.authorities?.some(auth => auth.authority === 'ROLE_TECHNICIAN')
                      ? 'Technician'
                      : 'Student'}
                </Badge>
                <Badge variant="light" className="bg-white/20 text-white border-0 backdrop-blur-sm flex items-center gap-1">
                  <Clock size={12} />
                  Member since {new Date(2024, 0, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-3xl font-bold">
                {statsLoading ? <Loader2 size={28} className="animate-spin mx-auto" /> : stats.activeBookings}
              </p>
              <p className="text-white/70 text-sm">Active Bookings</p>
            </div>
            <div className="text-center border-x border-white/20">
              <p className="text-3xl font-bold">
                {statsLoading ? <Loader2 size={28} className="animate-spin mx-auto" /> : stats.openTickets}
              </p>
              <p className="text-white/70 text-sm">Open Tickets</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">
                {statsLoading ? <Loader2 size={28} className="animate-spin mx-auto" /> : stats.resourcesUsed}
              </p>
              <p className="text-white/70 text-sm">Resources Used</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <User size={20} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
              <p className="text-sm text-gray-500">Manage your personal details</p>
            </div>
          </div>
          {!editing && (
            <motion.button
              onClick={() => setEditing(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-orange-500/20"
            >
              <Edit2 size={16} />
              Edit Profile
            </motion.button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone size={16} className="text-orange-500" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="10-digit phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all ${
                        validationErrors.phone 
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                          : 'border-transparent focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                      }`}
                    />
                    {validationErrors.phone && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <X size={14} /> {validationErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Building size={16} className="text-orange-500" />
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all ${
                        validationErrors.department 
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                          : 'border-transparent focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                      }`}
                    >
                      <option value="">Select Department</option>
                      <option value="IT Department">IT Department</option>
                      <option value="Management Department">Management Department</option>
                      <option value="Financial Department">Financial Department</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Academic Affairs">Academic Affairs</option>
                      <option value="Student Services">Student Services</option>
                      <option value="Facilities & Maintenance">Facilities & Maintenance</option>
                      <option value="Research & Development">Research & Development</option>
                      <option value="Library Services">Library Services</option>
                      <option value="Security Department">Security Department</option>
                      <option value="General Administration">General Administration</option>
                    </select>
                    {validationErrors.department && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <X size={14} /> {validationErrors.department}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Building size={16} className="text-orange-500" />
                      Building / Office Location
                    </label>
                    <input
                      type="text"
                      name="building"
                      placeholder="e.g., Engineering Building, Room 101"
                      value={formData.building}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all ${
                        validationErrors.building 
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                          : 'border-transparent focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                      }`}
                    />
                    {validationErrors.building && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <X size={14} /> {validationErrors.building}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setEditing(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {[
                  { icon: Phone, label: 'Phone', value: profile?.phone, bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
                  { icon: Building, label: 'Department', value: profile?.department, bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
                  { icon: Building, label: 'Office', value: profile?.building, bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group p-5 bg-gray-50/80 hover:bg-white rounded-2xl border border-transparent hover:border-gray-200 transition-all duration-300"
                  >
                    <div className={`p-3 ${item.bgColor} rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform`}>
                      <item.icon size={20} className={item.textColor} />
                    </div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{item.label}</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{item.value || 'Not provided'}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      {/* Notifications Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Bell size={20} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
              <p className="text-sm text-gray-500">Manage how you receive updates</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <NotificationPreferences />
        </div>
      </motion.div>
    </div>
  )
}
