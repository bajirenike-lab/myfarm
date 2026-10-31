// ==============================================================================
// MYFARM NIGERIA - COMMERCIAL & DIGITAL BANKS (NUBAN DIRECTORY)
// ==============================================================================

export interface NigerianBank {
  name: string;
  code: string;
  slug: string;
  category: 'commercial' | 'digital' | 'microfinance';
}

export const NIGERIAN_BANKS: NigerianBank[] = [
  { name: 'Guaranty Trust Bank (GTBank)', code: '058', slug: 'gtbank', category: 'commercial' },
  { name: 'Zenith Bank', code: '057', slug: 'zenith-bank', category: 'commercial' },
  { name: 'Access Bank', code: '044', slug: 'access-bank', category: 'commercial' },
  { name: 'First Bank of Nigeria', code: '011', slug: 'first-bank', category: 'commercial' },
  { name: 'United Bank for Africa (UBA)', code: '033', slug: 'uba', category: 'commercial' },
  { name: 'Kuda Bank', code: '50211', slug: 'kuda-bank', category: 'digital' },
  { name: 'Moniepoint MFB', code: '50515', slug: 'moniepoint', category: 'digital' },
  { name: 'OPay Digital Services', code: '999992', slug: 'opay', category: 'digital' },
  { name: 'Stanbic IBTC Bank', code: '039', slug: 'stanbic-ibtc', category: 'commercial' },
  { name: 'Sterling Bank', code: '232', slug: 'sterling-bank', category: 'commercial' },
  { name: 'Fidelity Bank', code: '070', slug: 'fidelity-bank', category: 'commercial' },
  { name: 'Wema Bank / ALAT', code: '035', slug: 'wema-bank', category: 'commercial' },
];

/**
 * Validate Nigerian NUBAN 10-digit format
 */
export function validateNuban(accountNumber: string): boolean {
  const cleaned = accountNumber.replace(/\D/g, '');
  return cleaned.length === 10;
}

/**
 * Mock Account Name Resolver
 * Simulates Paystack / NIBSS Name Inquiry API:
 * In live production, calls: https://api.paystack.co/bank/resolve?account_number=...&bank_code=...
 */
export async function resolveAccountName(
  accountNumber: string,
  bankCode: string,
  fallbackName = 'Babatunde Adeleke'
): Promise<{ success: boolean; accountName?: string; error?: string }> {
  const cleaned = accountNumber.replace(/\D/g, '');
  if (cleaned.length !== 10) {
    return { success: false, error: 'Account number must be exactly 10 digits.' };
  }

  // Artificial short delay simulating bank inquiry latency
  await new Promise((r) => setTimeout(r, 600));

  return {
    success: true,
    accountName: fallbackName,
  };
}
