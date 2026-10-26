/* Thinking games (one per term session): patterns, odd one out, taller and shorter, shapes, number sequences.
   Rounds come from the unit file (data/units/think-*.json), under the game's step key. */
import {defineAsyncComponent as lazy,defineComponent,h,type PropType} from 'vue';
import type {ActivityModule,Item,Question,UnitApp} from '@/types';
import {lines,seqNums,type Kind} from './rounds';

const Game=lazy(()=>import('./ThinkGame.vue'));
const step=(kind:Kind)=>defineComponent({props:{data:{type:Object as PropType<UnitApp>,required:true}},setup:p=>()=>h(Game,{data:p.data,kind})});

/* a practice or boss question: count on from a, b at a time (b kept to 1, 2, 5 or 10) */
export function ask(it:Item,_help:number):Question{
  const a=Number(it.a??1),b=[1,2,5,10][Number(it.b??2)%4],ns=seqNums({start:a,step:b}),ans=ns[3];
  return {prompt:'What comes next?',say:`${ns.slice(0,3).join(', ')}. What comes next?`,eq:`${ns.slice(0,3).join(', ')}, <span class="q"></span>`,
    answer:String(ans),choices:[],pad:true,after:ns.join(', '),explain:`Each number is ${b} more. ${ns[2]} and ${b} is ${ans}.`};
}
export const challenge=(it:Item,_d:UnitApp,worked:boolean)=>ask(it,worked?1:3);

export default {ask,challenge,lines,steps:{pattern:step('pattern'),odd:step('odd'),taller:step('taller'),shape:step('shape'),seq:step('seq')}} satisfies ActivityModule;
