import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@artisan.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

export async function POST(req: NextRequest) {
  try {
    const { notificationId } = await req.json()

    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single()

    if (notifError || !notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      let query = supabase.from('push_subscriptions').select('*').eq('is_active', true)

      if (notification.target_type === 'specific' && notification.target_user_id) {
        query = query.eq('user_id', notification.target_user_id)
      } else if (notification.target_type === 'artist' || notification.target_type === 'collector') {
        const { data: roleUsers } = await supabase.from('users').select('id').eq('role', notification.target_type)
        if (roleUsers?.length) query = query.in('user_id', roleUsers.map(u => u.id))
      }

      const { data: subscriptions } = await query

      if (subscriptions?.length) {
        const payload = JSON.stringify({
          title: notification.title,
          body: notification.body,
          icon: '/icon-192.png',
          data: { url: notification.url || '/', notificationId: notification.id }
        })

        await Promise.allSettled(
          subscriptions.map(sub =>
            webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload)
              .catch(() => {})
          )
        )
      }
    }

    await supabase
      .from('notifications')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', notificationId)

    return NextResponse.json({ message: 'Notification sent' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
