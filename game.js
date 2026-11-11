'use strict';
// Configuration: change these values to tune the game.
const CONFIG={initialCm:15,biteCm:0.5,challengeSeconds:15,countdownSeconds:3,movePxPerBite:8,kissFadeMs:250};
const $=id=>document.getElementById(id);
const state={mode:'free',left:0,right:0,phase:'menu',relation:'like',pendingMode:'free',proposer:null,deadline:0,interval:null,sequence:null};
let mainBgm=null;
let mainBgmAllowed=false;
function stopMainBgm(){if(mainBgm){mainBgm.pause();mainBgm.currentTime=0;}}
function playMainBgm(){
 if(!mainBgmAllowed)return;
 if(!mainBgm){mainBgm=new Audio('assets/main_theme.mp3');mainBgm.loop=true;mainBgm.volume=0.55;mainBgm.preload='auto';}
 if(mainBgm.paused)mainBgm.play().catch(()=>{});
}
const show=id=>{
 for(const name of ['menu','relationship','proposal','game','result'])$(name).classList.toggle('hidden',name!==id);
 if(['menu','relationship','proposal'].includes(id))playMainBgm();else stopMainBgm();
};
// Browsers may block audio before the first user gesture; unlock the title theme on interaction.
document.addEventListener('pointerdown',()=>{
 if(!mainBgmAllowed){mainBgmAllowed=true;const visible=['menu','relationship','proposal'].some(id=>!$(id).classList.contains('hidden'));if(visible)playMainBgm();}
},{once:true});
document.addEventListener('keydown',()=>{if(!mainBgmAllowed){mainBgmAllowed=true;if(['menu','relationship','proposal'].some(id=>!$(id).classList.contains('hidden')))playMainBgm();}},{once:true});
const cm=()=>Math.max(0,CONFIG.initialCm-(state.left+state.right)*CONFIG.biteCm);
const totalBites=()=>Math.ceil(CONFIG.initialCm/CONFIG.biteCm);
const description=length=>{const fraction=length/CONFIG.initialCm;if(fraction===0)return '두 사람의 거리가 마침내 사라졌습니다.';if(fraction<=.2)return '입술이 닿을 듯 말 듯! 정말 아슬아슬한 거리입니다.';if(fraction<=.4)return '빼빼로가 꽤 짧아졌습니다. 조금만 더 가까이!';if(fraction<=.7)return '두 사람 모두 열심히 먹었지만 아직 거리가 남았습니다.';return '아직 빼빼로가 많이 남았습니다. 다음에는 더 빠르게 도전해 보세요!'};
let endingAudio=null;
let kissAudio=null;
let resultBgm=null;
function stopResultBgm(){if(resultBgm){resultBgm.pause();resultBgm.currentTime=0;resultBgm=null}}
function playResultBgm(){stopResultBgm();const file=state.relation==='dislike'?'ending_dislike.mp3':'ending_love.mp3';resultBgm=new Audio('assets/'+file);resultBgm.loop=true;resultBgm.volume=0.65;resultBgm.play().catch(()=>{});}
function stopEndingAudio(){stopResultBgm();if(kissAudio){kissAudio.pause();kissAudio.currentTime=0;kissAudio=null}if(endingAudio){endingAudio.pause();endingAudio.currentTime=0;endingAudio=null}}
function stopTimers(){clearInterval(state.interval);state.interval=null;clearTimeout(state.sequence);state.sequence=null;stopEndingAudio()}
function setImage(side,kind){const img=$(side+'Img');const base=artUrl(side+'_'+kind);if(img.dataset.current===base)return;img.dataset.current=base;img.onload=()=>{img.classList.add('loaded');$(side+'Placeholder').style.display='none'};img.onerror=()=>{if(kind==='eat'){setImage(side,'idle');return}img.classList.remove('loaded');$(side+'Placeholder').style.display='flex'};img.src=base}
function render(){
 const left=state.left,right=state.right,ratio=cm()/CONFIG.initialCm;
 const arena=$('arena'),aw=arena.clientWidth;
 const maxMove=Math.min(aw*.20,220);
 const leftMove=Math.min(maxMove,left*CONFIG.movePxPerBite);
 const rightMove=Math.min(maxMove,right*CONFIG.movePxPerBite);
 $('leftChar').style.setProperty('--move',leftMove+'px');
 $('rightChar').style.setProperty('--move',rightMove+'px');
 $('leftBites').textContent=left;$('rightBites').textContent=right;
 $('length').textContent=cm().toFixed(1)+' cm';
 // Anchor the stick to the characters' mouths, not to their foreheads.
 // Relative horizontal endpoints are derived from the character image boxes.
 const lc=$('leftChar'),rc=$('rightChar');
 const l=lc.getBoundingClientRect(),r=rc.getBoundingClientRect(),a=arena.getBoundingClientRect();
 const mouthLeft=l.right-l.width*.17;
 const mouthRight=r.left+r.width*.17;
 const x1=Math.max(0,mouthLeft-a.left),x2=Math.min(aw,mouthRight-a.left);
 const fullWidth=Math.max(0,x2-x1);
 const visibleWidth=fullWidth*ratio;
 $('stick').style.left=(x1+(fullWidth-visibleWidth)/2)+'px';
 $('stick').style.width=visibleWidth+'px';
 $('stick').style.top='77%';
 $('stick').style.opacity=ratio<=0?'0':'1';
}
function start(mode){stopTimers();state.mode=mode;state.left=0;state.right=0;state.abandoned=false;state.phase='ready';$('ending').classList.add('hidden');$('endingActions').classList.add('hidden');$('endingReaction').classList.add('hidden');$('endingReactions').classList.add('hidden');$('modeName').textContent=mode==='free'?'FREE MODE':'CHALLENGE MODE';$('stopBtn').textContent='포기하고 결과 보기';$('timer').textContent=mode==='free'?'∞':'15.0';$('relationStatus').textContent=state.relation==='like'?'좋아하는 상대 · '+(state.proposer==='male'?'남자가 제안':'여자가 제안'):'싫어하는 상대';$('status').textContent=mode==='free'?'원하는 쪽을 터치하세요':'15초 동안 더 많이 먹으세요';show('game');setImage('left','idle');setImage('right','idle');render();if(mode==='challenge')countdown();else state.phase='playing'}
function countdown(){state.phase='countdown';let n=CONFIG.countdownSeconds;$('countdown').textContent=n;$('countdown').classList.remove('hidden');state.interval=setInterval(()=>{n--;if(n>0){$('countdown').textContent=n;return}clearInterval(state.interval);state.interval=null;$('countdown').classList.add('hidden');state.phase='playing';state.deadline=performance.now()+CONFIG.challengeSeconds*1000;state.interval=setInterval(tick,40)},1000)}
function tick(){if(state.phase!=='playing'||state.mode!=='challenge')return;const remaining=Math.max(0,(state.deadline-performance.now())/1000);$('timer').textContent=remaining.toFixed(1);if(remaining<=0){state.abandoned=false;finish(false)}}
let eatTimeouts={left:null,right:null};function bite(side){if(state.phase!=='playing')return;if(state.mode==='challenge'&&performance.now()>=state.deadline){finish(false);return}if(cm()<=0)return;state[side]++;render();setImage(side,'eat');clearTimeout(eatTimeouts[side]);eatTimeouts[side]=setTimeout(()=>setImage(side,'idle'),125);if(cm()<=0){state.phase='biteComplete';state.sequence=setTimeout(()=>{if(state.phase==='biteComplete')kissEnding()},240)}}
function finish(kissed){
 if(state.phase==='result')return;
 stopTimers();state.phase='result';$('ending').classList.add('hidden');show('result');
 $('resultMode').textContent=state.mode==='free'?'FREE MODE RESULT':'CHALLENGE RESULT';
 const length=cm();
 $('resultLength').textContent=`남은 빼빼로 ${length.toFixed(1)} cm`;
 $('resultStickFill').style.width=(length/CONFIG.initialCm*100)+'%';
 const winner=state.left===state.right?'무승부':state.left>state.right?'왼쪽 캐릭터 승리!':'오른쪽 캐릭터 승리!';
 $('resultTitle').textContent=kissed?'KISS CLEAR!':state.mode==='challenge'?(state.abandoned?'CHALLENGE STOPPED':'TIME UP!'):(state.abandoned?'여기까지!':'PLAY RESULT');
 $('resultDescription').textContent=kissed?(state.relation==='dislike'?'결국 입술이 맞닿고 말았습니다. 두 사람에게는 잊고 싶은 빼빼로데이가 되었네요!':'빼빼로는 사라지고 두 사람 사이에는 달콤한 추억이 남았습니다.'):(state.relation==='dislike'?'싫어하는 상대인데도 이렇게 가까워졌습니다. ':'')+description(length);
 $('resultReactionPair').classList.toggle('hidden',state.relation!=='dislike'||!kissed);
 $('resultReaction').classList.toggle('hidden',state.relation==='dislike'&&kissed);
 $('resultReaction').src=artUrl(state.relation==='like'?'result_happy':'result_shock_left');
 $('resultReactionPair').querySelectorAll('img')[0].src=artUrl('result_shock_left');
 $('resultReactionPair').querySelectorAll('img')[1].src=artUrl('result_shock_right');
 $('resultScores').textContent=`왼쪽 ${state.left}입 · 오른쪽 ${state.right}입${state.mode==='challenge'?' · '+winner:''}`;
 $('resultEndingNote').classList.toggle('hidden',!kissed);
 $('resultEndingNote').textContent=kissed?'둘의 입술이 맞닿았다. · 키스 엔딩':'';
 if(kissed)playResultBgm();
}

