export const TIER_MAP: Record<string, string> = {
  plus_monthly: 'plus',
  premium_monthly: 'premium',
  pro_semiannual: 'pro',
  yearly_annual: 'yearly',
};
export async function initIAP() {}
export async function getProducts() { return []; }
export async function purchaseSubscription(id: string) { return true; }
export async function restorePurchases() { return [{ productId: 'yearly_annual' }]; }
export function disconnectIAP() {}
