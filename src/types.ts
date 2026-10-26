/* Shapes shared by content files, activities and screens. */
import type {Component} from 'vue';

export type Subject='maths'|'english';
export type QuestStep='learn'|'help'|'own'|'game'|'challenge'|'boss';

/** one answer button; label may hold HTML (a picture, a highlighted blend) */
export interface Choice{v:string;label?:string;cls?:string;aria?:string}

/** letter tiles: build word from its letters plus a couple of spares; mark = [start, length] of the part to highlight */
export interface Spell{word:string;mark?:[number,number];heart?:boolean}

/** one practice or boss question at one help level, described by an activity's ask() */
export interface Question{
  prompt:string;           // short text on screen
  say:string;              // what the voice reads (must not give the answer away)
  pic?:string;             // HTML picture: help pictures only at help 1–2; from help 3 only what is being asked about (a word to read)
  eq?:string;              // HTML equation with a <span class="q"></span> gap (a number pad fills the gap)
  answer:string;
  choices:Choice[];        // answer buttons; empty when the child types (pad) or builds (spell) the answer
  pad?:boolean;            // maths: the child types the answer on a number pad, so it can't be guessed from options
  spell?:Spell;            // english: the child builds the word from letter tiles
  after?:string;           // plain text shown once answered, e.g. "8 + 5 = 13"
  explain?:string;         // spoken worked example
}

/** a generated practice item: numbers or a word, depending on the generator */
export type Item=Record<string,number|string>;

export interface PracticeSpec{gen:'add10'|'sub10'|'tens'|'bonds'|'groups'|'arrays'|'words';levels:Record<string,unknown>[]}
/** which of the activity's own steps make up "Learn it" and "Game"; question counts for the shared steps */
export interface QuestSpec{learn:string[];game:string[];help?:number;own?:number;challenge?:number;boss?:number}

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
  /** step 5: a different kind of question on the same skill (maths story problems, english spelling); worked = show the help picture */
  challenge(item:Item,data:UnitApp,worked:boolean):Question;
  lines(data:UnitApp):string[];      // every line its own steps can say, for recording the voice
}

export interface QuestDef{
  id:string;name:string;subject:Subject;art:string;
  boss:{name:string;art:string};
  map:{scene:string;path:number[][]};   // path: the 6 stones, Learn it first, as [x%,y%] of a portrait map
  needs:string[];
  reward:string[];                      // gear ids (src/art/rig.js GEAR): for beating the boss, then for winning the rematch; empty for term units
  data:UnitApp;
  mod:ActivityModule;
}
