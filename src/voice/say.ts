/* Spoken lines that the screens build from quest names; lines.ts lists them for recording. */
export const SAY={
  keepGoing:(quest:string)=>`Keep going with ${quest}, or pick a quest.`,
  opensAfter:(quest:string)=>`This quest opens after ${quest}.`,
  questMap:(quest:string,step:string)=>`${quest}. Tap the glowing stone: ${step}.`,
  questDone:(quest:string)=>`You finished ${quest}! Play any stone again.`,
  bossIntro:(boss:string)=>`Boss battle! Beat ${boss}. Tap Start.`,
  rematchIntro:(boss:string)=>`${boss} is back for a rematch! Tap Start.`,
  bossAsks:(boss:string,q:string)=>`${boss} asks: ${q} Say it out loud first.`,
  bossBeaten:(boss:string)=>`You beat ${boss}! Bonus star: pick one and tell a grown-up how you know.`,
  pop:(q:string)=>`Pop the balloon. ${q}`,
  flip:(prompt:string)=>`${prompt} Tap a card to flip it.`,
  yes:(after:string)=>`Yes! ${after}`
};
