import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AlertCircle, Wrench, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ticketAPI } from '../services/api'
import { LoadingSpinner, ErrorAlert, Badge } from '../components/Common'

export default function TechnicianTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [filter, setFilter] = useState('OPEN')
  const navigate = useNavigate()

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
      await ticketAPI.updateStatus(id, newStatus, 'Updated by technician')
      await fetchTickets()
      toast.success(`Ticket status updated to ${newStatus}`)
    } catch (err) {
      setError('Failed to update ticket')
      toast.error('Failed to update ticket status')
    }
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
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Wrench size={28} className="mr-3 text-orange-500" />
          Technician Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Manage and resolve support tickets</p>
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
              <th>User</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id}>
                <td className="font-medium text-gray-900">
                  <div className="flex items-center">
                    <AlertCircle size={16} className="mr-2 text-orange-500" />
                    {ticket.title}
                  </div>
                </td>
                <td className="text-gray-500">
                  {ticket.userId}
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
                <td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      className="text-sm bg-gray-100 border-0 border-b-2 border-transparent rounded-t px-3 py-2 focus:outline-none focus:bg-white focus:border-orange-500"
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
    </div>
  )
}
