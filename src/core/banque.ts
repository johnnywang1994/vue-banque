import { readonly, inject, App } from 'vue';
import { VueBanqueOptions, BanqueContext, BanqueModule, BanqueModuleType } from 'types';
import { hookStoreKey, banqueModuleKey } from './symbol';
import { wrapActionWithContext, proxyGetter } from './utils';

class Banque<T> {
  options: VueBanqueOptions;
  rootState: BanqueContext<T>;

  constructor(options: VueBanqueOptions) {
    this.options = options;
    this.rootState = {} as BanqueContext<T>;

    this.initModules();
  }

  initModules(): void {
    const { modules } = this.options;
    if (modules) {
      Object.keys(modules).forEach((moduleName: string) => {
        const rawModule = modules[moduleName];
        if (rawModule) {
          const newModule = this.createModule(rawModule);
          this.bindModule(moduleName, newModule);
        }
      });
    }
  }

  createModule<M extends BanqueModuleType>(rawModule: M): BanqueModule<M> {
    const { rootState } = this;

    const hookModule: any = {};

    Object.defineProperty(hookModule, banqueModuleKey.toString(), {
      get: () => true,
    });

    Object.keys(rawModule).forEach((key) => {
      const resultVal = typeof rawModule[key] === 'function'
        ? wrapActionWithContext<T>(rawModule[key], rootState)
        : rawModule[key];
      hookModule[key] = resultVal;
    });

    return proxyGetter(hookModule);
  }

  bindModule<M extends BanqueModuleType>(moduleName: string, newModule: M): M {
    const { rootState } = this;

    if (newModule[banqueModuleKey.toString()]) {
      Object.defineProperty(rootState, moduleName, {
        get: () => readonly(newModule),
      });
      return (rootState as any)[moduleName] as M;
    }

    return newModule;
  }

  install(app: App): void {
    Object.defineProperty(app.config.globalProperties, '$banque', {
      get: () => this.rootState,
    });
    app.provide(hookStoreKey, this.rootState);
  }

  inject(): BanqueContext<T> {
    return inject(hookStoreKey) as BanqueContext<T>;
  }
}

export default Banque;
