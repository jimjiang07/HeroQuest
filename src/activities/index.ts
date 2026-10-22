/* Activity modules by the name a unit file uses in "module". */
import type {ActivityModule} from '@/types';
import add10 from './add10';
import groups from './groups';
import blend from './blend';
import heart from './heart';

export const MODULES:Record<string,ActivityModule>={add10,groups,blend,heart};
