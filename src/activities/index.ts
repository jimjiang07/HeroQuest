/* Activity modules by the name a unit file uses in "module". */
import type {ActivityModule} from '@/types';
import add10 from './add10';
import groups from './groups';
import blend from './blend';
import heart from './heart';
import sentence from './sentence';
import sub10 from './sub10';
import magice from './magice';
import tens from './tens';

export const MODULES:Record<string,ActivityModule>={add10,groups,blend,heart,sentence,sub10,magice,tens};
