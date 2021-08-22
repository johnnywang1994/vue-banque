import { readonly, inject, App } from 'vue';
import { VueBanqueOptions, BanqueModule, BanqueModuleType, TypeFunction } from 'types';
import { noModuleErrorKey, banqueInjectKey } from './symbol';
import { defaultOptions, definePropertyGetter, isObject, isFunction, proxyGetter, createHookModule, isHookModule } from './utils';

class Banque<T> {
  options: Required<VueBanqueOptions>;
  rootState: T;

  constructor(options: VueBanqueOptions) {
    this.options = this.getOptions(options);
    this.rootState = {} as T;

    this.initModules();
  }

  getOptions(options: VueBanqueOptions): Required<VueBanqueOptions> {
    return Object.assign(defaultOptions, options);
  }

  initModules(): void {
    const { modules } = this.options;
    if (modules) {
      Object.keys(modules).forEach((moduleName: string) => {
        const rawModule = modules[moduleName];
        let newModule: BanqueModuleType | undefined;

        // rawModule allow a factory function or raw object
        if (isObject(rawModule)) {
          newModule = this.createModule(rawModule);
        } else if (isFunction(rawModule)) {
          const rawModuleFn = rawModule as TypeFunction;
          newModule = this.createModule(rawModuleFn());
        }

        if (newModule) {
          this.bindModule(moduleName, newModule);
        }
      });
    } else {
      console.warn(noModuleErrorKey.toString());
    }
  }

  createModule<M extends BanqueModuleType>(rawModule: M): BanqueModule<M> {
    const { rootState, options } = this;

    const hookModule = createHookModule<T, M>(rawModule, rootState);

    return proxyGetter(hookModule, options);
  }

  bindModule<M extends BanqueModuleType>(moduleName: string, newModule: M): M {
    const { rootState } = this;

    if (isHookModule(newModule)) {
      definePropertyGetter(
        rootState,
        moduleName,
        () => readonly(newModule), // protect module from being modified
      )
      return (rootState as any)[moduleName] as M;
    }

    return newModule;
  }

  install(app: App): void {
    const { options } = this;
    definePropertyGetter(
      app.config.globalProperties,
      options.globalName,
      () => this.rootState,
    );
    app.provide(banqueInjectKey, this.rootState);
  }

  inject(): T {
    return inject(banqueInjectKey) as T;
  }
}

export default Banque;
