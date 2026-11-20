export function selectDestinationAccount(fileMeta, accounts) {
  if (!accounts || accounts.length === 0) return null;

  // Default Policy: Most Free Space (MFS)
  return [...accounts].sort((a, b) => {
    const freeA = a.totalGB - a.usedGB;
    const freeB = b.totalGB - b.usedGB;
    return freeB - freeA;
  })[0];
}