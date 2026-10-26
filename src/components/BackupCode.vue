<script setup lang="ts">
/* For grown-ups: copy the whole device's progress as a backup code, or paste one back. Restoring asks twice. */
import {ref,shallowRef} from 'vue';
import {useProgress} from '@/stores/progress';
import {decodeBackup,encodeBackup} from '@/services/backup';
import type {State} from '@/learn/learner';

const P=useProgress();
const code=ref(''),copied=ref(false),pasting=ref(false),input=ref(''),msg=ref(''),bad=ref(false);
const ready=shallowRef<State|null>(null);

async function copy(){
  code.value=await encodeBackup(JSON.parse(JSON.stringify(P.st)));copied.value=false;
  try{await navigator.clipboard.writeText(code.value);copied.value=true}catch{/* no clipboard: the code shows in the box to copy by hand */}
}
const pick=(e:Event)=>(e.target as HTMLTextAreaElement).select();
function edited(){ready.value=null;msg.value='';bad.value=false}
const toggle=()=>{pasting.value=!pasting.value;edited()};
async function restore(){
  if(ready.value){P.replace(ready.value);ready.value=null;input.value='';msg.value='Progress restored.';bad.value=false;return}
  try{const st=await decodeBackup(input.value);ready.value=st;bad.value=false;
    const n=Object.keys(st.profiles).length;
    msg.value=`This code has ${n} ${n===1?'hero':'heroes'}. It will replace the progress on this device. Tap Restore again to go ahead.`}
  catch{ready.value=null;bad.value=true;msg.value='That is not a Hero Quest backup code. Check it was copied in full, starting with HQ1-.'}
}
</script>

<template>
  <div class="bcode">
    <div class="row">
      <button class="btn alt" data-b="copy" @click="copy">Copy backup code</button>
      <button class="btn alt" data-b="paste" :aria-expanded="pasting" @click="toggle">Paste a code</button>
    </div>
    <div v-if="code" class="bc-box">
      <p>{{ copied?'Copied. Keep it somewhere safe, like a note or a message to yourself.':'Copy this code and keep it somewhere safe.' }}</p>
      <textarea class="bc-out" readonly rows="3" :value="code" aria-label="Backup code" @focus="pick" @click="pick"></textarea>
    </div>
    <div v-if="pasting" class="bc-box">
      <textarea v-model="input" class="bc-in" rows="3" placeholder="Paste the code here" aria-label="Paste a backup code" @input="edited"></textarea>
      <button class="btn" data-b="restore" :disabled="!input.trim()" @click="restore">{{ ready?'Restore: yes, replace':'Restore' }}</button>
    </div>
    <p v-if="msg" class="bc-msg" :class="{bad}" role="status">{{ msg }}</p>
  </div>
</template>

<style scoped>
.bcode{display:flex;flex-direction:column;gap:10px}
.row{display:flex;flex-wrap:wrap;gap:10px}
.bc-box{display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.bc-box p,.bc-msg{margin:0;font-size:17px;line-height:1.35}
textarea{width:100%;font:15px/1.3 ui-monospace,Menlo,monospace;padding:8px;border:3px solid var(--ink);border-radius:12px;background:var(--card);color:var(--ink);word-break:break-all;resize:vertical}
.bc-msg.bad{color:var(--c);font-weight:600}
</style>
