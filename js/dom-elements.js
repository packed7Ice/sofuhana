const elements = {
  appRoot: document.getElementById('app'),
  titleScreen: document.getElementById('title-screen'),
  roundsScreen: document.getElementById('rounds-screen'),
  gameScreen: document.getElementById('game-screen'),
  resultScreen: document.getElementById('result-screen'),
  startGameButton: document.getElementById('start-game-button'),
  roundButtons: document.querySelectorAll('.round-button'),
  restartButton: document.getElementById('restart-button'),
  returnToTitleButton: document.getElementById('return-to-title-button'),
  boardArea: document.getElementById('board-area'),
  playerHandArea: document.getElementById('player-hand-area'),
  cpuHandArea: document.getElementById('cpu-hand-area'),
  koikoiButton: document.getElementById('koikoi-button'),
  shobuButton: document.getElementById('shobu-button'),
  actionButtons: document.getElementById('action-buttons'),
  playerScoreSpan: document.getElementById('player-score'),
  cpuScoreSpan: document.getElementById('cpu-score'),
  currentRoundSpan: document.getElementById('current-round'),
  playerLightArea: document.getElementById('player-light-area'),
  playerTaneArea: document.getElementById('player-tane-area'),
  playerTanArea: document.getElementById('player-tan-area'),
  playerKasuArea: document.getElementById('player-kasu-area'),
  cpuLightArea: document.getElementById('cpu-light-area'),
  cpuTaneArea: document.getElementById('cpu-tane-area'),
  cpuTanArea: document.getElementById('cpu-tan-area'),
  cpuKasuArea: document.getElementById('cpu-kasu-area'),
  resultMessageElement: document.getElementById('result-message'),
  finalPlayerScoreElement: document.getElementById('final-player-score'),
  finalCpuScoreElement: document.getElementById('final-cpu-score'),
  drawPreviewArea: document.getElementById('draw-preview-area'),
  drawPreviewImage: document.getElementById('draw-preview-image'),
  deckCount: document.getElementById('deck-count'),
  deckImage: document.getElementById('deck-image'),
  helpButton: document.getElementById('help-button'),
  helpButtonGame: document.getElementById('help-button-game'),
  helpModal: document.getElementById('help-modal'),
  helpCloseButton: document.getElementById('help-close')
};

function createMessageArea(){
  const el = document.createElement('div');
  el.className = 'game-message';
  el.id = 'message';
  el.setAttribute('role','status');
  el.setAttribute('aria-live','polite');
  elements.gameScreen?.appendChild(el);
  return el;
}

export const messageArea = document.getElementById('message') || createMessageArea();

let bottomMessageTimer = null;
export function showBottomMessage(text, duration = 2500){
  if (!messageArea) return;
  messageArea.textContent = text;
  messageArea.classList.add('show');
  if (bottomMessageTimer) clearTimeout(bottomMessageTimer);
  bottomMessageTimer = setTimeout(() => {
    messageArea.classList.remove('show');
  }, duration);
}

export function showScreen(id){
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
    screen.style.opacity = '0';
    screen.style.zIndex = '1';
  });
  const target = document.getElementById(id);
  if (target){
    target.classList.add('active');
    target.style.opacity = '1';
    target.style.zIndex = '100';
  }
}

export function fitApp(){
  const app = elements.appRoot;
  if (!app) return;
  const baseW = 1920;
  const baseH = 1080;
  const scaleX = window.innerWidth / baseW;
  const scaleY = window.innerHeight / baseH;
  const scale = Math.min(scaleX, scaleY);
  app.style.transform = `scale(${scale})`;
  app.style.transformOrigin = 'center center';
  app.classList.remove('size-small', 'size-tiny');
  if (window.innerWidth < 1400 || window.innerHeight < 800) {
    app.classList.add('size-small');
  }
  if (window.innerWidth < 1100 || window.innerHeight < 650) {
    app.classList.remove('size-small');
    app.classList.add('size-tiny');
  }
}

function setupHelpModal(){
  const { helpButton, helpButtonGame, helpModal, helpCloseButton } = elements;
  if (!helpModal) return;
  const openHelp = () => { helpModal.style.display = 'flex'; };
  const closeHelp = () => { helpModal.style.display = 'none'; };
  helpButton?.addEventListener('click', openHelp);
  helpButtonGame?.addEventListener('click', openHelp);
  helpCloseButton?.addEventListener('click', closeHelp);
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) closeHelp();
  });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeHelp(); });
}

setupHelpModal();

export { elements };
