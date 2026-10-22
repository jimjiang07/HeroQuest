/* Maths: equal groups and arrays (multiplication as groups and rows). Content: data/units/groups-power-2.json,
   data/units/arrays.json ("picture": "array" draws rows instead of bags). */
import {defineAsyncComponent as lazy} from 'vue';
import type {ActivityModule} from '@/types';
import {ask} from './ask';
import {lines} from './speech';

// each step loads when it is first played, so the app starts without every activity's code
export default {ask,lines,steps:{
  read:lazy(()=>import('./ReadFacts.vue')),
  memory:lazy(()=>import('./MatchMemory.vue')),
  balloon:lazy(()=>import('./GroupsBalloon.vue')),
  build:lazy(()=>import('./BuildArray.vue')),
  same:lazy(()=>import('./TurnAround.vue'))
}} satisfies ActivityModule;
