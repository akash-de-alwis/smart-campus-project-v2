import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, MessageSquare, Plus, Filter, Search, X } from 'lucide-react'
import { ticketAPI } from '../services/api'
import { LoadingSpinner, ErrorAlert, Badge } from '../components/Common'

export default function Tickets() {
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    // Apply filters when tickets or filter states change
    let filtered = tickets

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter)
    }

    // Search filter (search in title, description, and ID)
    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.description && ticket.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filtered = filtered.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt)
        return ticketDate.toDateString() === filterDate.toDateString()
      })
    }

    setFilteredTickets(filtered)
  }, [tickets, statusFilter, priorityFilter, searchTerm, dateFilter])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const { data } = await ticketAPI.getMyTickets()
      setTickets(data || [])
      setError(null)
    } catch (err) {
      setError('Failed to load tickets')
    } finally {
      setLoading(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600 mt-2">Track and manage your support requests</p>
        </div>
        <Link to="/ticket/new" className="btn-primary flex items-center">
          <Plus size={20} className="mr-2" />
          New Ticket
        </Link>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="ALL">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
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
                placeholder="Search by title, description, or ticket ID..."
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
                setPriorityFilter('ALL')
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
      {filteredTickets.length !== tickets.length && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-blue-800">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </p>
        </div>
      )}

      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm text-center py-12">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg mb-4">
            {tickets.length === 0 ? "No support tickets yet" : "No tickets match your filters"}
          </p>
          <Link to="/ticket/new" className="btn-primary inline-flex items-center">
            <Plus size={20} className="mr-2" />
            Create Your First Ticket
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id}>
                  <td className="font-medium text-gray-900">
                    <div className="flex items-center">
                      <AlertCircle size={16} className="mr-2 text-orange-500" />
                      {ticket.title}
                    </div>
                  </td>
                  <td className="max-w-xs truncate">{ticket.description?.substring(0, 50)}...</td>
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
                    <span className="text-sm text-gray-500 flex items-center">
                      <MessageSquare size={14} className="mr-1" />
                      {ticket.comments?.length || 0}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors inline-flex"
                      title="View details"
                    >
                      <AlertCircle size={18} />
                    </Link>
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
