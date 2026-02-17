'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { ArtistCollaboration } from '@/components/artist-collaboration'
import { getCurrentUser } from '@/lib/auth'

export default function CollaborationsPage() {
  const user = getCurrentUser()

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.artist} role="artist">
      <div className="p-6 lg:p-10">
        <PageHeader title="Collaborations" description="Manage your artist collaborations" />
        {user && <ArtistCollaboration userId={user.user_id} />}
      </div>
    </DashboardLayout>
  )
}
