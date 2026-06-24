import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Users, Phone, Paperclip, Download } from 'lucide-react'
import { ticketAPI } from '../services/api'
import { LoadingSpinner, ErrorAlert, Badge } from '../components/Common'
import TicketComments from '../components/TicketComments'

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTicket()
  }, [id])

  const fetchTicket = async () => {
    try {
      setLoading(true)
      const { data } = await ticketAPI.getById(id)
      setTicket(data)
      setError(null)
    } catch (err) {
      setError('Failed to load ticket')
    } finally {
      setLoading(false)
    }
  }


  if (loading) return <LoadingSpinner />
  if (error) return <ErrorAlert message={error} />
  if (!ticket) return <ErrorAlert message="Ticket not found" />

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

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
                <p className="text-gray-600 text-sm mt-1">Ticket #{ticket.id?.substring(0, 8)}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={getStatusColor(ticket.status)}>
                  {ticket.status}
                </Badge>
                <Badge variant={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-gray-700">{ticket.description}</p>
            </div>

            {/* Attachments Section */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Paperclip size={18} className="mr-2" />
                  Attachments ({ticket.attachments.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ticket.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Paperclip size={16} className="text-gray-500" />
                        <a
                          href={`http://localhost:8080/api/files/attachments?path=${attachment}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm truncate max-w-xs"
                        >
                          {attachment.split('/').pop()}
                        </a>
                      </div>
                      <a
                        href={`http://localhost:8080/api/files/attachments?path=${attachment}`}
                        download
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 border-t pt-4">
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="font-medium text-gray-900">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{ticket.department || 'General'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Assigned To</p>
                <p className="font-medium text-gray-900">{ticket.assignedTo || 'Unassigned'}</p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <TicketComments
            ticketId={ticket.id}
            comments={ticket.comments || []}
            onCommentAdded={fetchTicket}
          />
        </div>

        {/* Sidebar */}
        <div className="card h-fit sticky top-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Ticket Details</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold uppercase">Status</p>
              <p className="font-bold text-blue-900 mt-1">{ticket.status}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold uppercase">Priority</p>
              <p className="font-bold text-purple-900 mt-1">{ticket.priority}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold uppercase">Assigned To</p>
              <p className="font-bold text-gray-900 mt-1">{ticket.assignedTo || 'Unassigned'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold uppercase">Created Date</p>
              <p className="font-bold text-gray-900 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold uppercase flex items-center">
                <MapPin size={14} className="mr-1" />
                Location
              </p>
              <p className="font-bold text-gray-900 mt-1">{ticket.location || 'Not specified'}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold uppercase flex items-center">
                <Users size={14} className="mr-1" />
                Affected Users
              </p>
              <p className="font-bold text-gray-900 mt-1">{ticket.affectedUsers || 1}</p>
            </div>
            <div className="bg-cyan-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold uppercase flex items-center">
                <Phone size={14} className="mr-1" />
                Contact Details
              </p>
              <p className="font-bold text-gray-900 mt-1">{ticket.contactDetails || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
