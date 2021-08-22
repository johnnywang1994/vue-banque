export type TypeFunction = (...any: any[]) => any;

export type ParseModuleType<T> = T extends TypeFunction ? ReturnType<T> : T;

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
  [K in keyof T]: BanqueModule<ParseModuleType<T[K]>>;
}

export interface VueBanqueOptions {
  modules: Record<string, object | TypeFunction>;
  globalName?: string;
  autoToRef?: boolean;
  strict?: boolean;
}

export interface VueBanqueContructor<T> {
  options: VueBanqueOptions;
  rootState: T;

  initModules(): void;
  createModule<M>(rawModule: any): BanqueModule<M>;
  bindModule<K extends BanqueModule>(moduleName: string, newModule: K): K;

  // expose vue api
  install(app: App): void;
  inject(): T;
}

export function createBanque<T>(options: VueBanqueOptions): VueBanqueContructor<T>;