import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json()
    const user = getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deviceType = req.headers.get('user-agent')?.toLowerCase().includes('android') 
      ? 'android' 
      : req.headers.get('user-agent')?.toLowerCase().includes('iphone') || req.headers.get('user-agent')?.toLowerCase().includes('ipad')
      ? 'ios'
      : 'desktop'

    await supabase.from('push_subscriptions').upsert({
      user_id: user.user_id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      device_type: deviceType,
      is_active: true
    }, { onConflict: 'endpoint' })

    return NextResponse.json({ message: 'Subscribed' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
