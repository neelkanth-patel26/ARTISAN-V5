-- Push Notifications Schema for Artisan Museum Landing Page
-- Ensures all tables and functions exist for push notification system

-- Create push_subscriptions table if not exists
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_type TEXT CHECK (device_type IN ('android', 'ios', 'desktop', 'other')),
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'admin_broadcast',
  url TEXT,
  icon TEXT DEFAULT '/icon-192.png',
  image TEXT,
  target_type TEXT CHECK (target_type IN ('all', 'specific', 'artist', 'collector')) DEFAULT 'all',
  target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_role TEXT CHECK (target_role IN ('artist', 'collector', 'admin')),
  sent_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending', 'sending', 'sent', 'failed')) DEFAULT 'pending',
  sent_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification_receipts table if not exists
CREATE TABLE IF NOT EXISTS notification_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('sent', 'failed', 'read')) DEFAULT 'sent',
  error_message TEXT,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_is_active ON push_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_device_type ON push_subscriptions(device_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_target_type ON notifications(target_type);
CREATE INDEX IF NOT EXISTS idx_notification_receipts_notification_id ON notification_receipts(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_receipts_user_id ON notification_receipts(user_id);

-- Create or replace function to get subscriptions by target
CREATE OR REPLACE FUNCTION get_subscriptions_by_target(
  p_target_type TEXT,
  p_target_user_id UUID DEFAULT NULL,
  p_target_role TEXT DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  endpoint TEXT,
  p256dh TEXT,
  auth TEXT,
  device_type TEXT
) AS $$
BEGIN
  IF p_target_type = 'all' THEN
    RETURN QUERY
    SELECT 
      ps.user_id,
      ps.endpoint,
      ps.p256dh,
      ps.auth,
      ps.device_type
    FROM push_subscriptions ps
    WHERE ps.is_active = true;
    
  ELSIF p_target_type = 'specific' AND p_target_user_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      ps.user_id,
      ps.endpoint,
      ps.p256dh,
      ps.auth,
      ps.device_type
    FROM push_subscriptions ps
    WHERE ps.user_id = p_target_user_id
      AND ps.is_active = true;
      
  ELSIF p_target_type IN ('artist', 'collector') AND p_target_role IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      ps.user_id,
      ps.endpoint,
      ps.p256dh,
      ps.auth,
      ps.device_type
    FROM push_subscriptions ps
    INNER JOIN users u ON ps.user_id = u.id
    WHERE u.role = p_target_role
      AND ps.is_active = true;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for push_subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can insert their own subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can update their own subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role has full access to subscriptions" ON push_subscriptions;
CREATE POLICY "Service role has full access to subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (
    auth.uid() = user_id 
    OR target_type = 'all'
    OR (target_type = 'specific' AND auth.uid() = target_user_id)
  );

DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role has full access to notifications" ON notifications;
CREATE POLICY "Service role has full access to notifications"
  ON notifications FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for notification_receipts
DROP POLICY IF EXISTS "Users can view their own receipts" ON notification_receipts;
CREATE POLICY "Users can view their own receipts"
  ON notification_receipts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role has full access to receipts" ON notification_receipts;
CREATE POLICY "Service role has full access to receipts"
  ON notification_receipts FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON push_subscriptions TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notification_receipts TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscriptions_by_target TO authenticated;

-- Add updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Push notification schema setup completed successfully!';
END $$;
