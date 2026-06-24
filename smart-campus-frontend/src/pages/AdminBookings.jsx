import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Check, X, Eye, Calendar, Clock, User, FileText, XCircle } from 'lucide-react'
import { bookingAPI } from '../services/api'
import { LoadingSpinner, ErrorAlert, Badge } from '../components/Common'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [filter, setFilter] = useState('PENDING')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [filter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const { data } = await bookingAPI.getAll()
      setBookings(filter === 'ALL' ? data : data.filter(b => b.status === filter))
    } catch (err) {
      setError('Failed to load bookings')
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await bookingAPI.approve(id, 'Approved by admin')
      await fetchBookings()
      toast.success('Booking approved successfully')
    } catch (err) {
      setError('Failed to approve booking')
      toast.error('Failed to approve booking')
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return
    try {
      await bookingAPI.reject(id, reason)
      await fetchBookings()
      toast.success('Booking rejected successfully')
    } catch (err) {
      setError('Failed to reject booking')
      toast.error('Failed to reject booking')
    }
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

  const openBookingDetails = (booking) => {
    setSelectedBooking(booking)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedBooking(null)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
        <p className="text-gray-600 mt-2">Review and approve booking requests</p>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="flex gap-3 mb-6">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === f
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Resource</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr
                key={booking.id}
                onClick={() => openBookingDetails(booking)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="font-medium text-gray-900">{booking.userId}</td>
                <td>{booking.resourceId}</td>
                <td>{new Date(booking.startTime).toLocaleDateString()}</td>
                <td>
                  <Badge variant={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </td>
                <td className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openBookingDetails(booking)}
                    className="action-btn-view"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  {booking.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(booking.id)}
                        className="action-btn-success"
                        title="Approve"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleReject(booking.id)}
                        className="action-btn-delete"
                        title="Reject"
                      >
                        <X size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <Badge variant={getStatusColor(selectedBooking.status)}>
                  {selectedBooking.status}
                </Badge>
              </div>

              {/* User ID */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <User size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.userId}</p>
                </div>
              </div>

              {/* Resource */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <FileText size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Resource</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.resourceId}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Start Time</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedBooking.startTime).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Clock size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">End Time</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedBooking.endTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              {selectedBooking.purpose && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Purpose</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.purpose}</p>
                </div>
              )}

              {/* Attendees */}
              {selectedBooking.attendees && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Attendees</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.attendees}</p>
                </div>
              )}

              {/* Reason / Rejection Reason */}
              {selectedBooking.reason && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-sm font-medium text-red-600 mb-1">
                    {selectedBooking.status === 'REJECTED' ? 'Rejection Reason' :
                     selectedBooking.status === 'CANCELLED' ? 'Cancellation Reason' : 'Reason'}
                  </p>
                  <p className="font-semibold text-red-900">{selectedBooking.reason}</p>
                </div>
              )}

              {/* Approved By */}
              {selectedBooking.approvedBy && (
                <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-sm font-medium text-green-600 mb-1">Approved By</p>
                  <p className="font-semibold text-green-900">{selectedBooking.approvedBy}</p>
                </div>
              )}

              {/* Booking ID */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">Booking ID: {selectedBooking.id}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
              {selectedBooking.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => {
                      handleReject(selectedBooking.id)
                      closeModal()
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedBooking.id)
                      closeModal()
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
