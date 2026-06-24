import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { resourceAPI } from '../services/api'
import { LoadingSpinner, ErrorAlert, Badge } from '../components/Common'

export default function AdminResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [modal, setModal] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'LECTURE_HALL',
    capacity: 1,
    location: '',
    status: 'ACTIVE',
  })

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const { data } = await resourceAPI.getAll()
      setResources(data || [])
    } catch (err) {
      setError('Failed to load resources')
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (resource) => {
    setFormData(resource)
    setModal('edit')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return
    try {
      await resourceAPI.delete(id)
      setResources(resources.filter(r => r.id !== id))
      toast.success('Resource deleted successfully')
    } catch (err) {
      setError('Failed to delete resource')
      toast.error('Failed to delete resource')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (formData.id) {
        await resourceAPI.update(formData.id, formData)
        setResources(resources.map(r => r.id === formData.id ? formData : r))
        toast.success('Resource updated successfully')
      } else {
        const { data } = await resourceAPI.create(formData)
        setResources([...resources, data])
        toast.success('Resource created successfully')
      }
      setModal(null)
      setFormData({ name: '', type: 'LECTURE_HALL', capacity: 1, location: '', status: 'ACTIVE' })
    } catch (err) {
      setError('Failed to save resource')
      toast.error('Failed to save resource')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'capacity' ? parseInt(value) : value }))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Resources</h1>
          <p className="text-gray-600 mt-2">Add, edit, or delete campus resources</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', type: 'LECTURE_HALL', capacity: 1, location: '', status: 'ACTIVE' })
            setModal('add')
          }}
          className="btn-primary flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Resource
        </button>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(resource => (
              <tr key={resource.id} className="table-row-enter">
                <td className="px-6 py-4 font-medium text-gray-900">{resource.name}</td>
                <td className="px-6 py-4">{resource.type}</td>
                <td className="px-6 py-4">{resource.capacity}</td>
                <td className="px-6 py-4">{resource.location}</td>
                <td className="px-6 py-4">
                  <Badge variant={resource.status === 'ACTIVE' ? 'success' : 'danger'}>
                    {resource.status}
                  </Badge>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="action-btn-edit"
                      title="Edit resource"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="action-btn-delete"
                      title="Delete resource"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {modal === 'add' ? 'Add Resource' : 'Edit Resource'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option>LECTURE_HALL</option>
                  <option>LAB</option>
                  <option>MEETING_ROOM</option>
                  <option>EQUIPMENT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="input-field"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option>ACTIVE</option>
                  <option>OUT_OF_SERVICE</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
