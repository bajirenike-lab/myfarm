-- ==============================================================================
-- 06: SELLER SETTLEMENTS & BANK PAYOUTS MIGRATION
-- Configures seller settlements, bank accounts, and NIP payout tracking
-- ==============================================================================

-- 1. Ensure Bank Accounts Table Exists
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  bank_code TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Ensure RLS Policies for Bank Accounts
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public manage bank accounts" ON public.bank_accounts;
CREATE POLICY "Public manage bank accounts" ON public.bank_accounts
  FOR ALL USING (true);

-- 3. Update Seller Settlements Policies & Constraints
ALTER TABLE public.seller_settlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public manage seller settlements" ON public.seller_settlements;
CREATE POLICY "Public manage seller settlements" ON public.seller_settlements
  FOR ALL USING (true);

-- Allow listing_id to be nullable for direct plot harvest settlements
ALTER TABLE public.seller_settlements ALTER COLUMN listing_id DROP NOT NULL;

-- 4. Seed Initial Bank Account for Demo User (Babatunde Adeleke)
INSERT INTO public.bank_accounts (user_id, bank_name, bank_code, account_number, account_name, is_default)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Guaranty Trust Bank (GTBank)',
  '058',
  '0123456789',
  'Babatunde Adeleke',
  true
)
ON CONFLICT DO NOTHING;

-- 5. Seed Initial Settlement Records (Marketplace Produce Sales)
INSERT INTO public.seller_settlements (
  seller_id,
  gross_sales,
  platform_commission,
  net_payable,
  bank_name,
  account_number,
  account_name,
  status,
  payout_reference,
  settled_at
)
VALUES
(
  '00000000-0000-0000-0000-000000000001',
  123250.00,
  6162.50,
  117087.50,
  'Guaranty Trust Bank (GTBank)',
  '0123456789',
  'Babatunde Adeleke',
  'pending',
  'STL-IBD-2026-001',
  NULL
),
(
  '00000000-0000-0000-0000-000000000001',
  49000.00,
  2450.00,
  46550.00,
  'Guaranty Trust Bank (GTBank)',
  '0123456789',
  'Babatunde Adeleke',
  'completed',
  'NIP-TRANSFER-2026-8912',
  timezone('utc', now() - INTERVAL '2 days')
)
ON CONFLICT DO NOTHING;
