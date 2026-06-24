import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { MapPin, Users, Calendar, ArrowLeft } from 'lucide-react'
import { resourceAPI } from '../services/api'
import { LoadingSpinner, ErrorAlert, Badge } from '../components/Common'

export default function ResourceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchResource()
  }, [id])

  const fetchResource = async () => {
    try {
      setLoading(true)
      const { data } = await resourceAPI.getById(id)
      setResource(data)
      setError(null)
    } catch (err) {
      setError('Failed to load resource details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorAlert message={error} />
  if (!resource) return <ErrorAlert message="Resource not found" />

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
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{resource.name}</h1>
              <Badge variant={resource.status === 'ACTIVE' ? 'success' : 'danger'}>
                {resource.status}
              </Badge>
            </div>

            <p className="text-gray-600 mb-6">{resource.type.replace(/_/g, ' ')}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <MapPin size={24} className="text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">{resource.location}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                <Users size={24} className="text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Capacity</p>
                  <p className="font-semibold text-gray-900">{resource.capacity} people</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Availability</h2>
              {resource.status === 'ACTIVE' ? (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 font-medium">
                    ✓ Available for booking
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    {resource.availabilityWindows || 'Monday - Friday, 8:00 AM - 6:00 PM'}
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-red-800 font-medium">
                    ⚠️ Out of Service
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    This resource is currently unavailable for booking due to maintenance or other issues.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Instructions */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">How to Book</h2>
            <ol className="space-y-4">
              {[
                { step: 1, title: 'Click "Book Now"', desc: 'Select your preferred date and time' },
                { step: 2, title: 'Fill Details', desc: 'Enter the purpose and number of attendees' },
                { step: 3, title: 'Submit', desc: 'Send your booking for admin approval' },
                { step: 4, title: 'Confirmation', desc: 'Receive confirmation email when approved' },
              ].map(item => (
                <li key={item.step} className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                      <span className="text-blue-600 font-bold">{item.step}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="card sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {resource.status === 'ACTIVE' ? 'Ready to Book?' : 'Resource Unavailable'}
            </h2>
            {resource.status === 'ACTIVE' ? (
              <Link
                to="/booking/new"
                state={{ resourceId: resource.id, resourceName: resource.name }}
                className="btn-primary w-full text-center text-lg py-3 mb-4 block"
              >
                <Calendar size={20} className="inline mr-2" />
                Book Now
              </Link>
            ) : (
              <button className="btn-secondary w-full text-center text-lg py-3 mb-4 cursor-not-allowed" disabled>
                <Calendar size={20} className="inline mr-2" />
                Unavailable
              </button>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">{resource.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-medium">{resource.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${resource.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                    {resource.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
