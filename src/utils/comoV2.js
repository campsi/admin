/**
 * Tells if a vendor needs consent mode v2
 * @param vendor
 * @returns {boolean|boolean}
 */
export function isConsentModeV2Vendor(vendor) {
  const name = vendor.name.toLowerCase();
  return name.includes('google') && (name.includes('ads') || name.includes('advertising') || name.includes('analytic'));
}
