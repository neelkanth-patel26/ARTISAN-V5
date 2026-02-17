'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { AdvancedAnalytics } from '@/components/advanced-analytics'
import { getCurrentUser } from '@/lib/auth'

export default function AnalyticsPage() {
  const user = getCurrentUser()

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.artist} role="artist">
      <div className="p-6 lg:p-10">
        <PageHeader title="Analytics" description="Track your performance and revenue" />
        {user && <AdvancedAnalytics userId={user.user_id} role="artist" />}
      </div>
    </DashboardLayout>
  )
}
