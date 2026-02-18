-- Push Notifications Schema

-- 1. Drop existing notifications table and recreate with new structure
DROP TABLE IF EXISTS public.notifications CASCADE;

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text,
  title text NOT NULL,
  message text,
  body text,
  icon text,
  image text,
  url text,
  link text,
  target_type text CHECK (target_type IN ('all', 'specific', 'role', 'artist', 'collector')),
  target_user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  target_role text,
  sent_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  sent_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  failure_count integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone,
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- 2. Create push_subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  device_type text CHECK (device_type IN ('android', 'ios', 'desktop', 'other')),
  user_agent text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- 3. Create notification_receipts table
CREATE TABLE IF NOT EXISTS public.notification_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.push_subscriptions(id) ON DELETE SET NULL,
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'clicked')),
  error_message text,
  delivered_at timestamp with time zone,
  clicked_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Add location columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS latitude numeric(10, 8),
ADD COLUMN IF NOT EXISTS longitude numeric(11, 8),
ADD COLUMN IF NOT EXISTS location_updated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS location_permission_granted boolean DEFAULT false;

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON public.push_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notifications_target_type ON public.notifications(target_type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_receipts_notification_id ON public.notification_receipts(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_receipts_user_id ON public.notification_receipts(user_id);

-- 6. Create function to get subscriptions by target
CREATE OR REPLACE FUNCTION get_subscriptions_by_target(
  p_target_type text,
  p_target_user_id uuid DEFAULT NULL,
  p_target_role text DEFAULT NULL
)
RETURNS TABLE (
  user_id uuid,
  endpoint text,
  p256dh text,
  auth text,
  device_type text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.user_id,
    ps.endpoint,
    ps.p256dh,
    ps.auth,
    ps.device_type
  FROM push_subscriptions ps
  INNER JOIN users u ON ps.user_id = u.id
  WHERE ps.is_active = true
    AND u.status = 'active'
    AND (
      (p_target_type = 'all') OR
      (p_target_type = 'specific' AND ps.user_id = p_target_user_id) OR
      (p_target_type = 'artist' AND u.role = 'artist') OR
      (p_target_type = 'collector' AND u.role = 'collector')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant permissions
GRANT ALL ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notification_receipts TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscriptions_by_target TO authenticated;
