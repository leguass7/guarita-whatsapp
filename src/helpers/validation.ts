export function isDefined(v: any): boolean {
  return !!(v !== null && typeof v !== 'undefined');
}
