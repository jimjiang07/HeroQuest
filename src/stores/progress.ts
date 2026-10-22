/* Heroes, progress and settings for this device, kept in localStorage under the same key as before (hq-v1). */
import {defineStore} from 'pinia';
import {computed,reactive,watch} from 'vue';
import * as L from '@/learn/learner';

const load=()=>{try{return JSON.parse(localStorage.getItem(L.KEY)||'null')}catch{return null}};
const save=(st:L.State)=>{try{localStorage.setItem(L.KEY,JSON.stringify(st))}catch{/* private mode: progress lasts this visit */}};

export const useProgress=defineStore('progress',()=>{
  const st=reactive<L.State>(L.migrate(load()));
  const cfg=reactive({voice:st.voice??true,voiceName:st.voiceName??'',rate:st.rate??0.9,sfx:st.sfx??true});
  watch(cfg,c=>Object.assign(st,c),{deep:true});
  watch(st,v=>save(v),{deep:true,immediate:true});

  const hero=computed(()=>L.active(st));
  function replace(raw:unknown){
    const next=L.migrate(raw);
    for(const k of Object.keys(st))delete (st as any)[k];
    Object.assign(st,next);
  }
  return {st,cfg,hero,replace};
});
