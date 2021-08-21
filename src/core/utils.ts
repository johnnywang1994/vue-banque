import { toRef } from 'vue';
import { BanqueContext, TypeFunction } from 'types';
import { hookActionKey, setterErrorKey } from './symbol';

/**
 * Wrap function with additional context object param
 * @param fn target function
 * @param context additional context param
 * @returns wrapped function
 */
export function wrapActionWithContext<T>(
  fn: TypeFunction,
  context: BanqueContext<T>
) {
  function hookAction(...args: any[]) {
    return fn.apply(context, [context, ...args]);
  }

  Object.defineProperty(
    hookAction,
    hookActionKey.toString(),
    { get: () => true },
  );

  return hookAction;
}


/**
 * Wrap proxy to protect object be modified
 * @param obj object to protect
 * @returns proxy object
 */
export function proxyGetter<T extends Record<string, any>>(obj: T): T {
  return new Proxy(obj, {
    get(target: any, key, receiver) {
      const v = Reflect.get(target, key, receiver);
      if (typeof v === 'function' && v[hookActionKey.toString()]) {
        return v;
      }
      return toRef(target, key);
    },
    set() {
      throw Error(setterErrorKey.toString());
    },
  });
}