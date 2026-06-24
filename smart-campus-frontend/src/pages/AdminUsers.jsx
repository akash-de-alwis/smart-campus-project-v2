import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Shield, Trash2, Edit2 } from 'lucide-react'
import { userAPI } from '../services/api'
import { LoadingSpinner, ErrorAlert, Badge } from '../components/Common'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [selectedRole, setSelectedRole] = useState({})

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data } = await userAPI.getAll()
      setUsers(data || [])
      setError(null)
    } catch (err) {
      setError('Failed to load users')
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await userAPI.updateRole(userId, newRole)
      setSuccess('User role updated successfully')
      setEditingId(null)
      fetchUsers()
      toast.success('User role updated successfully')
    } catch (err) {
      setError('Failed to update user role')
      toast.error('Failed to update user role')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await userAPI.deleteUser(userId)
      setSuccess('User deleted successfully')
      fetchUsers()
      toast.success('User deleted successfully')
    } catch (err) {
      setError('Failed to delete user')
      toast.error('Failed to delete user')
    }
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      ADMIN: 'danger',
      TECHNICIAN: 'primary',
      USER: 'gray',
    }
    return colors[role] || 'gray'
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage user roles and permissions</p>
      </div>

      {error && <ErrorAlert message={error} />}

      {users.length === 0 ? (
        <div className="table-empty">
          <svg className="table-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="table-empty-text">No users found</p>
          <p className="table-empty-subtext">Users will appear here once they register</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="table-row-enter">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      {editingId === user.id ? (
                        <div className="flex gap-2">
                          <select
                            value={selectedRole[user.id] || user.role}
                            onChange={(e) =>
                              setSelectedRole({ ...selectedRole, [user.id]: e.target.value })
                            }
                            className="input-field text-sm py-1"
                          >
                            <option value="USER">USER</option>
                            <option value="TECHNICIAN">TECHNICIAN</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <button
                            onClick={() => handleUpdateRole(user.id, selectedRole[user.id])}
                            className="btn-primary text-sm px-3 py-1"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="btn-outline text-sm px-3 py-1"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <Badge variant={getRoleBadgeColor(user.role)}>
                          <div className="flex items-center gap-1">
                            <Shield size={14} />
                            {user.role}
                          </div>
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {user.id?.substring(0, 20)}...
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {editingId !== user.id && (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(user.id)
                                setSelectedRole({ [user.id]: user.role })
                              }}
                              className="action-btn-edit"
                              title="Edit role"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="action-btn-delete"
                              title="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
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
