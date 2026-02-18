# Push Notifications Setup Guide

## 1. Install Dependencies

```bash
npm install web-push
```

## 2. Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

## 3. Add Environment Variables

Create/update `.env.local`:

```env
# Public key (add to your frontend)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here

# Private key (keep secret, server-side only)
VAPID_PRIVATE_KEY=your_private_key_here

# Supabase service role key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 4. Run SQL Schema

Execute the SQL file in Supabase SQL Editor:
- Go to Supabase Dashboard → SQL Editor
- Copy contents from `supabase_notifications_schema.sql`
- Run the query

## 5. Test Notifications

### A. Subscribe to Notifications
1. Login to the app
2. Wait 3 seconds for permission prompt
3. Click "Enable" to allow notifications and location

### B. Send Test Notification (Admin)
1. Login as admin
2. Go to Dashboard → Notifications
3. Fill in:
   - Title: "Test Notification"
   - Message: "This is a test"
   - Target: "All Users" or specific user
4. Click "Send Notification"

### C. Verify Delivery
- Check browser notifications
- Check mobile device (if PWA installed)
- Check notification receipts in admin panel

## 6. Platform-Specific Setup

### Android (Chrome PWA)
- Notifications work automatically
- Location requires HTTPS
- Install PWA from Chrome menu

### iOS (Safari PWA)
- iOS 16.4+ required for push notifications
- Add to Home Screen
- Grant notification permission when prompted

### Desktop (Chrome/Edge/Firefox)
- Works in browser and PWA
- Permission prompt appears automatically

## 7. Troubleshooting

### Notifications Not Received
1. Check browser notification settings
2. Verify VAPID keys are correct
3. Check service worker is registered
4. Verify subscription in database

### Location Not Working
1. Ensure HTTPS is enabled
2. Check browser location permissions
3. Verify geolocation API is available

### Admin Can't Send
1. Verify user has admin role
2. Check SUPABASE_SERVICE_ROLE_KEY
3. Verify API route is accessible

## 8. Database Tables

### push_subscriptions
Stores device push subscriptions
- user_id, endpoint, keys, device_type

### notifications
Stores notification history
- title, body, target_type, status, counts

### notification_receipts
Tracks delivery status per user
- notification_id, user_id, status

## 9. API Endpoints

### POST /api/notifications/send
Sends push notifications
- Body: { notificationId: string }
- Returns: { sent, success, failed }

## 10. Features

✅ Push notifications (Android, iOS, Desktop)
✅ Location tracking with permission
✅ Target all users
✅ Target specific user
✅ Target by role (artist/collector)
✅ Delivery tracking
✅ Failed subscription cleanup
✅ Admin dashboard
✅ Notification history

## 11. Security Notes

- VAPID private key must be kept secret
- Use HTTPS in production
- Validate user permissions server-side
- Clean up expired subscriptions
- Rate limit notification sending

## 12. Next Steps

1. Customize notification UI
2. Add notification preferences
3. Implement notification categories
4. Add rich media support
5. Set up analytics tracking
