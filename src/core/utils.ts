import { readonly, toRef } from 'vue';
import { TypeFunction, BanqueModuleType, BanqueModule, VueBanqueOptions } from 'types';
import { hookActionKey, banqueModuleKey, setterErrorKey } from './symbol';


export const defaultOptions = {
  globalName: '$banque',
  autoToRef: true,
  strict: true,
};

export function definePropertyGetter(
  target: any,
  key: string,
  getterFn: TypeFunction
) {
  Object.defineProperty(target, key, {
    get: getterFn,
  });
}

export function isObject(v: any): boolean {
  return v !== null && typeof v === 'object';
}

// includes Async function
export function isFunction(v: any): boolean {
  return typeof v === 'function';
}

export function pipe(...fns: TypeFunction[]) {
  return fns.reduce((prev, next) => {
    return (...args) => next(prev(...args));
  })
}

export function isHookFunction(v: any) {
  return isFunction(v) && v[hookActionKey.toString()];
}

export function isHookModule(v: any) {
  return v[banqueModuleKey.toString()]
}

export function createHookModule<T, M extends BanqueModuleType>(
  rawModule: M,
  rootState: T,
): BanqueModule<M> {
  const hookModule: any = {};

  definePropertyGetter(
    hookModule,
    banqueModuleKey.toString(),
    () => true,
  )

  Object.keys(rawModule).forEach((key) => {
    const resultVal = isFunction(rawModule[key])
      ? wrapActionWithContext<T>(rawModule[key], rootState)
      : rawModule[key];
    hookModule[key] = resultVal;
  });

  return hookModule;
}

/**
 * Wrap function with additional context object param
 * @param fn target function
 * @param context additional context param
 * @returns wrapped function
 */
export function wrapActionWithContext<T>(
  fn: TypeFunction,
  context: T,
) {
  function hookAction(...args: any[]) {
    return fn.apply(context, [context, ...args]);
  }

  definePropertyGetter(
    hookAction,
    hookActionKey.toString(),
    () => true,
  );

  return hookAction;
}


/**
 * Wrap proxy to protect object be modified
 * @param obj object to protect
 * @returns proxy object
 */
export function proxyGetter<T extends Record<string, any>>(
  obj: T,
  options: VueBanqueOptions,
): T {
  const { autoToRef, strict } = options;

  const attachToRef = autoToRef
    ? (target: any, key: string) => toRef(target, key)
    : (target: any, key: string) => target[key];

  const attachReadonly = strict
    ? (v: any) => readonly(v)
    : (v: any) => v;

  const attachFeature = pipe(attachToRef, attachReadonly);

  return new Proxy(obj, {
    get(target: any, key: string, receiver) {
      const v = Reflect.get(target, key, receiver);
      if (isHookFunction(v)) {
        return v;
      }
      return attachFeature(target, key);
    },
    set() {
      console.warn(setterErrorKey.toString());
      return false;
    },
  });
}