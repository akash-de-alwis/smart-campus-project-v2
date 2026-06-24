import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Edit2, Trash2, X, Filter, Search } from 'lucide-react'
import { bookingAPI } from '../services/api'
import { LoadingSpinner, ErrorAlert, Badge } from '../components/Common'
import { formatDistanceToNow } from 'date-fns'

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    // Apply filters when bookings or filter states change
    let filtered = bookings

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Search filter (search in purpose)
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.startTime)
        return bookingDate.toDateString() === filterDate.toDateString()
      })
    }

    setFilteredBookings(filtered)
  }, [bookings, statusFilter, searchTerm, dateFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const { data } = await bookingAPI.getMyBookings()
      setBookings(data || [])
      setError(null)
    } catch (err) {
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    try {
      await bookingAPI.cancel(id, 'Cancelled by user')
      setBookings(bookings.filter(b => b.id !== id))
      setSelectedBooking(null)
    } catch (err) {
      setError('Failed to cancel booking')
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

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">Manage your resource bookings</p>
        </div>
        <Link to="/booking/new" className="btn-primary">
          + New Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by purpose or booking ID..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400 dark:placeholder-gray-500 pl-10"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('ALL')
                  setSearchTerm('')
                  setDateFilter('')
                }}
                className="w-full px-4 py-2.5 border-2 border-orange-500 text-orange-600 rounded-xl font-medium hover:bg-orange-500 hover:text-white transition-colors"
              >
                Reset
              </button>
            </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Results Summary */}
      {filteredBookings.length !== bookings.length && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-blue-800">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
        </div>
      )}

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm text-center py-12">
          <p className="text-gray-600 text-lg mb-4">
            {bookings.length === 0 ? "You haven't made any bookings yet" : "No bookings match your filters"}
          </p>
          <Link to="/booking/new" className="btn-primary inline-block">
            Create Your First Booking
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Purpose</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Attendees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking.id}>
                  <td className="font-medium text-gray-900">
                    #{booking.id?.substring(0, 8)}
                  </td>
                  <td>{booking.purpose}</td>
                  <td>{new Date(booking.startTime).toLocaleString()}</td>
                  <td>{new Date(booking.endTime).toLocaleString()}</td>
                  <td>{booking.expectedAttendees} people</td>
                  <td>
                    <Badge variant={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Calendar size={18} />
                      </Link>
                      {booking.status === 'PENDING' && (
                        <>
                          <Link
                            to={`/booking/${booking.id}/edit`}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit booking"
                          >
                            <Edit2 size={18} />
                          </Link>
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel booking"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
