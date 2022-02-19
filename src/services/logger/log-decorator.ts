import { isDevMode } from '#/config';
import { logDev } from '#/services/logger';

export function LogClass(target: any) {
  // save a reference to the original constructor
  const original = target;

  // the new constructor behaviour
  const f: any = function (...args: any[]) {
    if (isDevMode) logDev('New: ' + original.name);
    //return  original.apply(this, args);
    return new original(...args); // according the comments
  };

  // copy prototype so intanceof operator still works
  f.prototype = original.prototype;

  // return new constructor (will override original)
  return f;
}
