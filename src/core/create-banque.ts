import { VueBanqueContructor } from 'types';
import Banque from './banque';

/**
 * Create banque for reactive data
 * @param options 
 * @returns 
 */
function createBanque<T>(options: any): VueBanqueContructor<T> {
  const banque = new Banque<T>(options);
  return banque;
}

export default createBanque;
