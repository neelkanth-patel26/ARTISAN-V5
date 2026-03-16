'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { AdvancedAnalytics } from '@/components/advanced-analytics'
import { getCurrentUser } from '@/lib/auth'

export default function AnalyticsPage() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (user) setUserId(user.user_id)
  }, [])

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.artist} role="artist">
      <div className="p-4 lg:p-8">
        {userId && <AdvancedAnalytics userId={userId} role="artist" />}
      </div>
    </DashboardLayout>
  )
}
