import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Calendar, Library, AlertCircle, Users, TrendingUp, TrendingDown, RefreshCw, Clock, Printer } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { bookingAPI, resourceAPI, ticketAPI } from '../services/api'
import { LoadingSpinner, ErrorAlert } from '../components/Common'

const StatCard = ({ number, label, trend, trendUp, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-3xl font-bold text-gray-900">{number}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendUp ? 'text-green-600' : 'text-orange-600'}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-gray-50 rounded-xl">
        <Icon size={24} className="text-gray-400" />
      </div>
    </div>
  </div>
)

// Gantt Timeline Component
const GanttTimeline = ({ bookings, resources }) => {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [hoveredBooking, setHoveredBooking] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const ganttRef = useRef(null)

  // Get selected month data
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
  const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Filter bookings for selected month
  const filteredBookings = bookings.filter(b => {
    const bookingDate = new Date(b.startTime)
    return bookingDate.getMonth() === selectedMonth && bookingDate.getFullYear() === selectedYear
  })

  // Calculate metrics
  const totalBookings = filteredBookings.length
  const approvedCount = filteredBookings.filter(b => b.status === 'APPROVED').length
  const cancelledCount = filteredBookings.filter(b => b.status === 'CANCELLED').length
  const pendingCount = filteredBookings.filter(b => b.status === 'PENDING').length

  // Get bookings for a specific resource in selected month
  const getResourceBookings = (resourceId) => {
    return filteredBookings.filter(b => b.resourceId === resourceId)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  }

  // Month and year options
  const months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
  ]

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500'
      case 'CANCELLED': return 'bg-red-500'
      case 'PENDING': return 'bg-amber-500'
      default: return 'bg-gray-400'
    }
  }

  // Get status text color
  const getStatusTextColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'text-green-700 bg-green-100'
      case 'CANCELLED': return 'text-red-700 bg-red-100'
      case 'PENDING': return 'text-amber-700 bg-amber-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  // Calculate booking position and width
  const getBookingStyle = (booking) => {
    const startDate = new Date(booking.startTime)
    const endDate = new Date(booking.endTime)
    const startDay = startDate.getDate()
    const endDay = endDate.getDate()
    
    const left = ((startDay - 1) / daysInMonth) * 100
    const width = ((endDay - startDay + 1) / daysInMonth) * 100
    
    return { left: `${left}%`, width: `${Math.max(width, 2)}%` }
  }

  // Format time range
  const formatTimeRange = (booking) => {
    const start = new Date(booking.startTime)
    const end = new Date(booking.endTime)
    return `${start.getDate()}-${end.getDate()} ${monthName.split(' ')[0]}`
  }

  // Handle mouse enter on booking bar
  const handleMouseEnter = (booking, e) => {
    setHoveredBooking(booking)
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }

  // Handle mouse move for tooltip
  const handleMouseMove = (e) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }

  // Handle print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const ganttContent = ganttRef.current
    if (!ganttContent || !printWindow) return

    const printStyles = `
      <style>
        @page { size: landscape; margin: 10mm; }
        body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; }
        .gantt-container { width: 100%; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; }
        .subtitle { font-size: 14px; color: #666; }
        .date { font-size: 18px; font-weight: 600; }
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .metric-card { background: #f3f4f6; border-radius: 8px; padding: 12px; text-align: center; }
        .metric-value { font-size: 20px; font-weight: bold; }
        .metric-label { font-size: 12px; color: #666; margin-top: 4px; }
        .legend { display: flex; gap: 16px; margin-bottom: 16px; font-size: 12px; }
        .legend-item { display: flex; align-items: center; gap: 6px; }
        .legend-dot { width: 12px; height: 12px; border-radius: 2px; }
        .timeline { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
        .resource-row { display: flex; border-bottom: 1px solid #e5e7eb; min-height: 50px; }
        .resource-row:last-child { border-bottom: none; }
        .resource-info { width: 200px; padding: 12px; border-right: 1px solid #e5e7eb; background: #f9fafb; }
        .resource-name { font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .resource-meta { font-size: 11px; color: #6b7280; margin-top: 2px; }
        .booking-area { flex: 1; position: relative; padding: 8px; }
        .booking-bar { position: absolute; height: 28px; border-radius: 4px; display: flex; align-items: center; padding: 0 8px; color: white; font-size: 11px; font-weight: 500; }
        .no-bookings { color: #9ca3af; font-size: 12px; font-style: italic; }
        .approved { background: #22c55e; }
        .cancelled { background: #ef4444; }
        .pending { background: #f59e0b; }
        .days-header { display: flex; border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
        .day-label { flex: 1; text-align: center; padding: 8px; font-size: 11px; color: #6b7280; border-right: 1px solid #e5e7eb; }
        .day-label:last-child { border-right: none; }
        @media print {
          .no-print { display: none !important; }
        }
      </style>
    `

    // Build the print HTML
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
    const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    // Get filtered bookings
    const filteredBookings = bookings.filter(b => {
      const bookingDate = new Date(b.startTime)
      return bookingDate.getMonth() === selectedMonth && bookingDate.getFullYear() === selectedYear
    })

    const totalBookings = filteredBookings.length
    const approvedCount = filteredBookings.filter(b => b.status === 'APPROVED').length
    const cancelledCount = filteredBookings.filter(b => b.status === 'CANCELLED').length
    const pendingCount = filteredBookings.filter(b => b.status === 'PENDING').length

    // Build resource rows HTML
    const resourceRowsHtml = resources.map(r => {
      const rBookings = filteredBookings.filter(b => b.resourceId === r.id).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

      if (rBookings.length === 0) {
        return `
          <div class="resource-row">
            <div class="resource-info">
              <div class="resource-name">${r.name}</div>
              <div class="resource-meta">${r.type?.replace(/_/g, ' ') || 'Resource'} • Capacity: ${r.capacity}</div>
            </div>
            <div class="booking-area">
              <span class="no-bookings">No bookings</span>
            </div>
          </div>
        `
      }

      const barsHtml = rBookings.map(b => {
        const startDate = new Date(b.startTime)
        const endDate = new Date(b.endTime)
        const startDay = startDate.getDate()
        const endDay = endDate.getDate()
        const left = ((startDay - 1) / daysInMonth) * 100
        const width = ((endDay - startDay + 1) / daysInMonth) * 100
        const statusClass = b.status === 'APPROVED' ? 'approved' : b.status === 'CANCELLED' ? 'cancelled' : 'pending'
        const label = `${startDay}-${endDay} ${monthName.split(' ')[0]}`

        return `<div class="booking-bar ${statusClass}" style="left: ${left}%; width: ${Math.max(width, 3)}%;">${label}</div>`
      }).join('')

      return `
        <div class="resource-row">
          <div class="resource-info">
            <div class="resource-name">${r.name}</div>
            <div class="resource-meta">${r.type?.replace(/_/g, ' ') || 'Resource'} • Capacity: ${r.capacity}</div>
          </div>
          <div class="booking-area">${barsHtml}</div>
        </div>
      `
    }).join('')

    // Days header
    const daysHeaderHtml = Array.from({ length: Math.min(10, daysInMonth) }, (_, i) => {
      const dayNum = Math.floor((i / 9) * (daysInMonth - 1)) + 1
      return `<div class="day-label">${dayNum}</div>`
    }).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Timeline - ${monthName}</title>
        ${printStyles}
      </head>
      <body>
        <div class="gantt-container">
          <div class="header">
            <div>
              <div class="title">Booking Timeline</div>
              <div class="subtitle">Resource bookings report</div>
            </div>
            <div class="date">${monthName}</div>
          </div>
          <div class="metrics">
            <div class="metric-card">
              <div class="metric-value">${totalBookings}</div>
              <div class="metric-label">Total Bookings</div>
            </div>
            <div class="metric-card">
              <div class="metric-value" style="color: #22c55e;">${approvedCount}</div>
              <div class="metric-label">Approved</div>
            </div>
            <div class="metric-card">
              <div class="metric-value" style="color: #ef4444;">${cancelledCount}</div>
              <div class="metric-label">Cancelled</div>
            </div>
            <div class="metric-card">
              <div class="metric-value" style="color: #f59e0b;">${pendingCount}</div>
              <div class="metric-label">Pending</div>
            </div>
          </div>
          <div class="legend">
            <div class="legend-item">
              <div class="legend-dot" style="background: #22c55e;"></div>
              <span>Approved</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot" style="background: #ef4444;"></div>
              <span>Cancelled</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot" style="background: #f59e0b;"></div>
              <span>Pending</span>
            </div>
          </div>
          <div class="days-header">${daysHeaderHtml}</div>
          <div class="timeline">${resourceRowsHtml}</div>
        </div>
        <script>window.print(); window.close();</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div ref={ganttRef} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6">
      {/* Header with month/year filters and print button */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Booking Timeline</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Resource bookings by month</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
            title="Print / Save as PDF"
          >
            <Printer size={18} />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalBookings}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
          <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-gray-700 dark:text-gray-300">Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-gray-700 dark:text-gray-300">Cancelled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500"></div>
          <span className="text-gray-700 dark:text-gray-300">Pending</span>
        </div>
      </div>

      {/* Timeline Header with day markers */}
      <div className="relative mb-2">
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 px-2">
          {[...Array(Math.ceil(daysInMonth / 5))].map((_, i) => {
            const day = i * 5 + 1
            return day <= daysInMonth ? (
              <span key={day} className="absolute" style={{ left: `${((day - 1) / daysInMonth) * 100}%` }}>
                {day}
              </span>
            ) : null
          })}
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="relative border-t border-b border-gray-200 dark:border-gray-700">
        {/* Vertical grid lines */}
        {[...Array(daysInMonth + 1)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-l border-gray-100 dark:border-gray-800"
            style={{ left: `${(i / daysInMonth) * 100}%` }}
          />
        ))}

        {/* Resource Rows */}
        <div className="space-y-2 py-2 max-h-96 overflow-y-auto">
          {resources.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No resources available</p>
          ) : (
            resources.map((resource) => {
              const resourceBookings = getResourceBookings(resource.id)
              return (
                <div key={resource.id} className="relative flex items-center min-h-[50px]">
                  {/* Resource Info */}
                  <div className="w-48 shrink-0 pr-4 border-r border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{resource.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{resource.type?.replace(/_/g, ' ')} • Capacity: {resource.capacity}</p>
                  </div>

                  {/* Booking Bars */}
                  <div className="flex-1 relative h-10 mx-2">
                    {resourceBookings.length === 0 ? (
                      <span className="absolute inset-0 flex items-center text-xs text-gray-400 dark:text-gray-500 pl-2">
                        No bookings
                      </span>
                    ) : (
                      resourceBookings.map((booking) => {
                        const style = getBookingStyle(booking)
                        return (
                          <div
                            key={booking.id}
                            className={`absolute h-6 top-2 rounded-md cursor-pointer ${getStatusColor(booking.status)} hover:opacity-80 transition-opacity`}
                            style={style}
                            onMouseEnter={(e) => handleMouseEnter(booking, e)}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => setHoveredBooking(null)}
                          >
                            <span className="text-white text-xs px-1 truncate block leading-6">
                              {formatTimeRange(booking)}
                            </span>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredBooking && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700 pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="space-y-2">
            <p className="font-bold text-gray-900 dark:text-white">{hoveredBooking.resourceName || 'Resource'}</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusTextColor(hoveredBooking.status)}`}>
              {hoveredBooking.status}
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <Clock size={12} className="inline mr-1" />
              {new Date(hoveredBooking.startTime).toLocaleDateString()} - {new Date(hoveredBooking.endTime).toLocaleDateString()}
            </p>
            {hoveredBooking.attendees && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Attendees: {hoveredBooking.attendees}
              </p>
            )}
            {hoveredBooking.approvedBy && (
              <p className="text-sm text-green-600">Approved by: {hoveredBooking.approvedBy}</p>
            )}
            {hoveredBooking.rejectionReason && (
              <p className="text-sm text-red-600">Reason: {hoveredBooking.rejectionReason}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [chartData, setChartData] = useState([])
  const [pieData, setPieData] = useState([])

  const fetchStats = useCallback(async () => {
    try {
      const [bookingsRes, resourcesRes, ticketsRes] = await Promise.all([
        bookingAPI.getAll().catch(() => ({ data: [] })),
        resourceAPI.getAll().catch(() => ({ data: [] })),
        ticketAPI.getMyTickets().catch(() => ({ data: [] })),
      ])

      const bookings = bookingsRes.data || []
      const resources = resourcesRes.data || []
      const tickets = ticketsRes.data || []

      // Enrich bookings with resource names for Gantt chart
      const enrichedBookings = bookings.map(booking => {
        const resource = resources.find(r => r.id === booking.resourceId)
        return {
          ...booking,
          resourceName: resource?.name || 'Unknown Resource'
        }
      })

      // Calculate trends by comparing with last week's data
      const today = new Date()
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const thisWeekBookings = bookings.filter(b => new Date(b.createdAt) >= lastWeek).length
      const lastWeekBookings = bookings.filter(b => {
        const date = new Date(b.createdAt)
        return date >= new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000) && date < lastWeek
      }).length

      const thisWeekTickets = tickets.filter(t => new Date(t.createdAt) >= lastWeek).length
      const lastWeekTickets = tickets.filter(t => {
        const date = new Date(t.createdAt)
        return date >= new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000) && date < lastWeek
      }).length

      // Calculate trend percentages
      const calculateTrend = (current, previous) => {
        if (!previous || previous === 0) return { value: '0%', up: true }
        const change = ((current - previous) / previous) * 100
        return { value: `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`, up: change >= 0 }
      }

      const bookingTrend = calculateTrend(thisWeekBookings, lastWeekBookings)
      const ticketTrend = calculateTrend(thisWeekTickets, lastWeekTickets)

      // Generate last 7 days chart data
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const chartData = []
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dayName = days[date.getDay()]
        
        const dayBookings = bookings.filter(b => {
          const bookingDate = new Date(b.startTime)
          return bookingDate.toDateString() === date.toDateString()
        }).length
        
        chartData.push({
          name: dayName,
          bookings: dayBookings,
          resources: Math.floor(dayBookings * 0.7)
        })
      }
      setChartData(chartData)

      // Generate real pie data from booking statuses
      const statusCounts = {
        APPROVED: bookings.filter(b => b.status === 'APPROVED').length,
        PENDING: bookings.filter(b => b.status === 'PENDING').length,
        REJECTED: bookings.filter(b => b.status === 'REJECTED').length,
      }
      
      const pieData = [
        { name: 'Approved', value: statusCounts.APPROVED || 0 },
        { name: 'Pending', value: statusCounts.PENDING || 0 },
        { name: 'Rejected', value: statusCounts.REJECTED || 0 },
      ].filter(d => d.value > 0)
      setPieData(pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1 }])

      setStats({
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
        approvedBookings: bookings.filter(b => b.status === 'APPROVED').length,
        totalResources: resources.length,
        activeResources: resources.filter(r => r.status === 'ACTIVE').length,
        openTickets: tickets.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length,
        totalTickets: tickets.length,
        bookingTrend,
        ticketTrend,
        newBookingsToday: bookings.filter(b => {
          const today = new Date().toDateString()
          return new Date(b.createdAt).toDateString() === today
        }).length,
        newTicketsToday: tickets.filter(t => {
          const today = new Date().toDateString()
          return new Date(t.createdAt).toDateString() === today
        }).length,
        allBookings: enrichedBookings,
        allResources: resources,
      })
      
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchStats()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorAlert message={error} />

  const COLORS = ['#f97316', '#1f2937', '#ef4444']

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
          <p className="text-gray-500 mt-1">
            Here's an overview of your smart campus dashboard
            {lastUpdated && (
              <span className="text-xs text-gray-400 ml-2">
                (Updated: {lastUpdated.toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-orange-600"
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          number={stats?.totalBookings || 0} 
          label="Total Bookings"
          trend={stats?.bookingTrend?.value || '+0%'}
          trendUp={stats?.bookingTrend?.up || true}
          icon={Calendar}
        />
        <StatCard 
          number={stats?.pendingBookings || 0} 
          label="Pending Approvals"
          trend={`${stats?.newBookingsToday || 0} new today`}
          trendUp={false}
          icon={AlertCircle}
        />
        <StatCard 
          number={stats?.activeResources || 0} 
          label="Active Resources"
          trend={`${stats?.totalResources || 0} total`}
          trendUp={true}
          icon={Library}
        />
        <StatCard 
          number={stats?.openTickets || 0} 
          label="Open Tickets"
          trend={`${stats?.ticketTrend?.value || '+0%'} this week`}
          trendUp={stats?.ticketTrend?.up || false}
          icon={Users}
        />
      </div>

      {/* Gantt Timeline Chart */}
      <GanttTimeline bookings={stats?.allBookings || []} resources={stats?.allResources || []} />

      {/* Booking Status Pie Chart */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Status</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  formatter={(value, name) => [`${value} bookings`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend and Details */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <div className="space-y-3">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium text-gray-900">{entry.name}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
          <div className="flex gap-2">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
              Auto-refresh: 30s
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/resources"
            className="bg-gray-900 text-white text-center py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Browse Resources
          </Link>
          <Link
            to="/booking/new"
            className="bg-orange-500 text-white text-center py-3 px-4 rounded-xl font-medium hover:bg-orange-600 transition-colors"
          >
            New Booking
          </Link>
          <Link
            to="/ticket/new"
            className="bg-gray-900 text-white text-center py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Report Issue
          </Link>
          <Link
            to="/profile"
            className="border-2 border-gray-200 text-gray-700 text-center py-3 px-4 rounded-xl font-medium hover:border-gray-300 transition-colors"
          >
            My Profile
          </Link>
        </div>
      </div>
    </div>
  )
}
