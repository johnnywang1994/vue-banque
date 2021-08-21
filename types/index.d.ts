export type TypeFunction = (...any: any[]) => any;

export type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never;

export type DropFirstFunction<T> = {
  (...args: DropFirst<Parameters<T>>): ReturnType<T>;
}

export type BanqueModuleType = {
  [key: string]: any;
}

export type BanqueModule<M> = {
  [K in keyof M]: M[K] extends TypeFunction
    ? DropFirstFunction<M[K]>
    : M[K];
}

export type BanqueContext<T> = {
  [K in keyof T]: T[K];
}

export interface VueBanqueOptions {
  modules: Record<string, object>;
}

export interface VueBanqueContructor<T> {
  options: VueBanqueOptions;
  rootState: BanqueContext<T>;

  initModules(): void;
  createModule<M>(rawModule: any): BanqueModule<M>;
  bindModule<K extends BanqueModule>(moduleName: string, newModule: K): K;

  // expose vue api
  install(app: App): void;
  inject(): BanqueContext<T>;
}

export function createBanque<T>(options: VueBanqueOptions): VueBanqueContructor<T>;