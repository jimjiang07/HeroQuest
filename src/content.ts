/* Quests come from data/quests.json; each one's content is a unit file, drawn by the activity module it names. */
import questsFile from '../data/quests.json';
import type {QuestDef,Subject,UnitApp} from '@/types';
import {MODULES} from '@/activities';

const units=import.meta.glob<{app:UnitApp}>('../data/units/*.json',{eager:true,import:'default'});

export const QUESTS:QuestDef[]=questsFile.quests.map(q=>{
  const u=units[`../data/units/${q.unit}.json`];
  if(!u?.app)throw new Error(`Quest unit not found or has no app block: ${q.unit}`);
  const mod=MODULES[u.app.module];
  if(!mod)throw new Error(`Unknown activity module "${u.app.module}" in ${q.unit}`);
  return {id:u.app.id,name:u.app.title,subject:q.subject as Subject,art:q.art,boss:q.boss,map:q.map,needs:q.needs,reward:q.reward as [string,string],data:u.app,mod};
});
export const questById=(id:string)=>QUESTS.find(q=>q.id===id);

/* Wardrobe lines built from gear names and boss names; lines.ts lists them for recording. */
export const GEAR_SAY={
  won:(gear:string)=>`New gear: ${gear}!`,
  locked:(boss:string)=>`Beat ${boss} to win this.`,
  lockedAgain:(boss:string)=>`Beat ${boss} again in a rematch to win this.`,
  on:(gear:string)=>`You put on the ${gear}.`,
  pet:(pet:string)=>`The ${pet} comes along.`,
  place:(place:string)=>`Off to the ${place}!`,
  off:'Nothing there now.',
  later:'Keep playing to win this one.',
  hello:'Dress your hero! Tap a picture to try it on.',
  play:'Drag your hero and pets around. Tap one to make it hop.',
  // what Natasha says when a wardrobe tab is picked
  slot:{head:'Pick a hat.',face:'Pick something for your face.',neck:'Pick something for your neck.',badge:'Pick a badge.',
    outfit:'Pick an outfit.',back:'Pick something for your back.',main:'Pick something for your hand.',off:'Pick something for your other hand.',
    gloves:'Pick some gloves.',feet:'Pick something for your feet.',pet:'Pick a pet.',bg:'Pick a place.'} as Record<string,string>
};
