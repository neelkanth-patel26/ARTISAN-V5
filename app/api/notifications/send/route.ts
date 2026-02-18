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
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 })
    }

    const { notificationId } = await req.json()

    const { data: notification } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single()

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    await supabase
      .from('notifications')
      .update({ status: 'sending' })
      .eq('id', notificationId)

    const { data: subscriptions } = await supabase.rpc('get_subscriptions_by_target', {
      p_target_type: notification.target_type,
      p_target_user_id: notification.target_user_id,
      p_target_role: notification.target_role
    })

    if (!subscriptions || subscriptions.length === 0) {
      await supabase
        .from('notifications')
        .update({ status: 'sent', sent_count: 0, sent_at: new Date().toISOString() })
        .eq('id', notificationId)
      
      return NextResponse.json({ message: 'No active subscriptions found', sent: 0 })
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/icon-192.png',
      image: notification.image,
      badge: '/icon-192.png',
      data: {
        url: notification.url || '/',
        notificationId: notification.id
      }
    })

    let successCount = 0
    let failureCount = 0

    const sendPromises = subscriptions.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          },
          payload
        )

        await supabase.from('notification_receipts').insert({
          notification_id: notificationId,
          user_id: sub.user_id,
          status: 'sent',
          delivered_at: new Date().toISOString()
        })

        successCount++
      } catch (error: any) {
        await supabase.from('notification_receipts').insert({
          notification_id: notificationId,
          user_id: sub.user_id,
          status: 'failed',
          error_message: error.message
        })

        if (error.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('endpoint', sub.endpoint)
        }

        failureCount++
      }
    })

    await Promise.all(sendPromises)

    await supabase
      .from('notifications')
      .update({
        status: 'sent',
        sent_count: subscriptions.length,
        success_count: successCount,
        failure_count: failureCount,
        sent_at: new Date().toISOString()
      })
      .eq('id', notificationId)

    return NextResponse.json({
      message: 'Notifications sent',
      sent: subscriptions.length,
      success: successCount,
      failed: failureCount
    })
  } catch (error: any) {
    console.error('Send notification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
