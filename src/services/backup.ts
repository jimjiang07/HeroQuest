/* Backup code: the whole state as text a grown-up can copy into a note or message and paste back on any device.
   JSON, squeezed with deflate, then base64url, behind a version prefix. Decoding goes through migrate like a saved file. */
import {migrate,type State} from '@/learn/learner';

export const PREFIX='HQ1-';

async function squeeze(bytes:Uint8Array,how:'compress'|'decompress'){
  const s=new Blob([bytes as BlobPart]).stream().pipeThrough(how==='compress'?new CompressionStream('deflate-raw'):new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(s).arrayBuffer());
}
const toB64=(b:Uint8Array)=>{let s='';for(let i=0;i<b.length;i+=0x8000)s+=String.fromCharCode(...b.subarray(i,i+0x8000));
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const fromB64=(t:string)=>Uint8Array.from(atob(t.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));

export async function encodeBackup(st:State):Promise<string>{
  return PREFIX+toB64(await squeeze(new TextEncoder().encode(JSON.stringify(st)),'compress'));
}
/** a pasted code back into a state; throws on anything that is not a Hero Quest code (spaces and line breaks are ignored) */
export async function decodeBackup(code:string):Promise<State>{
  const t=code.replace(/\s+/g,'');
  if(!t.startsWith(PREFIX)||!/^[A-Za-z0-9_-]+$/.test(t.slice(PREFIX.length)))throw new Error('not a backup code');
  const raw=JSON.parse(new TextDecoder().decode(await squeeze(fromB64(t.slice(PREFIX.length)),'decompress')));
  if(!raw||typeof raw!=='object'||!raw.profiles||typeof raw.profiles!=='object')throw new Error('not a backup code');
  return migrate(raw);
}
