-- ==============================================================================
-- 05: NOTIFICATIONS & ALERTS MIGRATION SCRIPT
-- Configures notifications table for automated SMS, WhatsApp, and in-app alerts
-- ==============================================================================

-- 1. Add extra columns to notifications if not present
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'channel'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN channel TEXT DEFAULT 'all';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'recipient_phone'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN recipient_phone TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'sms_message'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN sms_message TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'whatsapp_message'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN whatsapp_message TEXT;
  END IF;

  -- Allow user_id to be nullable for guest marketplace checkouts
  ALTER TABLE public.notifications ALTER COLUMN user_id DROP NOT NULL;
END $$;

-- 2. Enable RLS and Permissive Policies for Automated System Alerts
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
CREATE POLICY "Anyone can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view notifications" ON public.notifications;
CREATE POLICY "Anyone can view notifications" ON public.notifications
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update notifications" ON public.notifications;
CREATE POLICY "Anyone can update notifications" ON public.notifications
  FOR UPDATE USING (true);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
