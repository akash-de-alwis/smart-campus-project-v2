import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Users, GraduationCap, FlaskConical, Wrench, Package, Building } from 'lucide-react'
import { resourceAPI } from '../services/api'
import { LoadingSpinner, ErrorAlert, Badge } from '../components/Common'

export default function Resources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    type: '',
    capacity: '',
    location: '',
  })

  useEffect(() => {
    fetchResources()
  }, [filters])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const { data } = await resourceAPI.search(
        filters.type || undefined,
        filters.capacity ? parseInt(filters.capacity) : undefined,
        filters.location || undefined
      )
      setResources(data || [])
      setError(null)
    } catch (err) {
      setError('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const getTypeIcon = (type) => {
    const icons = {
      LECTURE_HALL: GraduationCap,
      LAB: FlaskConical,
      MEETING_ROOM: Building,
      EQUIPMENT: Wrench,
    }
    return icons[type] || Package
  }

  if (loading && resources.length === 0) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse Resources</h1>
        <p className="text-gray-600 mt-2">Find and book available campus resources</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="LECTURE_HALL">Lecture Hall</option>
              <option value="LAB">Lab</option>
              <option value="MEETING_ROOM">Meeting Room</option>
              <option value="EQUIPMENT">Equipment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Capacity</label>
            <input
              type="number"
              name="capacity"
              placeholder="Minimum capacity"
              value={filters.capacity}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
            <input
              type="text"
              name="location"
              placeholder="Search location"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ type: '', capacity: '', location: '' })}
              className="w-full px-4 py-2.5 border-2 border-orange-500 text-orange-600 rounded-xl font-medium hover:bg-orange-500 hover:text-white transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Resources Grid */}
      {resources.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm text-center py-12">
          <p className="text-gray-600 text-lg">No resources found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <Link
              key={resource.id}
              to={`/resources/${resource.id}`}
              className={`bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer group ${
                resource.status === 'OUT_OF_SERVICE' ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors flex items-center gap-2">
                  {(() => {
                    const Icon = getTypeIcon(resource.type)
                    return <Icon size={20} className="text-orange-500" />
                  })()}
                  {resource.name}
                </h3>
                <Badge variant={resource.status === 'ACTIVE' ? 'success' : 'danger'}>
                  {resource.status}
                </Badge>
              </div>

              <p className="text-gray-500 mb-4">{resource.type.replace(/_/g, ' ')}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  <span>{resource.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users size={16} className="mr-2" />
                  <span>Capacity: {resource.capacity} people</span>
                </div>
              </div>

              {resource.status === 'OUT_OF_SERVICE' && (
                <div className="bg-red-50 p-3 rounded-xl mb-4">
                  <p className="text-sm text-red-700 font-medium">
                    Currently out of service - cannot be booked
                  </p>
                </div>
              )}

              <button className={`w-full mt-4 py-2.5 px-4 rounded-xl font-medium transition-colors ${
                resource.status === 'ACTIVE' 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}>
                View Details
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
