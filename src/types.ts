/* Shapes shared by content files, activities and screens. */
import type {Component} from 'vue';

export type Subject='maths'|'english';
export type QuestStep='learn'|'help'|'own'|'game'|'paper'|'boss';

/** one answer button; label may hold HTML (a picture, a highlighted blend) */
export interface Choice{v:string;label?:string;cls?:string;aria?:string}

/** one practice or boss question at one help level, described by an activity's ask() */
export interface Question{
  prompt:string;           // short text on screen
  say:string;              // what the voice reads (must not give the answer away)
  pic?:string;             // HTML picture: help pictures only at help 1–2; from help 3 only what is being asked about (a word to read)
  eq?:string;              // HTML equation with a <span class="q"></span> gap
  answer:string;
  choices:Choice[];
  after?:string;           // plain text shown once answered, e.g. "8 + 5 = 13"
  explain?:string;         // spoken worked example
}

/** a generated practice item: numbers or a word, depending on the generator */
export type Item=Record<string,number|string>;

export interface PracticeSpec{gen:'add10'|'groups'|'arrays'|'words';levels:Record<string,unknown>[]}
/** which of the activity's own steps make up "Learn it" and "Game"; question counts for the shared steps */
export interface QuestSpec{learn:string[];game:string[];help?:number;own?:number;boss?:number}

/** a unit file's "app" block; each activity reads its own extra keys from it */
export interface UnitApp{
  id:string;               // progress key: never rename
  module:string;
  title:string;
  intro:{title:string;say:string};
  practice:PracticeSpec;
  quest:QuestSpec;
  [key:string]:unknown;
}

/** what an activity module provides */
export interface ActivityModule{
  steps:Record<string,Component>;   // the activity's own steps, by key; each gets prop data: UnitApp
  ask(item:Item,help:number,data:UnitApp):Question;
}

export interface QuestDef{
  id:string;name:string;subject:Subject;art:string;
  boss:{name:string;emoji:string};
  needs:string[];
  data:UnitApp;
  mod:ActivityModule;
}
