/* Every sentence the app can say that is built from quest content, for `npm run voice` to record.
   Fixed sentences written in the source are found by the script itself, so they need no list here. */
import {QUESTS} from '@/content';
import {EVERY} from '@/learn/gen';
import {QUEST_STEPS,STEP_NAME} from '@/learn/learner';
import {SAY} from './say';
import {sentences} from './clips';

export function questLines():string[]{
  // shared prompts wrap other lines; split into sentences, only their fixed part is new
  const out:string[]=[SAY.pop(''),SAY.flip(''),SAY.yes(''),SAY.opensAfter('another quest')];
  for(const Q of QUESTS){
    const boss=Q.boss.name,d=Q.data;
    out.push(SAY.keepGoing(Q.name),SAY.opensAfter(Q.name),SAY.questDone(Q.name),d.intro.say,
      SAY.bossIntro(boss),SAY.rematchIntro(boss),SAY.bossBeaten(boss),...QUEST_STEPS.map(s=>SAY.questMap(Q.name,STEP_NAME[s])));
    // practice and boss: every item at every difficulty and help level
    for(const it of d.practice.levels.flatMap(l=>EVERY[d.practice.gen](l)))
      for(let h=0;h<=4;h++){const q=Q.mod.ask(it,h,d);out.push(q.say,SAY.bossAsks(boss,q.say),q.after??'',q.explain??'')}
    out.push(...Q.mod.lines(d));
  }
  return out;
}

export const uniqueSentences=(lines:string[])=>[...new Set(lines.flatMap(sentences))];
