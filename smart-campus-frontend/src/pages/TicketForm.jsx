import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FileText, AlertCircle, MapPin, Users, Phone, Paperclip, X } from 'lucide-react'
import { ticketAPI } from '../services/api'
import { ErrorAlert } from '../components/Common'

export default function TicketForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [files, setFiles] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    contactDetails: '',
    department: 'GENERAL',
    priority: 'MEDIUM',
    affectedUsers: 1,
  })
  
  const [errors, setErrors] = useState({})

  const validateField = (name, value) => {
    const newErrors = { ...errors }
    
    switch (name) {
      case 'title':
        if (!value || value.trim().length === 0) {
          newErrors.title = 'Issue title is required'
        } else if (value.trim().length < 5) {
          newErrors.title = 'Issue title must be at least 5 characters'
        } else if (value.trim().length > 100) {
          newErrors.title = 'Issue title must be less than 100 characters'
        } else {
          delete newErrors.title
        }
        break
        
      case 'description':
        if (!value || value.trim().length === 0) {
          newErrors.description = 'Description is required'
        } else if (value.trim().length < 20) {
          newErrors.description = 'Description must be at least 20 characters'
        } else if (value.trim().length > 2000) {
          newErrors.description = 'Description must be less than 2000 characters'
        } else {
          delete newErrors.description
        }
        break
        
      case 'location':
        if (!value || value.trim().length === 0) {
          newErrors.location = 'Location is required'
        } else if (value.trim().length < 3) {
          newErrors.location = 'Location must be at least 3 characters'
        } else if (value.trim().length > 200) {
          newErrors.location = 'Location must be less than 200 characters'
        } else {
          delete newErrors.location
        }
        break
        
      case 'contactDetails':
        if (!value || value.trim().length === 0) {
          newErrors.contactDetails = 'Contact details are required'
        } else {
          // Phone number validation - exactly 10 digits only
          const phoneRegex = /^\d{10}$/
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          
          if (value.includes('@') && !emailRegex.test(value)) {
            newErrors.contactDetails = 'Please enter a valid email address'
          } else if (value.includes('ext') || value.includes('Ext')) {
            // Valid extension format
            delete newErrors.contactDetails
          } else if (phoneRegex.test(value.trim())) {
            // Valid 10-digit phone number format
            delete newErrors.contactDetails
          } else {
            // Anything else is invalid for phone numbers
            newErrors.contactDetails = 'Phone number must be exactly 10 digits (no letters, spaces, dashes, or symbols)'
          }
        }
        break
        
      case 'affectedUsers':
        const num = parseInt(value) || 1
        if (isNaN(num) || num < 1) {
          newErrors.affectedUsers = 'Number of affected users must be at least 1'
        } else if (num > 10000) {
          newErrors.affectedUsers = 'Number of affected users cannot exceed 10000'
        } else {
          delete newErrors.affectedUsers
        }
        break
    }
    
    setErrors(newErrors)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    validateField(name, value)
    
    if (name === 'affectedUsers') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 1,
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const validFiles = selectedFiles.filter(file => {
      const isValidType = ['image/png', 'image/jpeg', 'image/gif', 'application/pdf'].includes(file.type)
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      return isValidType && isValidSize
    })
    
    if (validFiles.length !== selectedFiles.length) {
      setError('Some files were rejected. Only PNG, JPG, GIF, and PDF files up to 10MB are allowed.')
    }
    
    setFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all fields
    validateField('title', formData.title)
    validateField('description', formData.description)
    validateField('location', formData.location)
    validateField('contactDetails', formData.contactDetails)
    validateField('affectedUsers', formData.affectedUsers.toString())
    
    // Check if there are any errors
    const hasErrors = Object.keys(errors).length > 0
    
    if (hasErrors) {
      setError('Please fix the validation errors before submitting')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await ticketAPI.create(formData, files.length > 0 ? files : null)
      toast.success('Ticket created successfully!')
      setTimeout(() => navigate('/tickets'), 1500)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create ticket'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
        <p className="text-gray-500 mt-1">Create a new support ticket</p>
      </div>

      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <FileText size={16} className="mr-2 text-orange-500" />
            Issue Title *
          </label>
          <input
            type="text"
            name="title"
            placeholder="Brief description of the issue"
            value={formData.title}
            onChange={handleChange}
            className={`input-field ${errors.title ? 'border-red-500 focus:border-red-500' : ''}`}
            required
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <AlertCircle size={16} className="mr-2 text-orange-500" />
            Detailed Description *
          </label>
          <textarea
            name="description"
            placeholder="Provide detailed information about the issue..."
            value={formData.description}
            onChange={handleChange}
            className={`input-field resize-none rounded-lg ${errors.description ? 'border-red-500 focus:border-red-500' : ''}`}
            rows="4"
            required
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <MapPin size={16} className="mr-2 text-orange-500" />
            Location / Area *
          </label>
          <input
            type="text"
            name="location"
            placeholder="e.g., Lab A, Building 3, Floor 2"
            value={formData.location}
            onChange={handleChange}
            className={`input-field ${errors.location ? 'border-red-500 focus:border-red-500' : ''}`}
            required
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location}</p>
          )}
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Department</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="input-field"
          >
            <option value="GENERAL">General</option>
            <option value="FACILITIES">Facilities</option>
            <option value="IT">IT Support</option>
            <option value="ACADEMIC">Academic</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Priority Level</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="input-field"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High - Urgent</option>
          </select>
        </div>

        {/* Affected Users */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <Users size={16} className="mr-2 text-orange-500" />
            Number of Affected Users
          </label>
          <input
            type="number"
            name="affectedUsers"
            min="1"
            max="10000"
            value={formData.affectedUsers}
            onChange={handleChange}
            className={`input-field ${errors.affectedUsers ? 'border-red-500 focus:border-red-500' : ''}`}
            placeholder="How many users are affected?"
          />
          {errors.affectedUsers && (
            <p className="text-red-500 text-sm mt-1">{errors.affectedUsers}</p>
          )}
        </div>

        {/* Contact Details */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <Phone size={16} className="mr-2 text-orange-500" />
            Contact Details (Phone / Extension)
          </label>
          <input
            type="text"
            name="contactDetails"
            placeholder="e.g., 1234567890 or Ext: 1234"
            value={formData.contactDetails}
            onChange={handleChange}
            className={`input-field ${errors.contactDetails ? 'border-red-500 focus:border-red-500' : ''}`}
          />
          {errors.contactDetails && (
            <p className="text-red-500 text-sm mt-1">{errors.contactDetails}</p>
          )}
        </div>

        {/* File Attachments */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <Paperclip size={16} className="mr-2 text-orange-500" />
            Attachments (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/png,image/jpeg,image/gif,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-center"
            >
              <div className="text-gray-600">
                <Paperclip size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Click to upload files or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF, PDF (max 10MB each)
                </p>
              </div>
            </label>
          </div>
          
          {/* File List */}
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <Paperclip size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700 truncate max-w-xs">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-500 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="flex-1 border-2 border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-medium hover:border-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
