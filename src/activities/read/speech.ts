/* lines(): every line the reading steps, practice and spelling can say, built from the unit, for npm run voice. */
import type {UnitApp} from '@/types';
import type {Question} from '@/types';
import {EVERY} from '@/learn/gen';
import {ask,challenge,inferAsk,inferWhy,pageCheck,wordBuild,wordPick} from './ask';
import {bare,pagesOf,questionsOf,tokens,wordsOf} from './story';

const said=(q:Question)=>[q.say,q.after??'',q.explain??''];
/* every word a child can tap on a page, said on its own */
export const tapLines=(d:UnitApp)=>[...new Set(pagesOf(d).flatMap(p=>tokens(p.text).map(bare)).filter(Boolean))].map(w=>`${w}.`);

export function lines(d:UnitApp):string[]{
  const P=d.practice,items=P.levels.flatMap(l=>EVERY[P.gen](l));
  return [d.intro.say,...pagesOf(d).map(p=>p.text),...tapLines(d),
    ...pagesOf(d).flatMap((_,i)=>said(pageCheck(d,i))),
    ...wordsOf(d).flatMap(W=>[...said(wordPick(d,W)),...said(wordBuild(W))]),
    ...questionsOf(d).flatMap(Q=>[...said(inferAsk(Q)),...said(inferWhy(Q))]),
    ...items.flatMap(it=>[1,2,3,4].flatMap(h=>said(ask(it,h,d)))),
    ...items.filter(it=>wordsOf(d).some(W=>W.w===it.w)).flatMap(it=>[false,true].flatMap(w=>said(challenge(it,d,w))))].filter(Boolean);
}
