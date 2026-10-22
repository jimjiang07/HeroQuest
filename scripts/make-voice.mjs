/* Records the app's voice (npm run voice): every sentence the app can say, one clip each, into public/voice/.
   Uses Microsoft's free neural voices through edge-tts, run by uv (brew install uv). Only new or changed sentences are recorded,
   and clips no longer used are deleted. Commit public/voice/ afterwards: the app never calls the voice service itself. */
import {createServer} from 'vite';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const VOICE='en-AU-NatashaNeural',RATE='-5%';
const root=fileURLToPath(new URL('..',import.meta.url)),out=path.join(root,'public/voice'),indexFile=path.join(out,'index.json');

// sentences built from quest content, loaded through Vite so the TypeScript, aliases and JSON imports work
const vite=await createServer({root,configFile:path.join(root,'vite.config.ts'),server:{middlewareMode:true},appType:'custom',logLevel:'error'});
const {questLines}=await vite.ssrLoadModule('/src/voice/lines.ts');
const {sentences,clipId}=await vite.ssrLoadModule('/src/voice/clips.ts');
const lines=questLines();
await vite.close();

// fixed sentences written in the source: any quoted text that starts with a capital and ends like a sentence
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
for(const f of walk(path.join(root,'src')).filter(f=>/\.(vue|ts)$/.test(f)))
  // empty strings ('') must match too, or the scan pairs the wrong quotes and skips the sentence after them
  for(const m of fs.readFileSync(f,'utf8').matchAll(/'([^'\\\n]*)'|"([^"\\\n]*)"|`([^`$\\\n]*)`/g)){
    const t=m[1]??m[2]??m[3];
    if(/^[A-Z][^<>{}=;]*[.!?]$/.test(t))lines.push(t);
  }

const clips=new Map();
for(const s of lines.flatMap(sentences)){
  const id=clipId(s),had=clips.get(id);
  if(had&&had.toLowerCase().replace(/[’‘]/g,"'")!==s.toLowerCase().replace(/[’‘]/g,"'"))throw new Error(`Two sentences share clip ${id}: "${had}" and "${s}"`);
  clips.set(id,s);
}

// what the voice reads: symbols as words (the clip is still named by the sentence as written)
const spoken=s=>s.replace(/ \+ /g,' plus ').replace(/ = /g,' equals ').replace(/ × /g,' times ');

fs.mkdirSync(out,{recursive:true});
const old=fs.existsSync(indexFile)?JSON.parse(fs.readFileSync(indexFile,'utf8')):{};
const same=old.voice===VOICE&&old.rate===RATE;
const todo=[...clips].filter(([id])=>!same||!fs.existsSync(path.join(out,`${id}.mp3`))).map(([id,text])=>({id,text:spoken(text)}));
console.log(`${clips.size} sentences, ${todo.length} to record`);
// --list prints the sentences and stops, to check what would be recorded
if(process.argv.includes('--list')){for(const s of [...clips.values()].sort())console.log(s);process.exit(0)}
if(todo.length){
  const jobs=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'hq-voice-')),'jobs.json');
  fs.writeFileSync(jobs,JSON.stringify(todo));
  execFileSync('uv',['run','--quiet','--with','edge-tts','python','-I',path.join(root,'scripts/voice-render.py'),jobs,out,VOICE,RATE],{stdio:'inherit'});
}
let gone=0;
for(const f of fs.readdirSync(out))if(f.endsWith('.mp3')&&!clips.has(f.slice(0,-4))){fs.unlinkSync(path.join(out,f));gone++}
fs.writeFileSync(indexFile,JSON.stringify({voice:VOICE,rate:RATE,clips:[...clips.keys()].sort()}));
const bytes=fs.readdirSync(out).reduce((n,f)=>n+fs.statSync(path.join(out,f)).size,0);
console.log(`Done: ${clips.size} clips (${(bytes/1e6).toFixed(1)} MB), ${gone} unused removed.`);
