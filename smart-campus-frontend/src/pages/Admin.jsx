import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { Users, Calendar, AlertCircle, Library, Shield, Clock, TrendingUp, Activity, TrendingDown } from 'lucide-react'
import { bookingAPI, resourceAPI, ticketAPI, userAPI } from '../services/api'
import { LoadingSpinner } from '../components/Common'

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookings, resources, tickets, users] = await Promise.all([
          bookingAPI.getAll(),
          resourceAPI.getAll(),
          ticketAPI.getAll(),
          userAPI.getAll(),
        ])

        const bookingsList = bookings.data || []
        const resourcesList = resources.data || []
        const ticketsList = tickets.data || []
        const usersList = users.data || []

        // Calculate top resources by booking count
        const resourceUsage = {}
        bookingsList.forEach(booking => {
          if (booking.resourceId) {
            resourceUsage[booking.resourceId] = (resourceUsage[booking.resourceId] || 0) + 1
          }
        })

        const topResources = Object.entries(resourceUsage)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([resourceId, count]) => {
            const resource = resourcesList.find(r => r.id === resourceId)
            return {
              name: resource?.name || 'Unknown',
              count: count,
              type: resource?.type || 'Unknown'
            }
          })

        // Calculate peak booking hours
        const hourlyBookings = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }))
        bookingsList.forEach(booking => {
          if (booking.startTime) {
            const hour = new Date(booking.startTime).getHours()
            if (hour >= 0 && hour < 24) {
              hourlyBookings[hour].count++
            }
          }
        })

        // Calculate daily trends (last 14 days)
        const dailyData = {}
        const today = new Date()
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        
        // Initialize last 14 days with 0
        for (let i = 13; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          const dayKey = days[date.getDay()] + ' ' + date.getDate()
          dailyData[dayKey] = 0
        }
        
        bookingsList.forEach(booking => {
          if (booking.startTime) {
            const bookingDate = new Date(booking.startTime)
            const dayKey = days[bookingDate.getDay()] + ' ' + bookingDate.getDate()
            if (dailyData.hasOwnProperty(dayKey)) {
              dailyData[dayKey]++
            }
          }
        })

        // Calculate ticket categories (by department)
        const ticketCategories = {}
        ticketsList.forEach(ticket => {
          const category = ticket.department || 'General'
          ticketCategories[category] = (ticketCategories[category] || 0) + 1
        })

        // Calculate booking status distribution
        const bookingStatuses = {
          PENDING: bookingsList.filter(b => b.status === 'PENDING').length,
          APPROVED: bookingsList.filter(b => b.status === 'APPROVED').length,
          REJECTED: bookingsList.filter(b => b.status === 'REJECTED').length,
          CANCELLED: bookingsList.filter(b => b.status === 'CANCELLED').length,
        }

        // Calculate average booking duration
        const approvedBookings = bookingsList.filter(b => b.status === 'APPROVED' && b.startTime && b.endTime)
        const totalDuration = approvedBookings.reduce((sum, booking) => {
          const start = new Date(booking.startTime)
          const end = new Date(booking.endTime)
          return sum + (end - start)
        }, 0)
        const avgDuration = approvedBookings.length > 0 ? totalDuration / approvedBookings.length / (1000 * 60 * 60) : 0

        setStats({
          totalBookings: bookingsList.length,
          pendingBookings: bookingsList.filter(b => b.status === 'PENDING').length,
          approvedBookings: bookingsList.filter(b => b.status === 'APPROVED').length,
          totalResources: resourcesList.length,
          activeResources: resourcesList.filter(r => r.status === 'ACTIVE').length,
          openTickets: ticketsList.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length,
          totalTickets: ticketsList.length,
          totalUsers: usersList.length,
          technicianCount: usersList.filter(u => u.role === 'TECHNICIAN').length,
          topResources,
          hourlyBookings,
          dailyData,
          ticketCategories,
          bookingStatuses,
          avgBookingDuration: avgDuration.toFixed(1),
        })
      } catch (err) {
        console.error('Failed to fetch admin stats', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <LoadingSpinner />

  const COLORS = ['#f97316', '#1f2937', '#ef4444', '#10b981', '#f59e0b']

  // Prepare data for charts
  const bookingStatusData = stats?.bookingStatuses ? Object.entries(stats.bookingStatuses).map(([status, count]) => ({
    name: status,
    value: count
  })) : []

  const ticketCategoryData = stats?.ticketCategories ? Object.entries(stats.ticketCategories).map(([category, count]) => ({
    name: category,
    value: count
  })) : []

  const dailyChartData = stats?.dailyData ? Object.entries(stats.dailyData).map(([day, count]) => ({
    day,
    bookings: count
  })) : []

  const StatCard = ({ number, label, subtext, trendUp, icon: Icon }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{number}</p>
          <p className="text-sm text-gray-500 mt-1">{label}</p>
          {subtext && (
            <p className={`text-xs mt-2 font-medium ${trendUp ? 'text-green-600' : 'text-orange-600'}`}>
              {subtext}
            </p>
          )}
        </div>
        <div className="p-3 bg-gray-50 rounded-xl">
          <Icon size={24} className="text-gray-400" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">System overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          number={stats?.totalBookings || 0} 
          label="Total Bookings"
          subtext={`${stats?.pendingBookings || 0} pending approval`}
          trendUp={false}
          icon={Calendar}
        />
        <StatCard 
          number={stats?.totalResources || 0} 
          label="Total Resources"
          subtext={`${stats?.activeResources || 0} active`}
          trendUp={true}
          icon={Library}
        />
        <StatCard 
          number={stats?.openTickets || 0} 
          label="Open Tickets"
          subtext={`${stats?.totalTickets || 0} total tickets`}
          trendUp={false}
          icon={AlertCircle}
        />
        <StatCard 
          number={`${stats?.avgBookingDuration || 0}h`}
          label="Avg Duration"
          subtext="hours per booking"
          trendUp={true}
          icon={Clock}
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Booking Hours */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Clock size={20} className="mr-2 text-orange-500" />
            Peak Booking Hours
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.hourlyBookings || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                formatter={(value) => [`${value} bookings`, 'Count']}
              />
              <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Activity size={20} className="mr-2 text-orange-500" />
            Booking Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bookingStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {bookingStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Resources */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp size={20} className="mr-2 text-orange-500" />
            Top Resources
          </h2>
          <div className="space-y-3">
            {stats?.topResources?.length > 0 ? (
              stats.topResources.map((resource, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">{resource.name}</p>
                    <p className="text-sm text-gray-500">{resource.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">{resource.count}</p>
                    <p className="text-xs text-gray-500">bookings</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No booking data available</p>
            )}
          </div>
        </div>

        {/* Ticket Categories */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle size={20} className="mr-2 text-orange-500" />
            Ticket Categories
          </h2>
          {ticketCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ticketCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {ticketCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>No ticket categories available</p>
            </div>
          )}
        </div>
      </div>

      {/* Daily Trends */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUp size={20} className="mr-2 text-orange-500" />
          Daily Booking Trends
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyChartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} interval={2} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
            <Tooltip 
              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
              formatter={(value) => [`${value} bookings`, 'Count']}
            />
            <Line type="monotone" dataKey="bookings" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link to="/admin/resources" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
            <Library size={24} className="text-gray-600 group-hover:text-orange-600" />
          </div>
          <h3 className="font-bold text-gray-900">Manage Resources</h3>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or remove campus resources</p>
        </Link>
        <Link to="/admin/bookings" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
            <Calendar size={24} className="text-gray-600 group-hover:text-orange-600" />
          </div>
          <h3 className="font-bold text-gray-900">Review Bookings</h3>
          <p className="text-sm text-gray-500 mt-1">Approve or reject booking requests</p>
        </Link>
        <Link to="/admin/tickets" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
            <AlertCircle size={24} className="text-gray-600 group-hover:text-orange-600" />
          </div>
          <h3 className="font-bold text-gray-900">Handle Tickets</h3>
          <p className="text-sm text-gray-500 mt-1">Manage support tickets and issues</p>
        </Link>
        <Link to="/admin/users" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
            <Shield size={24} className="text-gray-600 group-hover:text-orange-600" />
          </div>
          <h3 className="font-bold text-gray-900">Manage Users</h3>
          <p className="text-sm text-gray-500 mt-1">Control roles and permissions</p>
        </Link>
      </div>
    </div>
  )
}
