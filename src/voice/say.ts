/* Spoken lines that the screens build from quest names; lines.ts lists them for recording. */
export const SAY={
  keepGoing:(quest:string)=>`Keep going with ${quest}, or pick a quest.`,
  opensAfter:(quest:string)=>`This quest opens after ${quest}.`,
  questMap:(quest:string,step:string)=>`${quest}. Tap the glowing stone: ${step}.`,
  questDone:(quest:string)=>`You finished ${quest}! Play any stone again.`,
  bossIntro:(boss:string)=>`Boss battle! Beat ${boss}. Tap Start.`,
  rematchIntro:(boss:string)=>`${boss} is back for a rematch! Tap Start.`,
  bossAsks:(boss:string,q:string)=>`${boss} asks: ${q}`,
  bossBeaten:(boss:string)=>`You beat ${boss}! Here is one tricky one for a bonus star.`,
  pop:(q:string)=>`Pop the balloon. ${q}`,
  flip:(prompt:string)=>`${prompt} Tap a card to flip it.`,
  yes:(after:string)=>`Yes! ${after}`,
  // term sessions: the item reveal at the end of a step (item names from src/art/wear.js ITEMS)
  found:(item:string)=>`You found the ${item}!`
};
