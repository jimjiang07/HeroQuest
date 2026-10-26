/* Types for wear.js (the full wardrobe on twelve slots). */
import type {FullKit} from './rig';
export type WearSlot='head'|'face'|'neck'|'badge'|'outfit'|'back'|'main'|'off'|'gloves'|'feet'|'pet'|'bg';
export type ItemSize='small'|'medium'|'big';
export interface ItemDef{id:string;name:string;slot:WearSlot;size:ItemSize;kind?:'thinker'|'land';vb:string}
export type WearKit=FullKit&Partial<Record<WearSlot,string>>;
export const WEAR_SLOTS:WearSlot[];
export const SLOT_NAME:Record<WearSlot,string>;
export const ITEMS:Record<string,ItemDef>;
export const SCENE_VB:string;
export function dressAll(avatar:string,kit?:Partial<Record<WearSlot,string|null>>):WearKit;
export function heroFullBody(kit:WearKit,withScene?:boolean):string;
export function heroFullSvg(kit:WearKit,scene?:boolean):string;
export function itemSvg(id:string):string;
export function wearInfo(id:string):{name:string;slot:WearSlot;size:ItemSize|'boss'}|null;