function kissSound(){
 if(kissAudio){kissAudio.pause();kissAudio.currentTime=0}
 kissAudio=new Audio('assets/kiss2.mp3');
 kissAudio.preload='auto';
 kissAudio.play().catch(()=>{});
}
function playReactionEndingAudio(){
 if(state.phase!=='ending')return;
 const path=state.relation==='dislike'?'assets/Ikkyu_san.mp3':'assets/blackout_piano1.mp3';
 const audio=new Audio(path);endingAudio=audio;audio.preload='auto';
 let transitioned=false;
 const go=()=>{if(transitioned||state.phase!=='ending')return;transitioned=true;finish(true)};
 audio.addEventListener('ended',go,{once:true});
 audio.addEventListener('error',go,{once:true});
 audio.play().catch(go);
 // Safety fallback if the sound cannot signal completion.
 state.sequence=setTimeout(go,9000);
}

function kissEnding(){
 stopTimers();state.phase='ending';
 const overlay=$('ending'),txt=$('endingText');
 overlay.classList.remove('hidden');txt.textContent='';
 state.sequence=setTimeout(()=>{
  if(state.phase!=='ending')return;
  txt.textContent='둘의 입술이 맞닿았다.';
  // Keep the sentence still during the kiss; only reveal dots after the audio ends.
  const audio=new Audio('assets/kiss2.mp3');
  kissAudio=audio;audio.preload='auto';
  let finished=false;
  const advance=()=>{
   if(finished||state.phase!=='ending')return;
   finished=true;clearTimeout(state.sequence);
   const sentence='둘의 입술이 맞닿았다.';
   // A single growing ellipsis, starting strictly after the kiss sound finishes.
   [1,2,3].forEach((count,i)=>{
    setTimeout(()=>{
     if(state.phase!=='ending')return;
     txt.textContent=sentence+'\n'+'.'.repeat(count);
     if(count===3){state.sequence=setTimeout(()=>{
      if(state.phase==='ending')playReactionEndingAudio();
     },400)}
    },(i+1)*400);
   });
  };
  audio.addEventListener('ended',advance,{once:true});
  audio.addEventListener('error',advance,{once:true});
  audio.play().catch(advance);
  state.sequence=setTimeout(advance,6500);
 },CONFIG.kissFadeMs+350);
}
for(const side of ['left','right']){const zone=$(side+'Zone');zone.addEventListener('pointerdown',e=>{e.preventDefault();bite(side)});zone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();bite(side)}})}
document.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>{state.pendingMode=btn.dataset.mode;state.phase='selection';show('relationship')}));document.querySelectorAll('[data-relation]').forEach(btn=>btn.addEventListener('click',()=>{state.relation=btn.dataset.relation;if(state.relation==='like'){state.phase='proposal';show('proposal')}else{state.proposer=null;start(state.pendingMode)}}));document.querySelectorAll('[data-proposer]').forEach(btn=>btn.addEventListener('click',()=>{state.proposer=btn.dataset.proposer;start(state.pendingMode)}));$('proposalBack').addEventListener('click',()=>{state.phase='selection';show('relationship')});$('relationBack').addEventListener('click',()=>{state.phase='menu';show('menu')});
$('stopBtn').addEventListener('click',()=>{state.abandoned=true;finish(false)});$('retryBtn').addEventListener('click',()=>start(state.mode));$('homeBtn').addEventListener('click',()=>{stopTimers();state.phase='menu';show('menu')});$('endingRetry').addEventListener('click',()=>start(state.mode));$('endingHome').addEventListener('click',()=>{stopTimers();$('ending').classList.add('hidden');state.phase='menu';show('menu')});$('menuBtn').addEventListener('click',()=>{stopTimers();$('ending').classList.add('hidden');state.phase='menu';show('menu')});window.addEventListener('resize',render);

