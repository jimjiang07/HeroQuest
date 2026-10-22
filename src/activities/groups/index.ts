/* Maths: equal groups and arrays (multiplication as groups and rows). Content: data/units/groups-power-2.json,
   data/units/arrays.json ("picture": "array" draws rows instead of bags),
   data/units/twos-fives-tens.json ("picture": "hops": skip counting on stepping stones). */
import {defineAsyncComponent as lazy} from 'vue';
import type {ActivityModule} from '@/types';
import {ask,challenge} from './ask';
import {lines} from './speech';

// each step loads when it is first played, so the app starts without every activity's code
export default {ask,challenge,lines,steps:{
  read:lazy(()=>import('./ReadFacts.vue')),
  memory:lazy(()=>import('./MatchMemory.vue')),
  bags:lazy(()=>import('./FillBags.vue')),
  build:lazy(()=>import('./BuildArray.vue')),
  same:lazy(()=>import('./TurnAround.vue')),
  hunt:lazy(()=>import('./ArrayHunt.vue')),
  hop:lazy(()=>import('./CountHop.vue'))
}} satisfies ActivityModule;
