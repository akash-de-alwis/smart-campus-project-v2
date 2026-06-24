import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  AlertTriangle,
  Settings,
  Wrench,
  Save,
  RotateCcw,
} from 'lucide-react'
import { notificationPreferencesAPI } from '../services/api'
import { LoadingSpinner } from './Common'

const categories = [
  {
    key: 'bookingUpdates',
    label: 'Booking Updates',
    description: 'Get notified when your bookings are confirmed, approved, or rejected',
    icon: Calendar,
  },
  {
    key: 'ticketUpdates',
    label: 'Ticket Updates',
    description: 'Receive updates when your support tickets change status or get new comments',
    icon: MessageSquare,
  },
  {
    key: 'systemAnnouncements',
    label: 'System Announcements',
    description: 'Important updates about the Smart Campus platform',
    icon: Settings,
  },
  {
    key: 'resourceUpdates',
    label: 'Resource Updates',
    description: 'Notifications about resource availability changes',
    icon: Bell,
  },
  {
    key: 'maintenanceAlerts',
    label: 'Maintenance Alerts',
    description: 'Get alerted about scheduled maintenance and downtime',
    icon: Wrench,
  },
]

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      setLoading(true)
      const { data } = await notificationPreferencesAPI.get()
      setPreferences(data)
    } catch (err) {
      toast.error('Failed to load notification preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (key) => {
    const newValue = !preferences[key]
    setPreferences((prev) => ({ ...prev, [key]: newValue }))

    try {
      await notificationPreferencesAPI.patch({ [key]: newValue })
      toast.success(`${categories.find((c) => c.key === key)?.label || key} ${newValue ? 'enabled' : 'disabled'}`)
    } catch (err) {
      // Revert on error
      setPreferences((prev) => ({ ...prev, [key]: !newValue }))
      toast.error('Failed to update preference')
    }
  }

  const handleMasterToggle = async (key) => {
    const newValue = !preferences[key]
    setPreferences((prev) => ({ ...prev, [key]: newValue }))

    try {
      await notificationPreferencesAPI.patch({ [key]: newValue })
      toast.success(`${key === 'emailNotifications' ? 'Email' : 'Push'} notifications ${newValue ? 'enabled' : 'disabled'}`)
    } catch (err) {
      setPreferences((prev) => ({ ...prev, [key]: !newValue }))
      toast.error('Failed to update preference')
    }
  }

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all notification preferences to default?')) return

    try {
      await notificationPreferencesAPI.reset()
      toast.success('Preferences reset to default')
      fetchPreferences()
    } catch (err) {
      toast.error('Failed to reset preferences')
    }
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      await notificationPreferencesAPI.update(preferences)
      toast.success('All preferences saved')
    } catch (err) {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  if (!preferences) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-3" />
        <p className="text-gray-600">Failed to load preferences</p>
        <button onClick={fetchPreferences} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Master Controls */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Mail size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
            </div>
            <button
              onClick={() => handleMasterToggle('emailNotifications')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.emailNotifications ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences.emailNotifications ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Bell size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Browser push notifications</p>
              </div>
            </div>
            <button
              onClick={() => handleMasterToggle('pushNotifications')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.pushNotifications ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences.pushNotifications ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Category Preferences */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => {
            const Icon = category.icon
            const isEnabled = preferences[category.key]

            return (
              <div
                key={category.key}
                className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                  isEnabled ? 'bg-orange-50/50 border border-orange-100' : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isEnabled ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{category.label}</p>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(category.key)}
                  disabled={!preferences.emailNotifications && !preferences.pushNotifications}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isEnabled ? 'bg-orange-500' : 'bg-gray-300'
                  } ${
                    !preferences.emailNotifications && !preferences.pushNotifications
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
        <button onClick={handleReset} className="btn-outline flex items-center gap-2">
          <RotateCcw size={18} />
          Reset to Default
        </button>
      </div>
    </div>
  )
}