document.addEventListener('visibilitychange',()=>{if(document.hidden){if(mainBgm)mainBgm.pause();}else if(['menu','relationship','proposal'].some(id=>!$(id).classList.contains('hidden')))playMainBgm();});


// Local illustration library: store original image Blobs in IndexedDB, not localStorage.
const ART_KEYS=['left_idle','left_eat','right_idle','right_eat','result_happy','result_shock_left','result_shock_right'];
const ART_DEFAULTS={result_happy:'happy.png',result_shock_left:'shock_left.png',result_shock_right:'shock_right.png'};
const artUrls={};
function artUrl(key){return artUrls[key]||'assets/'+(ART_DEFAULTS[key]||key+'.png')}
function artDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open('pocky_day_custom_art',1);req.onupgradeneeded=()=>req.result.createObjectStore('images');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function artStorage(key,blob){const db=await artDB();try{await new Promise((resolve,reject)=>{const tx=db.transaction('images','readwrite');tx.objectStore('images')[blob?'put':'delete'](...(blob?[blob,key]:[key]));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}finally{db.close()}}
async function loadArt(){try{const db=await artDB();try{const values=await Promise.all(ART_KEYS.map(key=>new Promise((resolve,reject)=>{const req=db.transaction('images').objectStore('images').get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})));values.forEach((blob,i)=>{if(blob)artUrls[ART_KEYS[i]]=URL.createObjectURL(blob)})}finally{db.close()}}catch(err){$('artEditorStatus').textContent='이 브라우저에서 저장소를 사용할 수 없습니다. '+err.message}refreshArt()}
function refreshArt(){ART_KEYS.forEach(key=>{$('preview_'+key).src=artUrl(key)});
 $('resultReaction').src=artUrl(state.relation==='like'?'result_happy':'result_shock_left');
 const pair=$('resultReactionPair').querySelectorAll('img');pair[0].src=artUrl('result_shock_left');pair[1].src=artUrl('result_shock_right');for(const side of ['left','right']){const img=$(side+'Img');img.dataset.current='';setImage(side,'idle')}if(state.phase==='playing'||state.phase==='ready')requestAnimationFrame(render)}
function openArtEditor(){if(state.phase==='playing'||state.phase==='countdown'||state.phase==='biteComplete'){alert('게임 중에는 일러스트를 변경할 수 없습니다. 메인 메뉴에서 변경해 주세요.');return}$('artEditor').classList.remove('hidden')}
function closeArtEditor(){$('artEditor').classList.add('hidden')}
$('artSettingsBtn').addEventListener('click',openArtEditor);$('artEditorClose').addEventListener('click',closeArtEditor);$('artEditorDone').addEventListener('click',closeArtEditor);
$('artEditor').addEventListener('pointerdown',e=>{if(e.target===$('artEditor'))closeArtEditor()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('artEditor').classList.contains('hidden'))closeArtEditor()});
ART_KEYS.forEach(key=>{
 $('upload_'+key).addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)){alert('PNG, JPG, WebP 이미지만 지원합니다.');return}if(file.size>12*1024*1024){alert('이미지당 12MB 이하로 선택해 주세요.');return}
 try{await artStorage(key,file);if(artUrls[key])URL.revokeObjectURL(artUrls[key]);artUrls[key]=URL.createObjectURL(file);refreshArt();$('artEditorStatus').textContent='저장했습니다: '+key.replace('_',' / ')}catch(err){$('artEditorStatus').textContent='저장 실패: '+err.message}e.target.value=''});
 document.querySelector('[data-art-reset="'+key+'"]').addEventListener('click',async()=>{try{await artStorage(key,null);if(artUrls[key])URL.revokeObjectURL(artUrls[key]);delete artUrls[key];refreshArt();$('artEditorStatus').textContent='기본 이미지로 복원했습니다.'}catch(err){$('artEditorStatus').textContent='복원 실패: '+err.message}})
});
loadArt();
