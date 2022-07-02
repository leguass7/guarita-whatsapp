import { isDevMode } from '#/config';

import { logDev } from '.';

export function LogClass(target: any) {
  // save a reference to the original constructor
  const original = target;

  // the new constructor behaviour
  const f: any = function (...args: any[]) {
    //console.log(args[0] && args[0]?.queueName);

    // return  original.apply(this, args);
    const r = new original(...args);

    const name = r?.queueName || r?.provider || r?.prefix || r?.name || r?.viewPath;
    if (isDevMode) logDev('New: ' + original.name, name);

    return r; // according the comments
  };

  // copy prototype so intanceof operator still works
  f.prototype = original.prototype;

  // return new constructor (will override original)
  return f;
}
