/* Heroes, progress and settings for this device, kept in localStorage under the same key as before (hq-v1). */
import {defineStore} from 'pinia';
import {computed,reactive,watch} from 'vue';
import * as L from '@/learn/learner';
import {ITEMS} from '@/art/wear';
import {REWARDS} from '@/rewards';

const load=()=>{try{return JSON.parse(localStorage.getItem(L.KEY)||'null')}catch{return null}};
/* take off any reward item a hero is wearing but hasn't won (old progress once won them all at once) */
const unwear=(st:L.State)=>{
  for(const p of Object.values(st.profiles)){
    const won=new Set(L.itemsWon(p,REWARDS));
    for(const [s,id] of Object.entries(p.kit??{}))if(id&&ITEMS[id]&&!won.has(id))delete p.kit![s as keyof L.Kit];
  }
  return st;
};
const save=(st:L.State)=>{try{localStorage.setItem(L.KEY,JSON.stringify(st))}catch{/* private mode: progress lasts this visit */}};

export const useProgress=defineStore('progress',()=>{
  const st=reactive<L.State>(unwear(L.migrate(load())));
  const cfg=reactive({voice:st.voice??true,voiceName:st.voiceName??'',rate:st.rate??0.9,sfx:st.sfx??true});
  watch(cfg,c=>Object.assign(st,c),{deep:true});
  watch(st,v=>save(v),{deep:true,immediate:true});

  const hero=computed(()=>L.active(st));
  function replace(raw:unknown){
    const next=unwear(L.migrate(raw));
    for(const k of Object.keys(st))delete (st as any)[k];
    Object.assign(st,next);
  }
  return {st,cfg,hero,replace};
});
