export function isDefined(v: any): boolean {
  return !!(v !== null && typeof v !== 'undefined');
}

export function isObject(item?: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item) && !(item instanceof Date);
}
