import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Calendar, Clock, Users, FileText } from 'lucide-react'
import { bookingAPI, resourceAPI } from '../services/api'
import { LoadingSpinner, ErrorAlert } from '../components/Common'
import { useAuthStore } from '../store/authStore'

export default function BookingForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!id)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const isEditing = !!id

  // Check if we have pre-selected resource from navigation state
  const preSelectedResource = location.state?.resourceId

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
  }, [user, navigate])
  const [formData, setFormData] = useState({
    resourceId: preSelectedResource || '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: 1,
  })

  useEffect(() => {
    fetchResources()
    if (isEditing) {
      fetchBooking()
    } else if (preSelectedResource) {
      // Auto-fill the resource selection when coming from resource details page
      setFormData(prev => ({
        ...prev,
        resourceId: preSelectedResource
      }))
    }
  }, [id, preSelectedResource])

  const fetchResources = async () => {
    try {
      const { data } = await resourceAPI.getAll()
      setResources(data || [])
    } catch (err) {
      setError('Failed to load resources')
    }
  }

  const fetchBooking = async () => {
    try {
      setInitialLoading(true)
      const { data } = await bookingAPI.getById(id)
      
      // Convert ISO dates back to local datetime-local format
      const convertToDateTimeLocal = (isoString) => {
        if (!isoString) return ''
        const date = new Date(isoString)
        // Get timezone offset and adjust
        const offset = date.getTimezoneOffset()
        const localDate = new Date(date.getTime() + (offset * 60 * 1000))
        return localDate.toISOString().slice(0, 16)
      }
      
      setFormData({
        resourceId: data.resourceId,
        startTime: convertToDateTimeLocal(data.startTime),
        endTime: convertToDateTimeLocal(data.endTime),
        purpose: data.purpose,
        expectedAttendees: data.expectedAttendees || 1,
      })
      setError(null)
    } catch (err) {
      setError('Failed to load booking details')
    } finally {
      setInitialLoading(false)
    }
  }

  const validateField = (name, value) => {
    const newErrors = { ...errors }

    if (name === 'purpose') {
      if (!value || value.trim().length === 0) {
        newErrors.purpose = 'Purpose of booking is required'
      } else if (value.trim().length < 10) {
        newErrors.purpose = 'Purpose of booking must be at least 10 characters'
      } else {
        delete newErrors.purpose
      }
    }

    setErrors(newErrors)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'expectedAttendees') {
      const parsed = parseInt(value)
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(parsed) ? 1 : parsed,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
    // Validate on change
    if (name === 'purpose') {
      validateField(name, value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all fields
    validateField('purpose', formData.purpose)

    if (!formData.resourceId || !formData.startTime || !formData.endTime || !formData.purpose.trim()) {
      setError('Please fill in all required fields')
      return
    }

    if (formData.purpose.trim().length < 10) {
      setError('Purpose of booking must be at least 10 characters long')
      return
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      setError('End time must be after start time')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Convert datetime-local to ISO format for backend (preserve local timezone)
      const convertToISO = (dateTimeLocal) => {
        const date = new Date(dateTimeLocal)
        // Get timezone offset in minutes and adjust
        const offset = date.getTimezoneOffset()
        const localDate = new Date(date.getTime() - (offset * 60 * 1000))
        return localDate.toISOString()
      }
      
      const bookingData = {
        ...formData,
        userId: user.email, // Add authenticated user's email as userId
        startTime: convertToISO(formData.startTime),
        endTime: convertToISO(formData.endTime)
      }
      
      console.log('Sending booking data:', bookingData)
      
      if (isEditing) {
        await bookingAPI.update(id, bookingData)
        toast.success('Booking updated successfully!')
        setTimeout(() => navigate('/bookings'), 1500)
      } else {
        await bookingAPI.create(bookingData)
        toast.success('Booking created successfully!')
        setTimeout(() => navigate('/bookings'), 1500)
      }
    } catch (err) {
      console.error('Booking error:', err)
      
      let errorMessage = `Failed to ${isEditing ? 'update' : 'create'} booking`
      
      if (err.response?.data) {
        const errorData = err.response.data
        if (typeof errorData === 'object' && errorData !== null) {
          // Handle validation errors
          errorMessage = Object.values(errorData).join(', ')
        } else {
          // Handle single error message
          errorMessage = errorData.error || errorData
        }
      }
      
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) return <LoadingSpinner />

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Booking' : 'New Booking'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditing ? 'Update your booking details' : 'Book a campus resource for your event'}
        </p>
      </div>

      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
        {/* Resource Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Select Resource *
          </label>
          <select
            name="resourceId"
            value={formData.resourceId}
            onChange={handleChange}
            className="input-field text-base"
            required
          >
            <option value="">-- Choose a resource --</option>
            {resources.map(resource => (
              <option key={resource.id} value={resource.id}>
                {resource.name} ({resource.type}) - Capacity: {resource.capacity}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <Calendar size={16} className="mr-2 text-orange-500" />
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <Clock size={16} className="mr-2 text-orange-500" />
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Expected Attendees */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <Users size={16} className="mr-2 text-orange-500" />
            Expected Attendees
          </label>
          <input
            type="number"
            name="expectedAttendees"
            value={formData.expectedAttendees}
            onChange={handleChange}
            min="1"
            className="input-field"
          />
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <FileText size={16} className="mr-2 text-orange-500" />
            Purpose of Booking *
          </label>
          <textarea
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            rows="3"
            className={`input-field resize-none ${errors.purpose ? 'border-red-500 focus:border-red-500' : ''}`}
            placeholder="Enter the purpose of your booking..."
            required
          />
          {errors.purpose && (
            <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-500 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? `${isEditing ? 'Updating' : 'Creating'}...` : `${isEditing ? 'Update' : 'Create'} Booking`}
          </button>
          <button
            type="button"
            onClick={() => navigate('/bookings')}
            className="flex-1 border-2 border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-medium hover:border-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
