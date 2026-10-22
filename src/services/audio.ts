/* Sound effects, the reading voice and confetti. Settings come from the progress store (saved with the hero data). */
import {ref,type Ref} from 'vue';
import {useProgress} from '@/stores/progress';

let ac:AudioContext|null=null;
export function audio(){
  try{
    if(!ac){const A=window.AudioContext||(window as any).webkitAudioContext;if(A)ac=new A()}
    if(ac&&ac.state==='suspended')ac.resume();
  }catch{/* no audio on this device */}
  return ac;
}
function tone(f:number,t:number,d:number,type:OscillatorType='sine',v=.16){
  if(!useProgress().cfg.sfx)return;const a=audio();if(!a)return;
  const o=a.createOscillator(),g=a.createGain(),s=a.currentTime+t;
  o.type=type;o.frequency.setValueAtTime(f,s);
  g.gain.setValueAtTime(0.0001,s);g.gain.exponentialRampToValueAtTime(v,s+.02);g.gain.exponentialRampToValueAtTime(0.0001,s+d);
  o.connect(g);g.connect(a.destination);o.start(s);o.stop(s+d+.05);
}
export const sfx={
  pop:()=>tone(560,0,.1,'triangle'),
  ding:()=>{tone(784,0,.2);tone(1175,.12,.35)},
  hop:()=>{tone(420,0,.12,'triangle');tone(640,.08,.14,'triangle')},
  oops:()=>{tone(330,0,.18,'sine',.1);tone(262,.14,.25,'sine',.1)},
  cheer:()=>[523,659,784,1047].forEach((f,i)=>tone(f,i*.11,.3,'triangle',.14))
};

/* ---- voice: Australian English, falling back to any English voice ---- */
const synth=typeof window!=='undefined'?window.speechSynthesis:undefined;
export const voices=ref<SpeechSynthesisVoice[]>([]);
// best first: downloaded Premium/Enhanced (or browser neural) voices, then Australian, then other British-style English
const NOVELTY=/^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Junior|Ralph|Kathy|Princess|Deranged|Hysterical|Pipe Organ)\b/i;
export const vRank=(v:SpeechSynthesisVoice)=>(/premium/i.test(v.name)?6:/enhanced|neural|natural|online/i.test(v.name)?4:/siri/i.test(v.name)?3:0)+(v.lang==='en-AU'?2:/en-(GB|NZ|IE)/.test(v.lang)?1:0);
function loadVoices(){if(synth)voices.value=synth.getVoices().filter(v=>/^en/i.test(v.lang)&&!NOVELTY.test(v.name)).sort((a,b)=>vRank(b)-vRank(a))}
if(synth){loadVoices();synth.onvoiceschanged=loadVoices}

export function say(text:string,done?:()=>void){
  const cfg=useProgress().cfg;
  if(!synth||!cfg.voice||!text){if(done)setTimeout(done,300);return}
  try{
    synth.cancel();const u=new SpeechSynthesisUtterance(text);
    const v=voices.value.find(x=>x.name===cfg.voiceName)||voices.value[0];
    if(v){u.voice=v;u.lang=v.lang}else u.lang='en-AU';
    u.rate=cfg.rate;u.pitch=1;if(done)u.onend=()=>done();synth.speak(u);
  }catch{/* speech can fail silently on some browsers */}
}
export const hush=()=>synth?.cancel();

export const sleep=(ms:number)=>new Promise<void>(r=>setTimeout(r,ms));

export function confetti(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const box=document.createElement('div');box.className='conf';
  const cols=['#f4b400','#d6402b','#2f9e44','#5b4bc4','#ff922b','#0c8599'];
  for(let i=0;i<46;i++){const p=document.createElement('i');p.style.left=Math.random()*100+'%';p.style.background=cols[i%6];
    p.style.animationDuration=(2+Math.random()*2)+'s';p.style.animationDelay=(Math.random()*.6)+'s';box.appendChild(p)}
  document.body.appendChild(box);setTimeout(()=>box.remove(),5200);
}

export function shake(el:Element|null){if(!el)return;el.classList.remove('no');void (el as HTMLElement).offsetWidth;el.classList.add('no');sfx.oops()}
/* the one wrong-answer reaction: a gentle shake and "Try again!". Never a buzzer, never lost points. */
export function tryAgain(el:Element|null|EventTarget,msg?:Ref<string>,text='Try again!'){shake(el as Element);if(msg)msg.value=text;say(text)}
