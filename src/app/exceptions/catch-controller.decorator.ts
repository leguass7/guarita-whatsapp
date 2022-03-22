function generateDescriptor(descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    try {
      const result = originalMethod.apply(this, args);

      // Check if method is asynchronous
      if (result && result instanceof Promise) {
        return result.catch((error: any) => {
          if (typeof args[2] === 'function') args[2](error);
        });
      }

      return result;
    } catch (error) {
      if (typeof args[2] === 'function') args[2](error);
    }
  };
  return descriptor;
}

/**
 * Decorator para errors de fluxo do endpoint. Deve ser usado apenas em controller do `express`
 */
export function Catch(): any {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if (descriptor) {
      return generateDescriptor(descriptor);
    } else {
      for (const propertyName of Reflect.ownKeys(target.prototype).filter(prop => prop !== 'constructor')) {
        const desc = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
        const isMethod = desc.value instanceof Function;
        if (!isMethod) continue;
        Object.defineProperty(target.prototype, propertyName, generateDescriptor(desc));
      }
    }
  };
}
