import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, Trash2, Ticket, Calendar, Info, AlertCircle, CheckCheck, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { notificationAPI } from '../services/api'

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll()
      setNotifications(data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const { data } = await notificationAPI.getUnread()
      setUnreadCount(data.length)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id)
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.delete(id)
      setNotifications(notifications.filter(n => n.id !== id))
      const deletedNotification = notifications.find(n => n.id === id)
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(Math.max(0, unreadCount - 1))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }
    
    // Navigate to related entity based on notification type
    if (notification.relatedId) {
      const message = notification.message.toLowerCase()
      let targetPath = ''
      let itemType = ''
      
      // Determine the target path based on notification content
      if (message.includes('ticket')) {
        targetPath = `/tickets/${notification.relatedId}`
        itemType = 'Ticket'
      } else if (message.includes('booking')) {
        targetPath = `/bookings/${notification.relatedId}`
        itemType = 'Booking'
      } else if (message.includes('resource')) {
        targetPath = `/resources/${notification.relatedId}`
        itemType = 'Resource'
      } else {
        // Default fallback - try to infer from context or go to dashboard
        targetPath = '/dashboard'
        itemType = 'Item'
      }
      
      // Show toast with navigation info
      toast.success(`Opening ${itemType} #${notification.relatedId}`, {
        description: notification.message,
        icon: <ArrowRight size={16} />,
        duration: 2000,
      })
      
      // Close dropdown and navigate
      setIsOpen(false)
      navigate(targetPath)
    } else {
      // No related ID - navigate to general list based on type
      const message = notification.message.toLowerCase()
      if (message.includes('ticket')) {
        navigate('/tickets')
      } else if (message.includes('booking')) {
        navigate('/bookings')
      } else if (message.includes('resource')) {
        navigate('/resources')
      }
      setIsOpen(false)
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getNotificationIcon = (message) => {
    const msg = message.toLowerCase()
    // All icons use orange theme to match overall design
    if (msg.includes('ticket')) return { icon: Ticket, bgColor: 'bg-orange-100', textColor: 'text-orange-600' }
    if (msg.includes('booking') || msg.includes('booked') || msg.includes('schedule')) return { icon: Calendar, bgColor: 'bg-amber-100', textColor: 'text-amber-600' }
    if (msg.includes('approved') || msg.includes('accepted') || msg.includes('confirmed')) return { icon: Check, bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' }
    if (msg.includes('rejected') || msg.includes('declined') || msg.includes('failed') || msg.includes('urgent')) return { icon: AlertCircle, bgColor: 'bg-orange-100', textColor: 'text-orange-700' }
    return { icon: Info, bgColor: 'bg-amber-100', textColor: 'text-amber-600' }
  }

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter(n => !n.isRead).map(n => notificationAPI.markAsRead(n.id))
      )
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button with Animated Badge */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all duration-300"
      >
        <Bell size={22} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1 shadow-lg shadow-red-500/30"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Bell size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Notifications</h3>
                    <p className="text-white/80 text-xs">
                      {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={markAllAsRead}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all"
                      title="Mark all as read"
                    >
                      <CheckCheck size={18} />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all"
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-10 text-center"
                >
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full blur-xl opacity-60" />
                    <div className="relative p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full w-fit mx-auto">
                      <Bell size={32} className="text-orange-400" />
                    </div>
                  </div>
                  <p className="text-gray-500 font-medium">No notifications yet</p>
                  <p className="text-gray-400 text-sm mt-1">We'll notify you when something arrives</p>
                </motion.div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notification, index) => {
                    const { icon: Icon, bgColor, textColor } = getNotificationIcon(notification.message)
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`group p-4 hover:bg-gray-50/80 transition-all duration-300 cursor-pointer ${
                          !notification.isRead ? 'bg-gradient-to-r from-orange-50/50 to-white' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`p-2.5 ${bgColor} rounded-xl shrink-0 transition-transform group-hover:scale-110`}>
                            <Icon size={18} className={textColor} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm leading-relaxed ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                {notification.message}
                              </p>
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full shrink-0 mt-1.5 shadow-sm shadow-orange-400/50" />
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5 font-medium">
                              {formatDate(notification.timestamp)}
                            </p>
                          </div>

                          {/* Click indicator - shows on hover */}
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            whileHover={{ opacity: 1, x: 0 }}
                            className="flex items-center self-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                          >
                            <ArrowRight size={16} className="text-orange-500" />
                          </motion.div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.8 }}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <Check size={14} />
                              </motion.button>
                            )}
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.8 }}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
