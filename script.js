import { elements, messageArea, showBottomMessage, showPersistentMessage, showScreen, fitApp } from './js/dom-elements.js';
import { updateUI, hideTooltip } from './js/ui.js';
import { state, dealCards, initialHandBonus, DELAYS, sleep } from './js/state.js';
import { getCardMonth, getCardImage, checkYaku, scoreFromCaptured } from './js/card-data.js';

if (typeof window !== 'undefined'){
  window.addEventListener('beforeunload', () => {
    document.body?.setAttribute('data-boot','preload');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    initGame();
  } finally {
    document.body?.setAttribute('data-boot','ready');
  }
});

function initGame(){
  const {
    startGameButton,
    roundButtons,
    restartButton,
    returnToTitleButton,
    boardArea,
    playerHandArea,
    koikoiButton,
    shobuButton,
    actionButtons,
    resultMessageElement,
    finalPlayerScoreElement,
    finalCpuScoreElement,
    drawPreviewArea,
    drawPreviewImage
  } = elements;
  const ROUND_TRANSITION_DELAY = {
    // 各種遷移時間(ms)。演出を少し長くして状況を把握しやすくする。
    playerOrNagare: 1800,
    cpu: 2600,
    bonus: 1500
  };

  showScreen('title-screen');
  fitApp();
  window.addEventListener('resize', fitApp);

  function removeFromHand(card){
    const idx = state.playerHand.indexOf(card);
    if (idx > -1) state.playerHand.splice(idx,1);
  }

  function maybeNagare(){
    if (state.playerHand.length === 0 && state.cpuHand.length === 0){
      showBottomMessage('流れ。次戦へ移ります。');
      endRound('none');
      return true;
    }
    return false;
  }

  function resolveCapture(captured, taken){
    if (!taken.length) return false;
    captured.push(...taken);
    const yaku = checkYaku(captured);
    if (captured === state.playerCaptured && yaku.length > 0){
      if (state.playerKoikoi){
        const evalNow = scoreFromCaptured(state.playerCaptured);
        if (evalNow.basePoints > (state.playerKoikoiBasePoints || 0)){
          endRound('player');
          return true;
        }
        return false;
      }
      hideTooltip();
      showBottomMessage(`役ができました（${yaku.join('、')}）。こいこいしますか？`);
      if (actionButtons) actionButtons.style.display = 'flex';
      playerHandArea?.removeEventListener('click', playerHandClickHandler);
      updateUI();
      return true;
    }
    return false;
  }

  async function drawAndResolveDelayed(){
    if (state.deck.length === 0) {
      updateUI();
      return;
    }
    const drawn = state.deck.shift();
    updateUI();
    if (drawPreviewArea && drawPreviewImage){
      drawPreviewImage.src = getCardImage(drawn);
      drawPreviewArea.classList.add('visible');
    }
    await sleep(DELAYS.drawToBoard);

    const month = getCardMonth(drawn);
    const matches = [];
    state.board.forEach((boardCard, idx) => {
      if (getCardMonth(boardCard) === month) matches.push(idx);
    });

    if (matches.length === 0){
      state.board.push(drawn);
    } else if (matches.length === 1){
      const taken = [drawn, state.board.splice(matches[0],1)[0]];
      resolveCapture(state.playerTurn ? state.playerCaptured : state.cpuCaptured, taken);
    } else if (matches.length === 2){
      if (state.playerTurn){
        await highlightAndAwaitBoardChoiceForDraw(matches, drawn);
      } else {
        const chosen = matches[0];
        const taken = [drawn, state.board.splice(chosen,1)[0]];
        resolveCapture(state.cpuCaptured, taken);
      }
    } else {
      const sameMonth = state.board.filter(card => getCardMonth(card) === month);
      state.board = state.board.filter(card => getCardMonth(card) !== month);
      resolveCapture(state.playerTurn ? state.playerCaptured : state.cpuCaptured, [drawn, ...sameMonth]);
    }

    if (drawPreviewArea) drawPreviewArea.classList.remove('visible');
    updateUI();
  }

  function highlightAndAwaitBoardChoiceForDraw(matchIdxs, drawnCard){
    return new Promise((resolve) => {
      state.pendingSelection = { drawCard: drawnCard };
      const boardCards = Array.from(boardArea?.children || []);
      boardCards.forEach((el, idx) => el.classList.toggle('selectable', matchIdxs.includes(idx)));

      const onClick = (event) => {
        const el = event.target.closest('.card');
        if (!el) return;
        const idx = Array.from(boardArea?.children || []).indexOf(el);
        if (!matchIdxs.includes(idx)) return;

        boardArea?.removeEventListener('click', onClick);
        boardCards.forEach(cardEl => cardEl.classList.remove('selectable'));

        const taken = [state.pendingSelection.drawCard, state.board.splice(idx,1)[0]];
        resolveCapture(state.playerCaptured, taken);
        state.pendingSelection = null;

        if (drawPreviewArea) drawPreviewArea.classList.remove('visible');
        updateUI();
        resolve();
      };

      boardArea?.addEventListener('click', onClick);
      if (messageArea) messageArea.textContent = 'どちらを取るか選んでください。';
    });
  }
  function postPlayerAction(){
    updateUI();
    if (maybeNagare()) return;
    if (actionButtons && actionButtons.style.display !== 'flex'){
      state.playerTurn = false;
      showBottomMessage('相手の番です');
      setTimeout(cpuTurnHandler, 900);
    }
  }

  function highlightAndAwaitBoardChoice(matchIdxs, handCard){
    state.pendingSelection = { handCard };
    const boardCards = Array.from(boardArea?.children || []);
    boardCards.forEach((el, idx) => el.classList.toggle('selectable', matchIdxs.includes(idx)));

    const onClick = async (event) => {
      const el = event.target.closest('.card');
      if (!el) return;
      const idx = Array.from(boardArea?.children || []).indexOf(el);
      if (!matchIdxs.includes(idx)) return;

      boardArea?.removeEventListener('click', onClick);
      boardCards.forEach(cardEl => cardEl.classList.remove('selectable'));

      removeFromHand(state.pendingSelection.handCard);
      const taken = [state.pendingSelection.handCard, state.board.splice(idx,1)[0]];
      resolveCapture(state.playerCaptured, taken);
      state.pendingSelection = null;

      updateUI();
      await sleep(DELAYS.afterCaptureBeforeDraw);
      await drawAndResolveDelayed();
      postPlayerAction();
    };

    boardArea?.addEventListener('click', onClick);
  }

  async function playerTurnHandler(card){
    if (state.pendingSelection) return;
    const month = getCardMonth(card);
    const matches = [];
    state.board.forEach((boardCard, idx) => {
      if (getCardMonth(boardCard) === month) matches.push(idx);
    });

    if (matches.length === 0){
      removeFromHand(card);
      state.board.push(card);
      updateUI();
      await sleep(DELAYS.playToBoard);
      await drawAndResolveDelayed();
      postPlayerAction();
      return;
    }

    if (matches.length === 1){
      removeFromHand(card);
      const taken = [card, state.board.splice(matches[0],1)[0]];
      resolveCapture(state.playerCaptured, taken);
      updateUI();
      await sleep(DELAYS.afterCaptureBeforeDraw);
      await drawAndResolveDelayed();
      postPlayerAction();
      return;
    }

    if (matches.length === 2){
      messageArea.textContent = 'どちらの札を取るか選んでください。';
      highlightAndAwaitBoardChoice(matches, card);
      return;
    }

    removeFromHand(card);
    const sameMonth = state.board.filter(c => getCardMonth(c) === month);
    state.board = state.board.filter(c => getCardMonth(c) !== month);
    resolveCapture(state.playerCaptured, [card, ...sameMonth]);
    updateUI();
    await sleep(DELAYS.afterCaptureBeforeDraw);
    await drawAndResolveDelayed();
    postPlayerAction();
  }

  async function cpuTurnHandler(){
    hideTooltip();
    if (actionButtons) actionButtons.style.display = 'none';
    showBottomMessage('相手が思考中...');

    let played = null;
    let matches = [];
    for (let i = 0; i < state.cpuHand.length; i++){
      const card = state.cpuHand[i];
      const month = getCardMonth(card);
      matches = [];
      state.board.forEach((boardCard, idx) => {
        if (getCardMonth(boardCard) === month) matches.push(idx);
      });
      if (matches.length > 0){
        played = state.cpuHand.splice(i,1)[0];
        break;
      }
    }

    if (!played){
      const randomIndex = Math.floor(Math.random() * state.cpuHand.length);
      played = state.cpuHand.splice(randomIndex,1)[0];
      state.board.push(played);
      updateUI();
      await sleep(DELAYS.playToBoard);
      await drawAndResolveDelayed();
      updateUI();
      if (maybeNagare()) return;

      const cpuEvaluation = scoreFromCaptured(state.cpuCaptured);
      if (cpuEvaluation.basePoints > 0){
        let cpuEnds = false;
        if (cpuEvaluation.basePoints >= 7) cpuEnds = true;
        else if (state.deck.length <= 8 && cpuEvaluation.basePoints >= 5) cpuEnds = true;
        else cpuEnds = Math.random() < 0.5;

        if (cpuEnds){
          showBottomMessage('相手が勝負をかけました');
          endRound('cpu');
          return;
        }

        state.cpuKoikoi = true;
        showBottomMessage('相手は「こいこい」！');
        showBottomMessage('あなたの番です');
        state.playerTurn = true;
        return;
      }

      state.playerTurn = true;
        showBottomMessage('あなたの番です');
      return;
    }

    const month = getCardMonth(played);
    if (matches.length === 1){
      const taken = [played, state.board.splice(matches[0],1)[0]];
      resolveCapture(state.cpuCaptured, taken);
    } else if (matches.length >= 2){
      if (matches.length >= 3){
        const sameMonth = state.board.filter(card => getCardMonth(card) === month);
        state.board = state.board.filter(card => getCardMonth(card) !== month);
        resolveCapture(state.cpuCaptured, [played, ...sameMonth]);
      } else {
        const chosen = matches[0];
        const taken = [played, state.board.splice(chosen,1)[0]];
        resolveCapture(state.cpuCaptured, taken);
      }
    }

    updateUI();
    await sleep(DELAYS.afterCaptureBeforeDraw);
    await drawAndResolveDelayed();
    updateUI();
    if (maybeNagare()) return;

    const cpuEvaluation = scoreFromCaptured(state.cpuCaptured);
    if (cpuEvaluation.basePoints > 0){
      let cpuEnds = false;
      if (cpuEvaluation.basePoints >= 7) cpuEnds = true;
      else if (state.deck.length <= 8 && cpuEvaluation.basePoints >= 5) cpuEnds = true;
      else cpuEnds = Math.random() < 0.5;

      if (cpuEnds){
          showBottomMessage('相手が勝負をかけました');
        endRound('cpu');
        return;
      }

      state.cpuKoikoi = true;
      showBottomMessage('相手は「こいこい」！');
        showBottomMessage('あなたの番です');
      state.playerTurn = true;
      return;
    }

    state.playerTurn = true;
        showBottomMessage('あなたの番です');
  }

  function endRound(winner){
    if (actionButtons) actionButtons.style.display = 'none';
    const playerResult = scoreFromCaptured(state.playerCaptured);
    const cpuResult = scoreFromCaptured(state.cpuCaptured);

    let playerGain = 0;
    let cpuGain = 0;
    let nextDealer = state.currentDealer;
    let roundMessage = '';

    if (winner === 'player'){
      playerGain = playerResult.basePoints;
      if (playerGain >= 7) playerGain *= 2;
      if (state.cpuKoikoi) playerGain *= 2;
      state.playerScore += playerGain;
      roundMessage = `あなたの勝ち！ ${playerGain}点獲得（役: ${playerResult.yakuList.join('、') || 'なし'}）。`;
      nextDealer = 'player';
    } else if (winner === 'cpu'){
      showBottomMessage('相手が上がりました');
      cpuGain = cpuResult.basePoints;
      if (cpuGain >= 7) cpuGain *= 2;
      if (state.playerKoikoi) cpuGain *= 2;
      state.cpuScore += cpuGain;
      roundMessage = `相手の勝ち。${cpuGain}点獲得（役: ${cpuResult.yakuList.join('、') || 'なし'}）。`;
      nextDealer = 'cpu';
    } else {
      roundMessage = '流れ（引き分け）です。次の親は交代します。';
      nextDealer = state.currentDealer === 'player' ? 'cpu' : 'player';
    }

    if (roundMessage) showPersistentMessage(roundMessage);

    const nextDelay = (winner === 'cpu')
      ? ROUND_TRANSITION_DELAY.cpu
      : ROUND_TRANSITION_DELAY.playerOrNagare;
    if (state.currentRound >= state.totalRounds){
      setTimeout(() => {
        showScreen('result-screen');
        if (finalPlayerScoreElement) finalPlayerScoreElement.textContent = state.playerScore;
        if (finalCpuScoreElement) finalCpuScoreElement.textContent = state.cpuScore;
        if (resultMessageElement){
          if (state.playerScore > state.cpuScore) resultMessageElement.textContent = 'あなたの勝利！';
          else if (state.cpuScore > state.playerScore) resultMessageElement.textContent = '相手の勝ち...';
          else resultMessageElement.textContent = '引き分け';
        }
        state.playerScore = 0;
        state.cpuScore = 0;
        state.currentRound = 1;
      }, nextDelay);
    } else {
      state.currentRound += 1;
      state.currentDealer = nextDealer;
      setTimeout(() => startGame(state.currentDealer), nextDelay);
    }
  }

  function startGame(startingPlayer = 'player'){
    if (actionButtons) actionButtons.style.display = 'none';
    state.pendingSelection = null;
    dealCards();
    updateUI();

    const playerBonus = initialHandBonus(state.playerHand);
    const cpuBonus = initialHandBonus(state.cpuHand);
    if (playerBonus || cpuBonus){
      if (playerBonus && !cpuBonus){
        state.playerScore += 6;
        state.currentDealer = 'player';
        messageArea.textContent = 'あなたが親手四枚！ 6点獲得。';
      } else if (cpuBonus && !playerBonus){
        state.cpuScore += 6;
        state.currentDealer = 'cpu';
        messageArea.textContent = '相手が親手四枚！ 6点獲得。';
      } else {
        messageArea.textContent = '両者とも親手四枚！ 6点ずつ。';
      }

      if (state.currentRound >= state.totalRounds){
        setTimeout(() => {
          showScreen('result-screen');
          if (finalPlayerScoreElement) finalPlayerScoreElement.textContent = state.playerScore;
          if (finalCpuScoreElement) finalCpuScoreElement.textContent = state.cpuScore;
          if (resultMessageElement){
            if (state.playerScore > state.cpuScore) resultMessageElement.textContent = 'あなたの勝利！';
            else if (state.cpuScore > state.playerScore) resultMessageElement.textContent = '相手の勝ち...';
            else resultMessageElement.textContent = '引き分け';
          }
          state.playerScore = 0;
          state.cpuScore = 0;
          state.currentRound = 1;
        }, ROUND_TRANSITION_DELAY.bonus);
      } else {
        state.currentRound += 1;
        setTimeout(() => startGame(state.currentDealer), ROUND_TRANSITION_DELAY.bonus);
      }
      return;
    }

    if (startingPlayer === 'player' || startingPlayer === 'cpu'){
      state.currentDealer = startingPlayer;
    }

    if (state.currentDealer === 'player'){
      state.playerTurn = true;
      messageArea.textContent = `第${state.currentRound}回戦：あなたの番です。`;
    } else {
      state.playerTurn = false;
      messageArea.textContent = `第${state.currentRound}回戦：相手の番です。`;
      setTimeout(cpuTurnHandler, 900);
    }

    state.playerKoikoi = false;
    state.cpuKoikoi = false;

    playerHandArea?.removeEventListener('click', playerHandClickHandler);
    playerHandArea?.addEventListener('click', playerHandClickHandler);
  }

  function playerHandClickHandler(event){
    if (!state.playerTurn) return;
    const el = event.target.closest('.card');
    if (!el) return;
    const card = el.dataset?.card || el.textContent;
    if (!card) return;
    playerTurnHandler(card);
  }

  startGameButton?.addEventListener('click', () => showScreen('rounds-screen'));

  Array.from(roundButtons || []).forEach(btn => {
    btn.addEventListener('click', (event) => {
      const rounds = parseInt(event.currentTarget.dataset.rounds, 10);
      state.totalRounds = Number.isFinite(rounds) ? rounds : 3;
      showScreen('game-screen');
      state.currentDealer = 'player';
      startGame(state.currentDealer);
    });
  });

  koikoiButton?.addEventListener('click', () => {
    if (actionButtons) actionButtons.style.display = 'none';
    state.playerKoikoi = true;
    const evalNow = scoreFromCaptured(state.playerCaptured);
    state.playerKoikoiBasePoints = evalNow.basePoints || 0;
    playerHandArea?.addEventListener('click', playerHandClickHandler);
    messageArea.textContent = '続行を選びました。こいこい！';
    showBottomMessage('あなたは「こいこい」！');
    state.playerTurn = false;
    setTimeout(cpuTurnHandler, 900);
  });

  shobuButton?.addEventListener('click', () => {
    if (actionButtons) actionButtons.style.display = 'none';
    endRound('player');
  });

  restartButton?.addEventListener('click', () => showScreen('rounds-screen'));
  returnToTitleButton?.addEventListener('click', () => showScreen('title-screen'));
}


