import { isValid, parse, parseISO } from 'date-fns';

export function tryDate(date: string | Date): Date {
  if (date instanceof Date) return date;
  let result: Date = null;

  if (typeof date === 'string') {
    result = parseISO(date);
    if (isValid(result)) return result;
    result = parse(date, 'yyyy-MM-dd', new Date());
    if (isValid(result)) return result;
    result = parse(date, 'yyyy-MM-dd HH:mm:ss', new Date());
    if (isValid(result)) return result;
    result = null;
  }
  return result;
}
