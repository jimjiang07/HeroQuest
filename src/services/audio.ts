/* Sound effects, the reading voice and confetti. Settings come from the progress store (saved with the hero data). */
import {ref,type Ref} from 'vue';
import {useProgress} from '@/stores/progress';
import {clipId,sentences} from '@/voice/clips';

let ac:AudioContext|null=null;
export function audio(){
  try{
    if(!ac){const A=window.AudioContext||(window as any).webkitAudioContext;if(A)ac=new A()}
    if(ac&&ac.state==='suspended')ac.resume();
  }catch{/* no audio on this device */}
  unlockPlayer();
  return ac;
}
/* one note; with `to`, its pitch slides from f to `to` */
function tone(f:number,t:number,d:number,type:OscillatorType='sine',v=.16,to?:number){
  if(!useProgress().cfg.sfx)return;const a=audio();if(!a)return;
  const o=a.createOscillator(),g=a.createGain(),s=a.currentTime+t;
  o.type=type;o.frequency.setValueAtTime(f,s);if(to)o.frequency.exponentialRampToValueAtTime(to,s+d);
  g.gain.setValueAtTime(0.0001,s);g.gain.exponentialRampToValueAtTime(v,s+.02);g.gain.exponentialRampToValueAtTime(0.0001,s+d);
  o.connect(g);g.connect(a.destination);o.start(s);o.stop(s+d+.05);
}
export const sfx={
  pop:()=>tone(560,0,.1,'triangle'),
  ding:()=>{tone(784,0,.2);tone(1175,.12,.35)},
  hop:()=>{tone(420,0,.12,'triangle');tone(640,.08,.14,'triangle')},
  oops:()=>{tone(330,0,.18,'sine',.1);tone(262,.14,.25,'sine',.1)},
  cheer:()=>[523,659,784,1047].forEach((f,i)=>tone(f,i*.11,.3,'triangle',.14)),
  // bosses have no voice of their own: a cheeky growl, a zap when hit, a deflating wah-wah when beaten
  growl:()=>{tone(90,0,.28,'sawtooth',.06,150);tone(150,.24,.4,'sawtooth',.06,80)},
  zap:()=>{tone(1200,0,.18,'square',.05,300);tone(220,.15,.22,'triangle',.12,140)},
  defeat:()=>{[392,370,349].forEach((f,i)=>tone(f,i*.3,.26,'sawtooth',.05));tone(330,.9,.7,'sawtooth',.05,220)}
};

/* ---- voice: Australian English, falling back to any English voice ---- */
const synth=typeof window!=='undefined'?window.speechSynthesis:undefined;
export const voices=ref<SpeechSynthesisVoice[]>([]);
// best first: downloaded Premium/Enhanced (or browser neural) voices, then Australian, then other British-style English
const NOVELTY=/^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Junior|Ralph|Kathy|Princess|Deranged|Hysterical|Pipe Organ)\b/i;
export const vRank=(v:SpeechSynthesisVoice)=>(/premium/i.test(v.name)?6:/enhanced|neural|natural|online/i.test(v.name)?4:/siri/i.test(v.name)?3:0)+(v.lang==='en-AU'?2:/en-(GB|NZ|IE)/.test(v.lang)?1:0);
function loadVoices(){if(synth)voices.value=synth.getVoices().filter(v=>/^en/i.test(v.lang)&&!NOVELTY.test(v.name)).sort((a,b)=>vRank(b)-vRank(a))}
if(synth){loadVoices();synth.onvoiceschanged=loadVoices}

/* the device's own voice: used when a grown-up picks one, and for any sentence not recorded */
function speak(text:string,done?:()=>void){
  const cfg=useProgress().cfg;
  if(!synth){if(done)setTimeout(done,300);return}
  try{
    synth.cancel();const u=new SpeechSynthesisUtterance(text);
    const v=voices.value.find(x=>x.name===cfg.voiceName)||voices.value[0];
    if(v){u.voice=v;u.lang=v.lang}else u.lang='en-AU';
    u.rate=cfg.rate;u.pitch=1;if(done)u.onend=()=>done();synth.speak(u);
  }catch{/* speech can fail silently on some browsers */}
}

/* ---- recorded voice: one clip per sentence in public/voice/ (npm run voice) ---- */
export const RECORDED_RATE=0.9;   // the speed slider's default plays clips as recorded
let recorded:Set<string>|null=null;
const ready=typeof window==='undefined'?Promise.resolve():fetch('voice/index.json').then(r=>r.ok?r.json():{clips:[]})
  .then(j=>{recorded=new Set(j.clips)}).catch(()=>{recorded=new Set()});
const player=typeof Audio==='undefined'?null:new Audio();
const urls=new Map<string,Promise<string>>();
// clips load as blobs, all of a line's at once, so sentences follow each other without a gap for the network
function load(id:string){
  let u=urls.get(id);
  if(!u){u=fetch(`voice/${id}.mp3`).then(r=>{if(!r.ok)throw new Error(`voice clip ${id}: ${r.status}`);return r.blob()}).then(b=>URL.createObjectURL(b));
    u.catch(()=>urls.delete(id));urls.set(id,u)}
  return u;
}
// iPhone and iPad only let a page start sound from a tap; one silent play from the first tap opens the player for later lines
let unlocked=false;
function unlockPlayer(){
  if(unlocked||!player||!player.paused)return;unlocked=true;
  const wav=new DataView(new ArrayBuffer(52)),text=(at:number,t:string)=>[...t].forEach((c,i)=>wav.setUint8(at+i,c.charCodeAt(0)));
  text(0,'RIFF');wav.setUint32(4,44,true);text(8,'WAVEfmt ');wav.setUint32(16,16,true);wav.setUint16(20,1,true);wav.setUint16(22,1,true);
  wav.setUint32(24,8000,true);wav.setUint32(28,8000,true);wav.setUint16(32,1,true);wav.setUint16(34,8,true);text(36,'data');wav.setUint32(40,8,true);
  for(let i=44;i<52;i++)wav.setUint8(i,128);
  player.src=URL.createObjectURL(new Blob([wav.buffer],{type:'audio/wav'}));player.play().catch(()=>{unlocked=false});
}
let turn=0;   // each line takes a turn; a line still playing stops once a newer one starts

export function say(text:string,done?:()=>void){
  const cfg=useProgress().cfg,my=++turn;
  player?.pause();synth?.cancel();
  if(!cfg.voice||!text){if(done)setTimeout(done,300);return}
  if(cfg.voiceName||!player){speak(text,done);return}
  const parts=sentences(text);
  void ready.then(async()=>{
    if(my!==turn)return;
    const ids=parts.map(clipId),missing=parts.filter((_,i)=>!recorded!.has(ids[i]));
    if(missing.length){if(recorded!.size)console.warn('[voice] not recorded, run npm run voice:',missing.join(' | '));speak(text,done);return}
    let srcs:string[];
    try{srcs=await Promise.all(ids.map(load))}catch{if(my===turn)speak(text,done);return}   // offline: the device voice still works
    for(const src of srcs){
      if(my!==turn)return;
      player.src=src;player.defaultPlaybackRate=player.playbackRate=cfg.rate/RECORDED_RATE;
      const ended=new Promise<void>(res=>{player.onended=()=>res();player.onerror=()=>res()});
      try{await player.play()}catch{return}   // autoplay blocked before the first tap, or a newer line took over
      await ended;await sleep(120);
    }
    if(my===turn)done?.();
  });
}
export const hush=()=>{turn++;player?.pause();synth?.cancel()};

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
