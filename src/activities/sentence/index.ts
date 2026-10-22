/* English: short sentences (read them, match a picture, capital and full stop, word order). Content: data/units/short-sentences.json */
import {defineAsyncComponent as lazy} from 'vue';
import type {ActivityModule} from '@/types';
import {ask,challenge} from './ask';
import {lines} from './speech';

// each step loads when it is first played, so the app starts without every activity's code
export default {ask,challenge,lines,steps:{
  rules:lazy(()=>import('./Rules.vue')),
  cards:lazy(()=>import('./Cards.vue')),
  fix:lazy(()=>import('./FixIt.vue')),
  silly:lazy(()=>import('./Silly.vue'))
}} satisfies ActivityModule;
