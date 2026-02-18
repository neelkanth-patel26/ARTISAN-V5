'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Bell, Send, Users, User, Palette, ShoppingBag, CheckCircle, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('')
  const [targetType, setTargetType] = useState<'all' | 'specific' | 'artist' | 'collector'>('all')
  const [targetUserId, setTargetUserId] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [sending, setSending] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, android: 0, ios: 0, desktop: 0 })

  useEffect(() => {
    loadUsers()
    loadNotifications()
    loadStats()
  }, [])

  const loadUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, full_name, email, user_role')
      .order('full_name')
    setUsers(data || [])
  }

  const loadNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    setNotifications(data || [])
  }

  const loadStats = async () => {
    const { data } = await supabase
      .from('push_subscriptions')
      .select('device_type')
      .eq('is_active', true)

    const total = data?.length || 0
    const android = data?.filter(s => s.device_type === 'android').length || 0
    const ios = data?.filter(s => s.device_type === 'ios').length || 0
    const desktop = data?.filter(s => s.device_type === 'desktop').length || 0

    setStats({ total, android, ios, desktop })
  }

  const sendNotification = async () => {
    if (!title || !body) {
      toast.error('Title and body are required')
      return
    }

    if (targetType === 'specific' && !targetUserId) {
      toast.error('Please select a user')
      return
    }

    setSending(true)

    try {
      const user = getCurrentUser()
      
      const notificationData: any = {
        title,
        body,
        message: body,
        type: 'admin_broadcast',
        url: url || null,
        icon: '/icon-192.png',
        target_type: targetType,
        sent_by: user?.user_id,
        status: 'pending'
      }

      if (targetType === 'specific') {
        notificationData.target_user_id = targetUserId
        notificationData.user_id = targetUserId
      }
      
      if (targetType === 'artist' || targetType === 'collector') {
        notificationData.target_role = targetType
      }

      const { data: notification, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single()

      if (error) throw error

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notification.id })
      })

      if (!response.ok) throw new Error('Failed to send notification')

      toast.success('Notification sent successfully')
      setTitle('')
      setBody('')
      setUrl('')
      setTargetType('all')
      setTargetUserId('')
      loadNotifications()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="p-6 lg:p-10 space-y-8">
        <PageHeader 
          title="Push Notifications" 
          description="Send notifications to users across all platforms"
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
          >
            <Bell className="text-amber-600 mb-3" size={24} />
            <p className="text-3xl font-light text-white mb-1">{stats.total}</p>
            <p className="text-sm text-neutral-400">Total Subscriptions</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
          >
            <div className="text-green-500 mb-3 text-xl font-semibold">Android</div>
            <p className="text-3xl font-light text-white mb-1">{stats.android}</p>
            <p className="text-sm text-neutral-400">Devices</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
          >
            <div className="text-blue-500 mb-3 text-xl font-semibold">iOS</div>
            <p className="text-3xl font-light text-white mb-1">{stats.ios}</p>
            <p className="text-sm text-neutral-400">Devices</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
          >
            <div className="text-purple-500 mb-3 text-xl font-semibold">Desktop</div>
            <p className="text-3xl font-light text-white mb-1">{stats.desktop}</p>
            <p className="text-sm text-neutral-400">Devices</p>
          </motion.div>
        </div>

        {/* Send Notification Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 lg:p-8"
        >
          <h2 className="text-2xl font-light text-white mb-6">Send New Notification</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-600 focus:outline-none"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Message *</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Notification message"
                rows={4}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-600 focus:outline-none resize-none"
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">URL (optional)</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="/gallery or https://..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Target Audience *</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => setTargetType('all')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    targetType === 'all'
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-amber-600/50'
                  }`}
                >
                  <Users size={18} />
                  All Users
                </button>
                <button
                  onClick={() => setTargetType('artist')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    targetType === 'artist'
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-amber-600/50'
                  }`}
                >
                  <Palette size={18} />
                  Artists
                </button>
                <button
                  onClick={() => setTargetType('collector')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    targetType === 'collector'
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-amber-600/50'
                  }`}
                >
                  <ShoppingBag size={18} />
                  Collectors
                </button>
                <button
                  onClick={() => setTargetType('specific')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    targetType === 'specific'
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-amber-600/50'
                  }`}
                >
                  <User size={18} />
                  Specific User
                </button>
              </div>
            </div>

            {targetType === 'specific' && (
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Select User *</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-600 focus:outline-none"
                >
                  <option value="">Choose a user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email}) - {user.user_role}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={sendNotification}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white py-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </motion.div>

        {/* Recent Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 lg:p-8"
        >
          <h2 className="text-2xl font-light text-white mb-6">Recent Notifications</h2>
          
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">No notifications sent yet</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 hover:border-amber-600/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{notif.title}</h3>
                      <p className="text-neutral-400 text-sm mb-2">{notif.body}</p>
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span>Target: {notif.target_type}</span>
                        <span>Sent: {notif.sent_count || 0}</span>
                        <span>Success: {notif.success_count || 0}</span>
                        <span>{new Date(notif.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      {notif.status === 'sent' ? (
                        <CheckCircle className="text-green-500" size={20} />
                      ) : notif.status === 'failed' ? (
                        <XCircle className="text-red-500" size={20} />
                      ) : (
                        <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
