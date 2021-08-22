const hasSymbol = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

const PolySymbol = (name: string) => 
  hasSymbol
    ? Symbol( '[vue-banque]: ' + name )
    : ( '[vue-banque]: ' ) + name;

export const banqueInjectKey = PolySymbol('vue-banque');

export const noModuleErrorKey = PolySymbol(
  'No banque module was found, at least add one module in `modules` options'
);

export const setterErrorKey = PolySymbol(
  'Modifying property directly from Hook Store is not allowed',
);

export const hookActionKey = PolySymbol('hook-action');

export const banqueModuleKey = PolySymbol('banque-module');
