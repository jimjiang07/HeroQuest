/* Number words for tens and ones. Numbers past twenty are read from digits, so the voice says "thirty-four". */
import {nw} from '@/shared';
export const sp=(n:number)=>n<=20?nw(n):String(n);
export const tensW=(t:number)=>`${nw(t)} ${t===1?'ten':'tens'}`;
export const onesW=(o:number)=>`${nw(o)} ${o===1?'one':'ones'}`;
export const tw=(t:number,o:number)=>`${tensW(t)} and ${onesW(o)}`;
/* on screen: "3 tens and 4 ones" */
export const twD=(t:number,o:number)=>`${t} ${t===1?'ten':'tens'} and ${o} ${o===1?'one':'ones'}`;
export const cap=(s:string)=>s[0].toUpperCase()+s.slice(1);
