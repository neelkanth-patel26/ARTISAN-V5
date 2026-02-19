import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

webpush.setVapidDetails(
  'mailto:gaming.network.studio.mg@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { title, body, url, targetType = 'all', userId } = await req.json()

    let query = supabase.from('push_subscriptions').select('*').eq('is_active', true)

    if (targetType === 'specific' && userId) {
      query = query.eq('user_id', userId)
    }

    const { data: subscriptions } = await query

    if (!subscriptions?.length) {
      return NextResponse.json({ message: 'No active subscriptions' })
    }

    const payload = JSON.stringify({
      title: title || 'Artisan',
      body: body || 'New notification',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: url || '/' }
    })

    const results = await Promise.allSettled(
      subscriptions.map(sub =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        ).catch(async (error) => {
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase.from('push_subscriptions').update({ is_active: false }).eq('endpoint', sub.endpoint)
          }
          throw error
        })
      )
    )

    const sent = results.filter(r => r.status === 'fulfilled').length

    return NextResponse.json({ message: `Sent to ${sent}/${subscriptions.length} devices` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
