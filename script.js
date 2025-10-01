document.addEventListener('DOMContentLoaded', () => {
  // --- 要素取得 ---
  const titleScreen = document.getElementById('title-screen');
  const roundsScreen = document.getElementById('rounds-screen');
  const gameScreen = document.getElementById('game-screen');
  const resultScreen = document.getElementById('result-screen');

  const startGameButton = document.getElementById('start-game-button');
  const roundButtons = document.querySelectorAll('.round-button');
  const restartButton = document.getElementById('restart-button');
  const returnToTitleButton = document.getElementById('return-to-title-button');

  const boardArea = document.getElementById('board-area');
  const playerHandArea = document.getElementById('player-hand-area');
  const cpuHandArea = document.getElementById('cpu-hand-area');

  const koikoiButton = document.getElementById('koikoi-button');
  const shobuButton = document.getElementById('shobu-button');
  const actionButtons = document.getElementById('action-buttons');

  const playerScoreSpan = document.getElementById('player-score');
  const cpuScoreSpan = document.getElementById('cpu-score');
  const currentRoundSpan = document.getElementById('current-round');

  const playerLightArea = document.getElementById('player-light-area');
  const playerTaneArea = document.getElementById('player-tane-area');
  const playerTanArea = document.getElementById('player-tan-area');
  const playerKasuArea = document.getElementById('player-kasu-area');
  const cpuLightArea = document.getElementById('cpu-light-area');
  const cpuTaneArea = document.getElementById('cpu-tane-area');
  const cpuTanArea = document.getElementById('cpu-tan-area');
  const cpuKasuArea = document.getElementById('cpu-kasu-area');

  const messageArea = document.getElementById('message') || createMessageArea();

  // リザルト
  const resultMessageElement = document.getElementById('result-message');
  const finalPlayerScoreElement = document.getElementById('final-player-score');
  const finalCpuScoreElement = document.getElementById('final-cpu-score');

  // ツールチップ
  const cardInfoBox = ensureTooltip();
  const cardInfoMonth = cardInfoBox.querySelector('#card-info-month');
  const cardInfoName  = cardInfoBox.querySelector('#card-info-name');
  const cardInfoType  = cardInfoBox.querySelector('#card-info-type');

  // ヘルプ
  const helpBtn = document.getElementById('help-button');
  const helpBtnGame = document.getElementById('help-button-game');
  const helpModal = document.getElementById('help-modal');
  const helpClose = document.getElementById('help-close');
  function openHelp(){ helpModal.style.display = 'flex'; }
  function closeHelp(){ helpModal.style.display = 'none'; }
  helpBtn?.addEventListener('click', openHelp);
  helpBtnGame?.addEventListener('click', openHelp);
  helpClose?.addEventListener('click', closeHelp);
  helpModal?.addEventListener('click', (e)=>{ if(e.target===helpModal) closeHelp(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeHelp(); });

  // --- 花札定義 ---
  const DEFAULT_CARD_IMAGE_CONFIG = {
    /**
     * 札画像のベースディレクトリ。
     * ここを変更することで既定の検索先をまとめて差し替えできます。
     */
    basePath: 'images/cards',
    /**
     * 既定の拡張子。拡張子を含むフルパスを overrides で指定する場合は不要です。
     */
    defaultExtension: 'png',
    /**
     * 各札ごとの明示的なパス。必要な札だけ指定してください。
     * 例: '松に鶴': 'assets/matsu_crane.webp'
     */
    overrides: {'松': 'images/cards/matsu_kasu1.png'},
    /**
     * 裏面画像。
     */
    backImage: 'images/back.png'
  };

  const externalCardImageConfig = window.__HANAFUDA_CARD_IMAGE_CONFIG__ || window.hanafudaCardImages?.config || {};
  const CARD_IMAGE_CONFIG = {
    ...DEFAULT_CARD_IMAGE_CONFIG,
    ...externalCardImageConfig,
    overrides: {
      ...DEFAULT_CARD_IMAGE_CONFIG.overrides,
      ...(externalCardImageConfig?.overrides || {})
    }
  };

  const cardImageApi = window.hanafudaCardImages || {};
  Object.assign(cardImageApi, {
    config: CARD_IMAGE_CONFIG,
    setBasePath(path){ CARD_IMAGE_CONFIG.basePath = path ?? ''; },
    setDefaultExtension(ext){ CARD_IMAGE_CONFIG.defaultExtension = ext ?? ''; },
    setOverride(name, imagePath){ if(!name) return; CARD_IMAGE_CONFIG.overrides[name] = imagePath; },
    removeOverride(name){ if(!name) return; delete CARD_IMAGE_CONFIG.overrides[name]; },
    clearOverrides(){ CARD_IMAGE_CONFIG.overrides = {}; },
    setBackImage(path){ CARD_IMAGE_CONFIG.backImage = path ?? ''; }
  });
  window.hanafudaCardImages = cardImageApi;
  window.__HANAFUDA_CARD_IMAGE_CONFIG__ = CARD_IMAGE_CONFIG;

  const CARD_NAMES = [
    '松に鶴','松に短冊','松','松',
    '梅に鶯','梅に短冊','梅','梅',
    '桜に幕','桜に短冊','桜','桜',
    '藤に不如帰','藤に短冊','藤','藤',
    '菖蒲に八ツ橋','菖蒲に短冊','菖蒲','菖蒲',
    '牡丹に蝶','牡丹に短冊','牡丹','牡丹',
    '萩に猪','萩に短冊','萩','萩',
    '芒に月','芒に雁','芒','芒',
    '菊に杯','菊に短冊','菊','菊',
    '紅葉に鹿','紅葉に短冊','紅葉','紅葉',
    '柳に小野道風','柳に燕','柳に短冊','柳',
    '桐に鳳凰','桐','桐','桐'
  ];

  const allCards = [...CARD_NAMES];

  // --- 役点（任天堂準拠/代表値） ---
  const YAKU_POINTS = {
    '五光': 15, '四光': 8, '雨四光': 7, '三光': 5,
    '猪鹿蝶': 5, '赤短': 5, '青短': 5,
    '月見酒': 5, '花見酒': 5,
    'タネ': 1, '短冊': 1, 'カス': 1
  };

  // --- 状態 ---
  let deck = [], playerHand = [], cpuHand = [], board = [];
  let playerCaptured = [], cpuCaptured = [];
  let playerTurn = true;
  let totalRounds = 0, currentRound = 1;
  let playerScore = 0, cpuScore = 0;
  let playerKoikoi = false, cpuKoikoi = false;

  // 先手（親）※流れでも据え置き
  let currentDealer = 'player';
  // 同月2枚時の選択待ち
  let pendingSelection = null; // { handCard: string }

  // ===== Utils =====
  function createMessageArea(){
    const el = document.createElement('div');
    el.className = 'game-message'; el.id = 'message';
    gameScreen.appendChild(el); return el;
  }
  function normalizeCardFileName(cardName){
    return cardName
      .normalize('NFKC')
      .replace(/\s+/g, '_')
      .replace(/に/g, '_')
      .replace(/[（）()・、,]/g, '')
      .toLowerCase();
  }

  function getCardImage(cardName){
    const overrides = CARD_IMAGE_CONFIG.overrides || {};
    const basePath = (CARD_IMAGE_CONFIG.basePath || '').replace(/\/$/, '');
    const ext = CARD_IMAGE_CONFIG.defaultExtension ? `.${CARD_IMAGE_CONFIG.defaultExtension.replace(/^\./, '')}` : '';
    const override = overrides[cardName];
    if (override) {
      const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(override) || override.startsWith('/') || override.startsWith('./') || override.startsWith('../');
      if (isAbsolute) return override;

      const hasDirectory = override.includes('/');
      const hasExtension = /\.[a-z0-9]+$/i.test(override);
      const file = hasExtension ? override : `${override}${ext}`;

      if (!basePath || hasDirectory) {
        return file;
      }
      return `${basePath}/${file}`;
    }

    const fileName = normalizeCardFileName(cardName);
    if (!basePath) {
      return `${fileName}${ext}`;
    }
    return `${basePath}/${fileName}${ext}`;
  }

  function getCardBackImage(){
    return CARD_IMAGE_CONFIG.backImage || '';
  }
  function getCardMonth(cardName){ return cardName.split('に')[0]; }
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  // Tooltip
  function ensureTooltip(){
    let tip=document.getElementById('card-info-box');
    if(!tip){
      tip=document.createElement('div'); tip.id='card-info-box';
      tip.innerHTML='<p id="card-info-month"></p><p id="card-info-name"></p><p id="card-info-type"></p>';
      document.body.appendChild(tip);
    }
    tip.style.display='none'; tip.style.position='fixed'; tip.style.zIndex='9999';
    return tip;
  }
  function showTooltipForCard(card, targetEl){
    cardInfoMonth.textContent = `月: ${getCardMonth(card)}`;
    cardInfoName.textContent  = `札: ${card}`;
    cardInfoType.textContent  = `種類: ${getCardType(card)}`;
    positionTooltipAbove(targetEl);
    cardInfoBox.style.display='block';
  }
  function hideTooltip(){ cardInfoBox.style.display='none'; }
  function positionTooltipAbove(el){
    const r=el.getBoundingClientRect(); const t=cardInfoBox.getBoundingClientRect();
    const x=r.left + r.width/2 - t.width/2; const y=r.top - t.height - 8;
    cardInfoBox.style.left = Math.max(8, Math.min(window.innerWidth - t.width - 8, x))+'px';
    cardInfoBox.style.top  = Math.max(8, y)+'px';
  }

  // ===== 札種別 =====
  function getCardType(name){
    if (name==='松に鶴' || name==='桜に幕' || name==='芒に月' || name==='桐に鳳凰') return '光';
    if (name==='柳に小野道風') return '雨光';
    if (name.includes('短冊')) return '短冊';
    if (name==='萩に猪' || name==='紅葉に鹿' || name==='牡丹に蝶' ||
        name==='梅に鶯' || name==='藤に不如帰' || name==='菖蒲に八ツ橋' ||
        name==='芒に雁' || name==='柳に燕' || name==='菊に杯') return 'タネ';
    return 'カス';
  }

  // ===== 役判定 =====
  function checkYaku(cards){
    const yakuList = [];

    // セット役
    const inoshikacho = ['萩に猪','紅葉に鹿','牡丹に蝶'];
    if (inoshikacho.every(c => cards.includes(c))) yakuList.push('猪鹿蝶');

    if (['松に短冊','梅に短冊','桜に短冊'].every(c => cards.includes(c))) yakuList.push('赤短');
    if (['牡丹に短冊','菊に短冊','紅葉に短冊'].every(c => cards.includes(c))) yakuList.push('青短');

    // 月見酒 / 花見酒（任天堂の説明に基づく）
    if (cards.includes('芒に月') && cards.includes('菊に杯')) yakuList.push('月見酒');
    if (cards.includes('桜に幕') && cards.includes('菊に杯')) yakuList.push('花見酒');

    // 光系
    const lightCards = cards.filter(c => getCardType(c)==='光' || getCardType(c)==='雨光');
    const hasRain = lightCards.some(c => getCardType(c)==='雨光');
    if (lightCards.length === 5) yakuList.push('五光');
    else if (lightCards.length === 4) yakuList.push(hasRain ? '雨四光' : '四光');
    else if (lightCards.length === 3 && !hasRain) yakuList.push('三光');

    // 枚数系（菊に杯はタネだが、カスにも数えられる）
    const tanCount  = cards.filter(c => getCardType(c)==='短冊').length;
    const taneCount = cards.filter(c => getCardType(c)==='タネ').length;
    let kasuCount   = cards.filter(c => getCardType(c)==='カス').length;
    if (cards.includes('菊に杯')) kasuCount += 1; // 任天堂注記：「菊に杯」はカスにも数えられる

    if (tanCount  >= 5) yakuList.push('短冊');
    if (taneCount >= 5) yakuList.push('タネ');
    if (kasuCount >= 10) yakuList.push('カス');

    return yakuList;
  }

  // ▼ これを script.js に追加（checkYakuの下あたり）し、calculateScoreは使わないようにします。
function scoreFromCaptured(cards){
  const yakuList = [];

  // セット役
  const has = (name) => cards.includes(name);
  const type = (c) => getCardType(c);

  if (['萩に猪','紅葉に鹿','牡丹に蝶'].every(has)) yakuList.push('猪鹿蝶');
  if (['松に短冊','梅に短冊','桜に短冊'].every(has)) yakuList.push('赤短');
  if (['牡丹に短冊','菊に短冊','紅葉に短冊'].every(has)) yakuList.push('青短');
  if (has('芒に月') && has('菊に杯')) yakuList.push('月見酒');
  if (has('桜に幕') && has('菊に杯')) yakuList.push('花見酒');

  // 光
  const lights = cards.filter(c => type(c)==='光' || type(c)==='雨光');
  const hasRain = lights.some(c => type(c)==='雨光');
  if (lights.length===5) yakuList.push('五光');
  else if (lights.length===4) yakuList.push(hasRain ? '雨四光' : '四光');
  else if (lights.length===3 && !hasRain) yakuList.push('三光');

  // 枚数系（段階加点）
  const tan  = cards.filter(c => type(c)==='短冊').length;
  const tane = cards.filter(c => type(c)==='タネ').length;
  let kasu  = cards.filter(c => type(c)==='カス').length + (has('菊に杯') ? 1 : 0); // 菊に杯はカスにも数える

  let pts = 0;
  // 固定点の役
  const FIX = { '五光':15, '四光':8, '雨四光':7, '三光':5, '猪鹿蝶':5, '赤短':5, '青短':5, '月見酒':5, '花見酒':5 };
  yakuList.forEach(y => { if (FIX[y]) pts += FIX[y]; });

  // 段階加点
  if (tan  >= 5) { yakuList.push('短冊'); pts += (tan - 4); }
  if (tane >= 5) { yakuList.push('タネ');  pts += (tane - 4); }
  if (kasu >= 10){ yakuList.push('カス');  pts += (kasu - 9); }

  return { yakuList, basePoints: pts };
}

  function calculateScore(yakuList){
    return yakuList.reduce((s,y)=> s + (YAKU_POINTS[y]||0), 0);
  }

  // ===== 配り =====
// ▼ dealCards を配り直し対応に強化
function dealCards(){
  do {
    deck = shuffle([...allCards]);
    playerHand = deck.splice(0,8);
    cpuHand    = deck.splice(0,8);
    board      = deck.splice(0,8);
  } while (hasFourOfSameMonth(board)); // 場札4枚同月 → 配り直し

  playerCaptured = [];
  cpuCaptured    = [];
}

function hasFourOfSameMonth(arr){
  const cnt = {};
  arr.forEach(c => { const m=getCardMonth(c); cnt[m]=(cnt[m]||0)+1; });
  return Object.values(cnt).some(n => n===4);
}

function initialHandBonus(hand){
  const cnt = {};
  hand.forEach(c => { const m=getCardMonth(c); cnt[m]=(cnt[m]||0)+1; });
  const fourOfKind = Object.values(cnt).some(n=>n===4);
  const fourPairs  = Object.values(cnt).filter(n=>n>=2).length >= 4;
  return (fourOfKind || fourPairs);
}

  // ===== 描画 =====
  function renderCards(area, cards, isFaceDown=false){
    area.innerHTML='';
    cards.forEach(card=>{
      const el=document.createElement('div');
      el.classList.add('card');
      if(isFaceDown){
        el.classList.add('back');
        const backImage = getCardBackImage();
        el.style.backgroundImage = backImage ? `url('${backImage}')` : '';
        el.textContent = '';
      }else{
        el.style.backgroundImage = `url('${getCardImage(card)}')`;
        el.textContent = card;
        el.addEventListener('mouseenter', ()=>showTooltipForCard(card, el));
        el.addEventListener('mouseleave', hideTooltip);
        el.addEventListener('mousemove', ()=>positionTooltipAbove(el));
      }
      area.appendChild(el);
    });
  }

  function updateCapturedUI(){
    const group = (arr, type) => arr.filter(c => type==='光'
      ? (getCardType(c)==='光' || getCardType(c)==='雨光') : getCardType(c)===type);

    renderCards(playerLightArea, group(playerCaptured,'光'));
    renderCards(playerTaneArea,  group(playerCaptured,'タネ'));
    renderCards(playerTanArea,   group(playerCaptured,'短冊'));
    renderCards(playerKasuArea,  group(playerCaptured,'カス'));

    renderCards(cpuLightArea, group(cpuCaptured,'光'));
    renderCards(cpuTaneArea,  group(cpuCaptured,'タネ'));
    renderCards(cpuTanArea,   group(cpuCaptured,'短冊'));
    renderCards(cpuKasuArea,  group(cpuCaptured,'カス'));
  }

  function updateUI(){
    renderCards(boardArea, board);
    renderCards(playerHandArea, playerHand);
    renderCards(cpuHandArea, cpuHand, true);
    updateCapturedUI();

    playerScoreSpan.textContent = playerScore;
    cpuScoreSpan.textContent = cpuScore;
    currentRoundSpan.textContent = `第${currentRound}回戦`;
  }

  // ===== ラウンド終了／流れ =====
  function maybeNagare(){
    if (playerHand.length===0 && cpuHand.length===0){
      messageArea.textContent = '流れ（どちらも手札が無くなりました）。';
      endRound('none');
      return true;
    }
    return false;
  }

// ▼ endRound を丸ごと差し替え
function endRound(winner){
  const P = scoreFromCaptured(playerCaptured);
  const C = scoreFromCaptured(cpuCaptured);

  let playerGain = 0, cpuGain = 0;
  let nextDealer = currentDealer;

  if (winner === 'player') {
    playerGain = P.basePoints;

    // 7点以上なら倍
    if (playerGain >= 7) playerGain *= 2; // 任天堂ルール
    // 相手が「こいこい」宣言していたら、さらに倍（自分の宣言では倍にしない）
    if (cpuKoikoi) playerGain *= 2;

    playerScore += playerGain;
    messageArea.textContent = `勝負！あなたの勝ち。${playerGain}点獲得（役: ${P.yakuList.join('、') || 'なし'}）。`;
    nextDealer = 'player';

  } else if (winner === 'cpu') {
    cpuGain = C.basePoints;

    if (cpuGain >= 7) cpuGain *= 2;
    if (playerKoikoi) cpuGain *= 2;

    cpuScore += cpuGain;
    messageArea.textContent = `勝負！相手の勝ち。${cpuGain}点獲得（役: ${C.yakuList.join('、') || 'なし'}）。`;
    nextDealer = 'cpu';

  } else {
    // ノーゲーム：親交代
    messageArea.textContent = 'ノーゲーム（流れ）。親を交代します。';
    nextDealer = (currentDealer === 'player') ? 'cpu' : 'player';
  }

  if (currentRound >= totalRounds){
    setTimeout(()=>{
      showScreen('result-screen');
      finalPlayerScoreElement.textContent = playerScore;
      finalCpuScoreElement.textContent    = cpuScore;
      resultMessageElement.textContent = (playerScore>cpuScore) ? 'あなたの勝利！'
        : (cpuScore>playerScore) ? 'あなたの敗北...' : '引き分け';
      playerScore=0; cpuScore=0; currentRound=1;
    }, 1200);
  } else {
    currentRound++;
    currentDealer = nextDealer;
    setTimeout(()=> startGame(currentDealer), 1200);
  }
}

  // ===== プレイヤー手番 =====
  function playerTurnHandler(card){
    if (pendingSelection) return;
    const month = getCardMonth(card);

    const matchIdxs = [];
    board.forEach((b,i)=>{ if(getCardMonth(b)===month) matchIdxs.push(i); });

    if (matchIdxs.length===0){
      removeFromHand(card); board.push(card);
      drawAndResolve(); postPlayerAction(); return;
    }
    if (matchIdxs.length===1){
      removeFromHand(card);
      const taken = [card, board.splice(matchIdxs[0],1)[0]];
      resolveCapture(playerCaptured, taken);
      drawAndResolve(); postPlayerAction(true); return;
    }
    if (matchIdxs.length===2){
      messageArea.textContent = 'どちらの札を取るか選んでください。';
      highlightAndAwaitBoardChoice(matchIdxs, card); return;
    }
    // 3枚以上は総取り
    removeFromHand(card);
    const same = board.filter(c=>getCardMonth(c)===month);
    board = board.filter(c=>getCardMonth(c)!==month);
    resolveCapture(playerCaptured, [card, ...same]);
    drawAndResolve(); postPlayerAction(true);
  }

  function removeFromHand(card){ const i=playerHand.indexOf(card); if(i>-1) playerHand.splice(i,1); }

  function resolveCapture(captured, taken){
    if (taken.length>0){
      captured.push(...taken);
      const y = checkYaku(captured);
      if (captured===playerCaptured && y.length>0){
        hideTooltip(); // ← 追加：ボタンの上に残らないよう確実に消す
        messageArea.textContent = `役ができました！(${y.join(', ')}) こいこいしますか？`;
        actionButtons.style.display='flex';
        // actionButtons.classList.add('active'); // 好みでクラス運用にしてもOK
        playerHandArea.removeEventListener('click', playerHandClickHandler);
        updateUI(); return true;
      }
    }
    return false;
  }

// ▼ drawAndResolve 内の分岐を修正
function drawAndResolve(){
  if (deck.length===0) return;
  const d = deck.shift();
  const m = getCardMonth(d);
  const idxs = [];
  board.forEach((b,i)=>{ if(getCardMonth(b)===m) idxs.push(i); });

  if (idxs.length===0){
    board.push(d);
  } else if (idxs.length===1){
    const taken=[d, board.splice(idxs[0],1)[0]];
    resolveCapture(playerTurn ? playerCaptured : cpuCaptured, taken);
  } else if (idxs.length===2){
    // ← 修正：2枚なら“どちらか1枚”だけ取る
    const chosen = idxs[0]; // （任意で選択UIにすることも可）
    const taken=[d, board.splice(chosen,1)[0]];
    resolveCapture(playerTurn ? playerCaptured : cpuCaptured, taken);
  } else {
    // 3枚以上は総取り
    const same = board.filter(c=>getCardMonth(c)===m);
    board = board.filter(c=>getCardMonth(c)!==m);
    resolveCapture(playerTurn ? playerCaptured : cpuCaptured, [d, ...same]);
  }
}


  function postPlayerAction(){
    updateUI();
    if (maybeNagare()) return;
    if (actionButtons.style.display!=='flex'){
      playerTurn=false; messageArea.textContent='相手の番です。';
      setTimeout(cpuTurnHandler, 900);
    }
  }

  // 2枚時の選択
  function highlightAndAwaitBoardChoice(matchIdxs, handCard){
    pendingSelection = { handCard };
    [...boardArea.children].forEach((el,i)=> el.classList.toggle('selectable', matchIdxs.includes(i)));
    const onClick = (e)=>{
      const el=e.target.closest('.card'); if(!el) return;
      const idx=Array.from(boardArea.children).indexOf(el);
      if(!matchIdxs.includes(idx)) return;

      boardArea.removeEventListener('click', onClick);
      [...boardArea.children].forEach(el=>el.classList.remove('selectable'));

      removeFromHand(pendingSelection.handCard);
      const taken=[pendingSelection.handCard, board.splice(idx,1)[0]];
      resolveCapture(playerCaptured, taken);
      pendingSelection=null;

      drawAndResolve(); postPlayerAction();
    };
    boardArea.addEventListener('click', onClick);
  }

  // ===== CPU手番（簡易） =====
  function cpuTurnHandler(){
    hideTooltip();
    messageArea.textContent='相手が考えています...';

    let played=null, matches=[];
    for (let i=0;i<cpuHand.length;i++){
      const c=cpuHand[i], m=getCardMonth(c); matches=[];
      board.forEach((b,bi)=>{ if(getCardMonth(b)===m) matches.push(bi); });
      if (matches.length>0){ played=cpuHand.splice(i,1)[0]; break; }
    }
    if (!played){
      const r=Math.floor(Math.random()*cpuHand.length);
      played=cpuHand.splice(r,1)[0];
      board.push(played);
      drawAndResolve(); updateUI();
      if (maybeNagare()) return;
      playerTurn=true; messageArea.textContent='あなたの番です。手札から札を選んでください。';
      return;
    }

    const m=getCardMonth(played);
    if (matches.length===1){
      const taken=[played, board.splice(matches[0],1)[0]];
      resolveCapture(cpuCaptured, taken);
    } else if (matches.length>=2){
      if (matches.length>=3){
        const same=board.filter(c=>getCardMonth(c)===m);
        board = board.filter(c=>getCardMonth(c)!==m);
        resolveCapture(cpuCaptured, [played, ...same]);
      } else {
        const chosen=matches[0];
        const taken=[played, board.splice(chosen,1)[0]];
        resolveCapture(cpuCaptured, taken);
      }
    }

    drawAndResolve(); updateUI();
    if (maybeNagare()) return;

    playerTurn=true; messageArea.textContent='あなたの番です。手札から札を選んでください。';
  }

  // ===== 画面切替／開始 =====
  function showScreen(id){
    document.querySelectorAll('.screen').forEach(s=>{
      s.classList.remove('active'); s.style.opacity='0'; s.style.zIndex='1';
    });
    const a=document.getElementById(id);
    a.classList.add('active'); a.style.opacity='1'; a.style.zIndex='100';
  }

  function startGame(startingPlayer='player'){
    dealCards(); updateUI();

      // ▼ 初手配ボーナス 6点
  const pBonus = initialHandBonus(playerHand);
  const cBonus = initialHandBonus(cpuHand);
  if (pBonus || cBonus){
    if (pBonus && !cBonus){ playerScore += 6; currentDealer='player'; messageArea.textContent='初手配ボーナス（あなた）：6点'; }
    else if (cBonus && !pBonus){ cpuScore += 6; currentDealer='cpu'; messageArea.textContent='初手配ボーナス（相手）：6点'; }
    else { messageArea.textContent='両者初手配ボーナス：6点ずつ'; } // まれな同時発生

    // 即終了 → 次回戦へ
    if (currentRound >= totalRounds){
      setTimeout(()=>{ showScreen('result-screen');
        finalPlayerScoreElement.textContent = playerScore;
        finalCpuScoreElement.textContent = cpuScore;
        resultMessageElement.textContent = (playerScore>cpuScore)?'あなたの勝利！':(cpuScore>playerScore)?'あなたの敗北...':'引き分け';
        playerScore=0; cpuScore=0; currentRound=1;
      }, 800);
    } else {
      currentRound++; setTimeout(()=> startGame(currentDealer), 800);
    }
    return;
  }
  
    if (startingPlayer==='player' || startingPlayer==='cpu') currentDealer=startingPlayer;
    if (currentDealer==='player'){
      playerTurn=true; messageArea.textContent=`第${currentRound}回戦：あなたの番です。`;
    } else {
      playerTurn=false; messageArea.textContent=`第${currentRound}回戦：相手の番です。`;
      setTimeout(cpuTurnHandler, 900);
    }
    playerKoikoi=false; cpuKoikoi=false;

    playerHandArea.removeEventListener('click', playerHandClickHandler);
    playerHandArea.addEventListener('click', playerHandClickHandler);
  }

  function playerHandClickHandler(e){
    if (!playerTurn) return;
    const el=e.target.closest('.card'); if(!el) return;
    const card=el.textContent; if(!card) return;
    playerTurnHandler(card);
  }

  // イベント
  startGameButton.addEventListener('click', ()=> showScreen('rounds-screen'));
  roundButtons.forEach(btn=>{
    btn.addEventListener('click',(e)=>{
      totalRounds = parseInt(e.target.dataset.rounds,10);
      showScreen('game-screen');
      currentDealer='player'; startGame(currentDealer);
    });
  });

  koikoiButton.addEventListener('click', ()=>{
    actionButtons.style.display='none';
    playerKoikoi=true; playerHandArea.addEventListener('click', playerHandClickHandler);
    messageArea.textContent='こいこいを宣言しました。続行します。';
    playerTurn=false; setTimeout(cpuTurnHandler, 900);
  });

  shobuButton.addEventListener('click', ()=>{
    actionButtons.style.display='none';
    endRound('player');
  });

  restartButton?.addEventListener('click', ()=> showScreen('rounds-screen'));
  returnToTitleButton?.addEventListener('click', ()=> showScreen('title-screen'));

  // 初期画面
  showScreen('title-screen');

// ==== ここから置き換え ====

// 好みの「標準スケール」を決めます（例: 0.75 → 1440x810 相当）
// ここを変えれば“見やすい大きさ”を簡単に調整できます。
const PREFERRED_SCALE = 0.75;   // 0.70〜0.85 あたりがノートPCで見やすい目安
// （任意）あまりに小さくなりすぎるのを防ぐ下限。画面が超狭い場合は無視されます。
const MIN_COMFORT_SCALE = 0.60; // お好みで

function fitApp() {
  const app = document.getElementById('app');
  const baseW = 1920, baseH = 1080;

  const scaleX = window.innerWidth  / baseW;
  const scaleY = window.innerHeight / baseH;
  const scale  = Math.min(scaleX, scaleY);

  // 既存のスケール（中央寄せなど）はそのまま
  app.style.transform = `scale(${scale})`;
  app.style.transformOrigin = 'center center';

  // ここだけ変更：カードのサイズは #app にクラスで一括指定
  app.classList.remove('size-small', 'size-tiny');
  if (window.innerWidth < 1400 || window.innerHeight < 800) {
    app.classList.add('size-small');
  }
  if (window.innerWidth < 1100 || window.innerHeight < 650) {
    app.classList.remove('size-small');
    app.classList.add('size-tiny');
  }
}

window.addEventListener('resize', fitApp);
fitApp();

});
