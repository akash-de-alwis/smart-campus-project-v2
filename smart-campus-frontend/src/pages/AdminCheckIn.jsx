import { useState } from 'react'
import { QrCode, Search, CheckCircle, X, Clock, Calendar, User, AlertCircle } from 'lucide-react'
import { qrCodeAPI } from '../services/api'
import { LoadingSpinner, ErrorAlert, SuccessAlert } from '../components/Common'

export default function AdminCheckIn() {
  const [qrContent, setQrContent] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [booking, setBooking] = useState(null)
  const [verificationMethod, setVerificationMethod] = useState('qr') // 'qr' or 'id'

  const handleQRVerify = async (e) => {
    e.preventDefault()
    if (!qrContent.trim()) {
      setError('Please enter QR code content')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      const response = await qrCodeAPI.verifyQRCode(qrContent)
      
      if (response.data.valid) {
        setBooking(response.data.booking)
        setSuccess('QR code verified successfully!')
      } else {
        setError(response.data.message || 'Invalid QR code')
      }
    } catch (err) {
      setError('Failed to verify QR code')
    } finally {
      setLoading(false)
    }
  }

  const handleIdVerify = async (e) => {
    e.preventDefault()
    if (!bookingId.trim()) {
      setError('Please enter booking ID')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      const response = await qrCodeAPI.verifyBookingById(bookingId)
      
      if (response.data.valid) {
        setBooking(response.data.booking)
        setSuccess('Booking found successfully!')
      } else {
        setError(response.data.message || 'Booking not found')
      }
    } catch (err) {
      setError('Failed to find booking')
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

  const resetForm = () => {
    setQrContent('')
    setBookingId('')
    setBooking(null)
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Check-In</h1>
          <p className="text-gray-600">Verify bookings using QR code or booking ID</p>
        </div>

        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message={success} />}

        {/* Verification Method Selection */}
        <div className="card mb-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setVerificationMethod('qr')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                verificationMethod === 'qr'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <QrCode size={20} className="inline mr-2" />
              QR Code Verification
            </button>
            <button
              onClick={() => setVerificationMethod('id')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                verificationMethod === 'id'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Search size={20} className="inline mr-2" />
              Booking ID Search
            </button>
          </div>

          {verificationMethod === 'qr' ? (
            <form onSubmit={handleQRVerify}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  QR Code Content
                </label>
                <textarea
                  value={qrContent}
                  onChange={(e) => setQrContent(e.target.value)}
                  placeholder="Paste QR code content here..."
                  className="input-field resize-none"
                  rows={4}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Scan QR code and paste the content here, or enter it manually
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify QR Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleIdVerify}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Booking ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    placeholder="Enter booking ID (e.g., 507f1d9a3b2c4)"
                    className="input-field text-lg pr-12"
                    required
                  />
                  <Search size={20} className="absolute right-3 top-3 text-gray-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search Booking'}
              </button>
            </form>
          )}
        </div>

        {/* Booking Details */}
        {booking && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={resetForm}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Clear Results
              </button>
            </div>

            {/* Status Badge */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  booking.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* User Info */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center mb-1">
                  <User size={16} className="text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Booked By</span>
                </div>
                <p className="font-semibold text-gray-900">{booking.userId}</p>
              </div>

              {/* Resource */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Resource</p>
                <p className="font-semibold text-gray-900">{booking.resourceId}</p>
              </div>

              {/* Purpose */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Purpose</p>
                <p className="text-gray-900">{booking.purpose}</p>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-1">
                    <Calendar size={16} className="text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600">Start Time</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatDateTime(booking.startTime)}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center mb-1">
                    <Clock size={16} className="text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600">End Time</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatDateTime(booking.endTime)}
                  </p>
                </div>
              </div>

              {/* QR Code Display */}
              {booking.qrCode && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <QrCode size={16} className="text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600">QR Code</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <img 
                      src={booking.qrCode} 
                      alt="Booking QR Code" 
                      className="w-32 h-32 mx-auto border border-gray-200 rounded"
                    />
                  </div>
                </div>
              )}

              {/* Validation Status */}
              {booking.status === 'APPROVED' && (
                <div className="bg-green-100 p-4 rounded-lg flex items-center">
                  <CheckCircle size={20} className="text-green-600 mr-3" />
                  <div>
                    <p className="font-semibold text-green-800">Booking Valid</p>
                    <p className="text-sm text-green-700">This booking is approved and ready for check-in</p>
                  </div>
                </div>
              )}

              {booking.status !== 'APPROVED' && (
                <div className="bg-yellow-100 p-4 rounded-lg flex items-center">
                  <AlertCircle size={20} className="text-yellow-600 mr-3" />
                  <div>
                    <p className="font-semibold text-yellow-800">Booking Not Approved</p>
                    <p className="text-sm text-yellow-700">This booking cannot be checked in</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
