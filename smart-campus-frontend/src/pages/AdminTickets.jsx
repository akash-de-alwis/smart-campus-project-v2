import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AlertCircle, Eye, XCircle, MessageSquare, MapPin, Users, Phone, Paperclip, Download, Calendar } from 'lucide-react'
import { ticketAPI } from '../services/api'
import { LoadingSpinner, ErrorAlert, Badge } from '../components/Common'

export default function AdminTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [filter, setFilter] = useState('OPEN')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [filter])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const { data } = await ticketAPI.getAll()
      setTickets(filter === 'ALL' ? data : data.filter(t => t.status === filter))
    } catch (err) {
      setError('Failed to load tickets')
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await ticketAPI.updateStatus(id, newStatus, 'Updated by admin')
      await fetchTickets()
      toast.success(`Ticket status updated to ${newStatus}`)
    } catch (err) {
      setError('Failed to update ticket')
      toast.error('Failed to update ticket status')
    }
  }

  const openTicketDetails = (ticket) => {
    setSelectedTicket(ticket)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedTicket(null)
  }

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'warning',
      IN_PROGRESS: 'primary',
      RESOLVED: 'success',
      CLOSED: 'gray',
    }
    return colors[status] || 'gray'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'gray',
      MEDIUM: 'warning',
      HIGH: 'danger',
    }
    return colors[priority] || 'gray'
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Tickets</h1>
        <p className="text-gray-600 mt-2">Handle and resolve support tickets</p>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="flex gap-3 mb-6">
        {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ALL'].map(f => (
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
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr
                key={ticket.id}
                onClick={() => openTicketDetails(ticket)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="font-medium text-gray-900">
                  <div className="flex items-center">
                    <AlertCircle size={16} className="mr-2 text-orange-500" />
                    {ticket.title}
                  </div>
                </td>
                <td>
                  <Badge variant={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </td>
                <td>
                  <Badge variant={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </td>
                <td className="text-gray-500">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openTicketDetails(ticket)}
                      className="action-btn-view"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      className="text-sm bg-gray-100 border-0 border-b-2 border-transparent rounded-t-lg px-3 py-2 focus:outline-none focus:bg-white focus:border-orange-500 transition-all"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ticket Details Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedTicket.title}</h2>
                <p className="text-sm text-gray-500 mt-1">Ticket #{selectedTicket.id?.substring(0, 8)}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status & Priority */}
              <div className="flex items-center gap-3">
                <Badge variant={getStatusColor(selectedTicket.status)}>
                  {selectedTicket.status}
                </Badge>
                <Badge variant={getPriorityColor(selectedTicket.priority)}>
                  {selectedTicket.priority}
                </Badge>
              </div>

              {/* Description */}
              {selectedTicket.description && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700">{selectedTicket.description}</p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                    <Calendar size={14} className="mr-1" />
                    Created
                  </p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Department</p>
                  <p className="font-semibold text-gray-900">{selectedTicket.department || 'General'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                    <MapPin size={14} className="mr-1" />
                    Location
                  </p>
                  <p className="font-semibold text-gray-900">{selectedTicket.location || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Assigned To</p>
                  <p className="font-semibold text-gray-900">{selectedTicket.assignedTo || 'Unassigned'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                    <Users size={14} className="mr-1" />
                    Affected Users
                  </p>
                  <p className="font-semibold text-gray-900">{selectedTicket.affectedUsers || 1}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                    <Phone size={14} className="mr-1" />
                    Contact
                  </p>
                  <p className="font-semibold text-gray-900">{selectedTicket.contactDetails || 'Not provided'}</p>
                </div>
              </div>

              {/* Comments Preview */}
              {selectedTicket.comments && selectedTicket.comments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                    <MessageSquare size={14} className="mr-1" />
                    Recent Comments ({selectedTicket.comments.length})
                  </h3>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {selectedTicket.comments.slice(0, 3).map((c, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm text-gray-900">{c.author || 'User'}</p>
                          <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-gray-700">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                    <Paperclip size={14} className="mr-1" />
                    Attachments ({selectedTicket.attachments.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTicket.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={`http://localhost:8080/api/files/attachments?path=${attachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-gray-50 border rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Paperclip size={16} className="text-gray-500" />
                          <span className="text-sm text-blue-600 hover:text-blue-800 truncate max-w-[150px]">
                            {attachment.split('/').pop()}
                          </span>
                        </div>
                        <Download size={16} className="text-gray-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
