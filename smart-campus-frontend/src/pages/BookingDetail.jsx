import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, Clock, Users, FileText, ArrowLeft } from 'lucide-react'
import { bookingAPI, resourceAPI } from '../services/api'
import { LoadingSpinner, ErrorAlert, SuccessAlert } from '../components/Common'
import QRCodeDisplay from '../components/QRCodeDisplay'

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBooking()
  }, [id])

  const fetchBooking = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await bookingAPI.getById(id)
      setBooking(data)
      
      // Fetch resource details to get resource name.
      if (data.resourceId) {
        try {
          const resourceResponse = await resourceAPI.getById(data.resourceId)
          setResource(resourceResponse.data)
        } catch (err) {
          console.error('Failed to fetch resource details:', err)
        }
      }
    } catch (err) {
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString()
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'danger',
      CANCELLED: 'gray',
    }
    return colors[status] || 'gray'
  }

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorAlert message={error} />
        <button
          onClick={() => navigate('/bookings')}
          className="mt-4 btn-outline"
        >
          Back to Bookings
        </button>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Booking not found</p>
        <button
          onClick={() => navigate('/bookings')}
          className="mt-4 btn-outline"
        >
          Back to Bookings
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/bookings')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Bookings
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
      </div>

      {/* Status Badge */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">Booking Status</span>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            booking.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {booking.status}
          </span>
        </div>
      </div>

      {/* QR Code Display */}
      <QRCodeDisplay booking={booking} />

      {/* Booking Information */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Information</h2>
        
        <div className="space-y-6">
          {/* Resource */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Resource
            </label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900 text-lg">
                {resource?.name || booking.resourceId}
              </p>
              {resource && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Type: {resource.type?.replace(/_/g, ' ')}</p>
                  <p>Location: {resource.location}</p>
                  <p>Capacity: {resource.capacity} people</p>
                </div>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <Calendar size={16} className="mr-2" />
                Start Time
              </label>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">
                  {formatDateTime(booking.startTime)}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <Clock size={16} className="mr-2" />
                End Time
              </label>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">
                  {formatDateTime(booking.endTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Expected Attendees */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <Users size={16} className="mr-2" />
              Expected Attendees
            </label>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900">{booking.expectedAttendees}</p>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <FileText size={16} className="mr-2" />
              Purpose
            </label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">{booking.purpose}</p>
            </div>
          </div>

          {/* Additional Information */}
          {booking.rejectionReason && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Rejection Reason
              </label>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-900">{booking.rejectionReason}</p>
              </div>
            </div>
          )}

          {booking.approvedBy && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Approved By
              </label>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-900">{booking.approvedBy}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
