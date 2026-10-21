import {$,$$,say,sfx,audio,sleep,dot,frameHTML,miniFrame,confetti,setOK,setPrompt,readTicks,shuffle,NUMW,EMO,hlw,cfg} from '../engine.js';

/* Maths activity: Jump Through 10 (add through ten). Content comes from a unit's "app" block (e.g. data/units/jump-through-10.json).
   Optional blocks split/think/bigger/boss add extra steps only when present. */
export default function make(data){
  const RM={};
  const nw=n=>NUMW[n]??String(n);
  const sf=n=>`<div class="frame" id="fr">${Array.from({length:10},(_,i)=>`<div class="cell">${i<n?dot('red'):''}</div>`).join('')}</div>`;
  const xs=b=>`<div class="extras" id="ex">${Array.from({length:b},()=>`<div class="xs">${dot('or')}</div>`).join('')}</div>`;
  const rods=t=>Array.from({length:t},()=>`<div class="rod" aria-hidden="true"><div class="bar">${'<i></i>'.repeat(10)}</div><b>10</b></div>`).join('');
  const shake=b=>{b.classList.remove('no');void b.offsetWidth;b.classList.add('no');sfx.oops();$('#msg').textContent='Try again!';say('Try again!')};
  const nextOr=(last,fn)=>{if(last)setOK();else{$('#act').innerHTML=`<button class="btn red" id="more">One more ›</button>`;$('#more').onclick=fn}};
  // counters hop from the extras into the empty cells of the frame
  const fillTen=async o=>{const cells=$$('#fr .cell');for(let i=o;i<10;i++){$('#ex').lastElementChild?.remove();cells[i].innerHTML=dot('gd pop');sfx.hop();await sleep(260)}};
  RM.fill=el=>{
    const rounds=data.fill.rounds;let r=0;
    const draw=()=>{
      const n=rounds[r];
      el.innerHTML=`<div class="prompt">How many more make 10? Tap the empty spaces.</div>${frameHTML(n)}
        <div class="eq" id="eq">${n} + <span class="q"></span> = 10</div><div class="msg" id="msg"></div><div class="row" id="act"></div>`;
      let empties=10-n;
      $$('.cell.empty',el).forEach(c=>c.onclick=()=>{
        audio();c.outerHTML=`<div class="cell">${dot('gd pop')}</div>`;sfx.pop();empties--;
        if(empties===0){
          sfx.ding();$('#eq').textContent=`${n} + ${10-n} = 10`;$('#msg').textContent=`${n} and ${10-n} make 10!`;say(`${n} and ${10-n} make 10!`);
          if(r<rounds.length-1){$('#act').innerHTML=`<button class="btn red" id="more">One more ›</button>`;$('#more').onclick=()=>{r++;draw()}}
          else setOK();
        }
      });
      setPrompt('How many more make ten? Tap the empty spaces.');
    };
    draw();
  };
  RM.trick=el=>{
    const {a,b}=data.trick,gap=10-a,left=b-gap;
    el.innerHTML=`<div class="prompt">Secret trick: fill the 10 first!</div>
      <div class="scene" id="scene">
        <div class="frame" id="tf">${Array.from({length:10},(_,i)=>`<div class="cell" data-i="${i}">${i<a?dot('red'):''}</div>`).join('')}</div>
        <div class="extras" id="ex">${Array.from({length:b},()=>`<div class="xs">${dot('or')}</div>`).join('')}</div>
      </div>
      <div class="eq" id="teq">${a} + ${b}</div><div class="msg" id="msg">We have ${a} and ${b}.</div>
      <div class="row"><button class="btn red" id="hop">Hop!</button><button class="btn alt" id="cnt" disabled>Count</button></div>`;
    setPrompt(`${NUMW[a]} plus ${NUMW[b]}. Tap Hop, and the counters jump in to fill the ten.`);
    let hopped=false;
    $('#hop').onclick=async()=>{
      if(hopped)return;hopped=true;audio();$('#hop').disabled=true;
      for(let k=0;k<gap;k++){
        const scene=$('#scene'),ex=$('#ex'),target=$$('#tf .cell')[a+k];
        const src=ex.lastElementChild,sd=$('.dot',src);
        const sc=scene.getBoundingClientRect(),r1=sd.getBoundingClientRect(),r2=target.getBoundingClientRect();
        const fly=document.createElement('span');fly.className='dot or fly';
        fly.style.width=r1.width+'px';fly.style.height=r1.height+'px';fly.style.left=(r1.left-sc.left)+'px';fly.style.top=(r1.top-sc.top)+'px';
        scene.appendChild(fly);sd.style.visibility='hidden';sfx.hop();
        await sleep(30);
        fly.style.left=(r2.left-sc.left+(r2.width-r1.width)/2)+'px';fly.style.top=(r2.top-sc.top+(r2.height-r1.height)/2)+'px';
        await sleep(800);
        fly.remove();src.remove();target.innerHTML=dot('gd pop');sfx.ding();
      }
      $('#teq').textContent=`10 + ${left}`;$('#msg').textContent=`Now it’s ten and ${left}!`;
      say(`${NUMW[gap]} ${gap===1?'hops':'hop'} in. Now we have ten, and ${NUMW[left]} more.`);$('#cnt').disabled=false;
    };
    $('#cnt').onclick=async()=>{
      if($('#cnt').disabled)return;$('#cnt').disabled=true;audio();
      say(NUMW.slice(10,a+b+1).join(', ')+'!');
      $$('#tf .dot').forEach(d=>d.classList.add('lit'));sfx.pop();await sleep(900);
      for(const x of $$('#ex .dot')){x.classList.add('lit');sfx.pop();await sleep(620)}
      $('#teq').textContent=`${a} + ${b} = ${a+b}`;$('#msg').textContent=`${a} + ${b} = ${a+b}!`;sfx.cheer();confetti();setOK();
    };
  };
  RM.read=el=>{
    const P=data.read.pairs;
    el.innerHTML=`<div class="prompt">Tap 🔊 to hear a card. Say it too, then tick it!</div>
      <div class="cards">${P.map(([a,b],i)=>`<div class="rc" id="rc${i}">
        <button class="pic" data-i="${i}" aria-label="Hear ${a} plus ${b}">${miniFrame(a,b)}<span class="sum">${a} + ${b} = <b>${a+b}</b></span></button>
        <div class="acts"><button class="hr" data-i="${i}" aria-label="Hear ${a} plus ${b}">🔊</button><button class="tick" data-i="${i}" aria-label="Tick ${a} plus ${b}">✓</button></div></div>`).join('')}</div>`;
    setPrompt('Tap the speaker to hear a card. Say it too, then tick it.');
    const heard=readTicks(el,P.length,'You read them all! Great reading!');
    $$('.pic,.hr',el).forEach(b=>b.onclick=()=>{audio();const i=+b.dataset.i,[x,y]=P[i];sfx.pop();say(`${x} plus ${y} equals ${x+y}`);heard(i)});
  };
  RM.easy=el=>{
    const Q=data.easy.questions;let q=0;
    const draw=()=>{
      const [x,y,right,big,small]=Q[q];
      el.innerHTML=`<div class="prompt">Which one is easier? Tap it.</div>
        <div class="choices"><button class="ch" data-k="0">${x}</button><button class="ch" data-k="1">${y}</button></div>
        <div class="msg" id="msg"></div><div class="row" id="act"></div>`;
      setPrompt('Which one is easier? Tap it.');
      $$('.ch',el).forEach(b=>b.onclick=()=>{
        audio();
        if(+b.dataset.k===right){
          b.classList.add('right');sfx.ding();$('#msg').textContent=`Yes! Start with the big number: ${big}, then count on ${small}.`;
          say(`Yes! Start with the big number. ${big}, then count on ${small}.`);$$('.ch',el).forEach(c=>c.disabled=true);
          if(q<Q.length-1){$('#act').innerHTML=`<button class="btn red" id="more">One more ›</button>`;$('#more').onclick=()=>{q++;draw()}}else setOK();
        }else{b.classList.remove('no');void b.offsetWidth;b.classList.add('no');sfx.oops();$('#msg').textContent='Hmm, try the other one.';say('Hmm, try the other one.')}
      });
    };
    draw();
  };
  RM.make=el=>{
    const Q=data.make.questions;let q=0;
    const draw=()=>{
      const [n,ch,right]=Q[q];
      el.innerHTML=`<div class="prompt">What makes 10? Tap the number.</div>
        <div class="frame" id="fr">${Array.from({length:10},(_,i)=>`<div class="cell">${i<n?dot('red'):''}</div>`).join('')}</div>
        <div class="eq" id="eq">${n} + <span class="q"></span> = 10</div>
        <div class="choices">${ch.map(c=>`<button class="ch" data-v="${c}">${c}</button>`).join('')}</div>
        <div class="msg" id="msg"></div><div class="row" id="act"></div>`;
      setPrompt(`${n} plus how many makes ten? Tap the number.`);
      $$('.ch',el).forEach(b=>b.onclick=async()=>{
        audio();
        if(+b.dataset.v===right){
          b.classList.add('right');$$('.ch',el).forEach(c=>c.disabled=true);
          const cells=$$('#fr .cell');for(let i=n;i<10;i++){cells[i].innerHTML=dot('gd pop');sfx.pop();await sleep(160)}
          sfx.ding();$('#eq').textContent=`${n} + ${right} = 10`;$('#msg').textContent=`${n} and ${right} make 10!`;say(`${n} and ${right} make ten!`);
          if(q<Q.length-1){$('#act').innerHTML=`<button class="btn red" id="more">One more ›</button>`;$('#more').onclick=()=>{q++;draw()}}else setOK();
        }else{b.classList.remove('no');void b.offsetWidth;b.classList.add('no');sfx.oops();$('#msg').textContent='Try again!';say('Try again!')}
      });
    };
    draw();
  };
  RM.memory=el=>{
    const vals=shuffle(data.memory.values);let open=[],matched=new Set(),lock=false;
    el.innerHTML=`<div class="prompt">Game: find two cards that make 10!</div>
      <div class="mem${vals.length===12?' m6':''}" id="mem">${vals.map((v,i)=>`<button class="mc" data-i="${i}" aria-label="Card ${i+1}"><span class="back">?</span><span class="front"><b>${v}</b><i>${'●'.repeat(v)}</i></span></button>`).join('')}</div>
      <div class="msg" id="msg">Tap a card to flip it.</div>`;
    setPrompt('Game: find two cards that make ten. Tap a card to flip it.');
    const cards=$$('.mc',el);
    cards.forEach(b=>b.onclick=async()=>{
      const i=+b.dataset.i;if(lock||open.includes(i)||matched.has(i))return;
      audio();b.classList.add('up');sfx.pop();say(NUMW[vals[i]]);open.push(i);
      if(open.length===2){
        lock=true;const [x,y]=open,sum=vals[x]+vals[y];await sleep(950);
        if(sum===10){
          matched.add(x);matched.add(y);cards[x].classList.add('ok');cards[y].classList.add('ok');sfx.ding();
          $('#msg').textContent=`${vals[x]} and ${vals[y]} make 10!`;say(`${vals[x]} and ${vals[y]} make ten!`);
        }else{
          cards[x].classList.remove('up');cards[y].classList.remove('up');sfx.oops();
          $('#msg').textContent=`${vals[x]} + ${vals[y]} = ${sum}. Not 10. Try again!`;say('Not ten. Try again!');
        }
        open=[];lock=false;
        if(matched.size===vals.length){await sleep(900);sfx.cheer();confetti();say('You found them all! Brilliant!');setOK()}
      }
    });
  };
  RM.balloon=el=>{
    const Rn=data.balloon.rounds;let r=0;
    const colors=['#d6402b','#e8890c','#2f9e44','#5b4bc4','#0c8599','#c2255c'];
    const draw=()=>{
      const [a,b]=Rn[r],ans=a+b,opts=shuffle([ans-1,ans,ans+1,ans+2]);
      el.innerHTML=`<div class="stars" id="stars" aria-label="${r} of ${Rn.length} popped">${Rn.map((_,i)=>i<r?'⭐':'☆').join('')}</div>
        <div class="prompt">Game: pop the balloon. <b>${a} + ${b}</b> = ?</div>
        <div class="balloons">${opts.map((o,k)=>`<button class="bln" data-v="${o}" style="--col:${colors[(k+r)%6]};animation-delay:${k*.45}s">${o}</button>`).join('')}</div>
        <div class="msg" id="msg"></div>
        <div class="row"><button class="btn alt" id="hint">💡 Hint</button></div><div class="hintbox" id="hb"></div>`;
      setPrompt(`Pop the balloon. ${a} plus ${b} equals what?`);
      $('#hint').onclick=()=>{
        audio();const need=10-a,left=b-need;
        $('#hb').innerHTML=miniFrame(a,b);
        say(`Fill the ten first! ${a} needs ${need} more. Take ${need} from ${b}. ${left} is left. Ten and ${left} is ${ans}.`);
      };
      $$('.bln',el).forEach(bl=>bl.onclick=async()=>{
        audio();
        if(+bl.dataset.v===ans){
          $$('.bln',el).forEach(x=>x.disabled=true);bl.classList.add('pop');sfx.pop();sfx.ding();
          $('#msg').textContent=`${a} + ${b} = ${ans}!`;say(`${a} plus ${b} equals ${ans}!`);
          await sleep(1700);r++;
          if(r<Rn.length)draw();else{$('#stars').textContent='⭐'.repeat(Rn.length);sfx.cheer();confetti();say('You popped them all!');setOK()}
        }else{bl.classList.remove('no');void bl.offsetWidth;bl.classList.add('no');sfx.oops();$('#msg').textContent='Try again!';say('Try again!')}
      });
    };
    draw();
  };

  RM.split=el=>{
    const {questions:Q,help=1}=data.split;let q=0;
    const draw=()=>{
      const [a,b]=Q[q],gap=10-a,left=b-gap,h=q<help;
      const opts=shuffle([[gap,left],...[gap+1,gap-1,gap+2,gap-2].filter(k=>k>0&&k<b).slice(0,2).map(k=>[k,b-k])]);
      el.innerHTML=`<div class="prompt">Break the ${b} to make 10. Which way?</div>
        <div class="scene${h?' helped':''}">${sf(a)}${xs(b)}</div>
        <div class="eq" id="eq">${a} + ${b}</div>
        <div class="choices">${opts.map(([x,y])=>`<button class="ch" data-v="${x}" aria-label="${x} and ${y}">${x} + ${y}</button>`).join('')}</div>
        <div class="msg" id="msg">${h?`${a} needs ${gap} more to make 10.`:''}</div><div class="row" id="act"></div>`;
      setPrompt(`${nw(a)} plus ${nw(b)}. Break the ${nw(b)} to make ten. Which way?`);
      $$('.ch',el).forEach(c=>c.onclick=async()=>{
        audio();if(+c.dataset.v!==gap)return shake(c);
        c.classList.add('right');$$('.ch',el).forEach(x=>x.disabled=true);
        $('#eq').textContent=`${a} + ${gap} + ${left}`;await fillTen(a);
        sfx.ding();$('#eq').textContent=`10 + ${left} = ${a+b}`;$('#msg').textContent=`${a} + ${b} = ${a+b}!`;
        say(`${nw(a)} and ${nw(gap)} make ten. Ten and ${nw(left)} is ${nw(a+b)}.`);
        nextOr(q===Q.length-1,()=>{q++;draw()});
      });
    };
    draw();
  };
  RM.think=el=>{
    const Q=data.think.questions;let q=0;
    const draw=()=>{
      const [a,b]=Q[q],ans=a+b,need=10-a,opts=shuffle([ans-1,ans,ans+1]);
      el.innerHTML=`<div class="prompt">No picture this time. Think it!</div>
        <div class="eq" id="eq">${a} + ${b} = <span class="q"></span></div>
        <div class="choices">${opts.map(o=>`<button class="ch" data-v="${o}">${o}</button>`).join('')}</div>
        <div class="msg" id="msg"></div><div class="row" id="act"><button class="btn alt" id="hint">💡 Show me</button></div><div class="hintbox" id="hb"></div>`;
      setPrompt(`${nw(a)} plus ${nw(b)}. Think it, then tap the answer.`);
      $('#hint').onclick=()=>{audio();$('#hb').innerHTML=miniFrame(a,b);say(`${nw(a)} needs ${nw(need)} more to make ten. Then ${nw(b-need)} more.`)};
      $$('.ch',el).forEach(c=>c.onclick=()=>{
        audio();if(+c.dataset.v!==ans)return shake(c);
        c.classList.add('right');$$('.ch',el).forEach(x=>x.disabled=true);sfx.ding();
        $('#eq').textContent=`${a} + ${b} = ${ans}`;$('#msg').textContent='You thought it!';say(`Yes! ${nw(a)} plus ${nw(b)} is ${nw(ans)}.`);
        nextOr(q===Q.length-1,()=>{q++;draw()});
      });
    };
    draw();
  };
  RM.bigger=el=>{
    const {questions:Q,help=2}=data.bigger;let q=0;
    const draw=()=>{
      const [a,b]=Q[q],t=Math.floor(a/10),o=a%10,gap=10-o,next=(t+1)*10,left=b-gap,ans=a+b,h=q<help,opts=shuffle([ans-1,ans,ans+1]);
      el.innerHTML=`<div class="prompt">Same trick, bigger numbers!</div>
        <div class="scene big2${h?' helped':''}">${rods(t)}${sf(o)}${xs(b)}</div>
        <div class="eq" id="eq">${a} + ${b} = <span class="q"></span></div>
        <div class="choices">${opts.map(v=>`<button class="ch" data-v="${v}">${v}</button>`).join('')}</div>
        <div class="msg" id="msg">${h?`${a} needs ${gap} more to make ${next}.`:''}</div><div class="row" id="act"></div>`;
      setPrompt(`${nw(a)} plus ${nw(b)}. Jump to ${nw(next)} first.`);
      $$('.ch',el).forEach(c=>c.onclick=async()=>{
        audio();if(+c.dataset.v!==ans)return shake(c);
        c.classList.add('right');$$('.ch',el).forEach(x=>x.disabled=true);await fillTen(o);
        sfx.ding();$('#eq').textContent=`${next} + ${left} = ${ans}`;$('#msg').textContent=`${a} + ${b} = ${ans}!`;
        say(`${nw(a)} and ${nw(gap)} make ${nw(next)}. ${nw(next)} and ${nw(left)} is ${nw(ans)}.`);
        nextOr(q===Q.length-1,()=>{q++;draw()});
      });
    };
    draw();
  };
  RM.boss=el=>{
    const {name,emoji,questions:Q}=data.boss;let q=0;
    const hearts=()=>`<div class="stars" aria-label="${Q.length-q} hearts left">${Q.map((_,i)=>i<q?'🤍':'💖').join('')}</div>`;
    const win=()=>{
      el.innerHTML=`${hearts()}<div class="boss down" aria-hidden="true">${emoji}</div><div class="prompt">You beat ${name}!</div>
        <div class="bonus" id="bonus"><div class="sub">⭐ Bonus star: explain one!</div>
        <div class="row">${Q.map(([a,b])=>`<span class="chip">${a} + ${b} = ${a+b}</span>`).join('')}</div>
        <div class="prompt">Pick one and tell a grown-up how you worked it out.</div>
        <button class="btn" id="exp">I explained one! ⭐</button></div>`;
      sfx.cheer();confetti();setOK();
      setPrompt(`You beat ${name}! Bonus star: pick one sum and tell a grown-up how you worked it out.`);
      $('#exp').onclick=()=>{
        audio();if($('#bonus').classList.contains('said'))return;
        $('#bonus').classList.add('said');$('#exp').textContent='Bonus star! ⭐';sfx.cheer();confetti();say('Brilliant explaining! You earned the bonus star.');
      };
    };
    const draw=()=>{
      const [a,b]=Q[q],ans=a+b,opts=shuffle([ans-1,ans,ans+1]);
      el.innerHTML=`${hearts()}<div class="boss" id="boss" aria-hidden="true">${emoji}</div>
        <div class="eq" id="eq">${a} + ${b} = <span class="q"></span></div>
        <div class="msg" id="msg">Say the answer out loud first. 🗣️</div>
        <div class="row" id="act"><button class="btn red" id="said">I said it!</button></div><div class="choices" id="chs"></div>`;
      setPrompt(`${name} asks: ${nw(a)} plus ${nw(b)}. Say the answer out loud first.`);
      $('#said').onclick=()=>{
        audio();sfx.pop();$('#act').innerHTML='';$('#msg').textContent='Now tap the answer you said.';say('Now tap the answer you said.');
        $('#chs').innerHTML=opts.map(v=>`<button class="ch" data-v="${v}">${v}</button>`).join('');
        $$('.ch',el).forEach(c=>c.onclick=async()=>{
          audio();if(+c.dataset.v!==ans)return shake(c);
          c.classList.add('right');$$('.ch',el).forEach(x=>x.disabled=true);$('#boss').classList.add('hit');sfx.hop();sfx.ding();
          $('#eq').textContent=`${a} + ${b} = ${ans}`;$('#msg').textContent='Zap! A direct hit!';say(`Yes, ${nw(ans)}! A direct hit!`);
          await sleep(1400);q++;q<Q.length?draw():win();
        });
      };
    };
    draw();
  };

  const steps=['intro',...['fill','trick','read','easy','make','split','think','bigger','boss','memory','balloon'].filter(k=>data[k]),'end'];
  return {id:data.id,subject:'maths',title:data.title,
    steps,games:steps.flatMap((k,i)=>k==='memory'||k==='balloon'?[i]:[]),
    R:RM,intro:data.intro,end:data.end};
}
