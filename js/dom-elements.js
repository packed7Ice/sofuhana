import { RENAMED_CARD_NAMES, getCardMonth, getCardImage } from './card-data.js';

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
  reportButton: document.getElementById('report-button'),
  reportButtonGame: document.getElementById('report-button-game'),
  reportDestinationModal: document.getElementById('report-destination-modal'),
  reportDestinationGoogleButton: document.getElementById('report-select-google'),
  reportDestinationGithubButton: document.getElementById('report-select-github'),
  reportDestinationCloseButton: document.getElementById('report-destination-close'),
  helpModal: document.getElementById('help-modal'),
  helpCloseButton: document.getElementById('help-close'),
  reportConfirmModal: document.getElementById('report-confirm-modal'),
  reportConfirmYesButton: document.getElementById('report-confirm-yes'),
  reportConfirmNoButton: document.getElementById('report-confirm-no')
};

const REPORT_FORM_URL = 'https://forms.gle/pQR1UkhBo3bot6Gf7';
const REPORT_GITHUB_URL = 'https://github.com/packed7Ice/sofuhana/issues';

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
    bottomMessageTimer = null;
  }, duration);
}

export function showPersistentMessage(text){
  if (!messageArea) return;
  messageArea.textContent = text;
  messageArea.classList.add('show');
  if (bottomMessageTimer){
    clearTimeout(bottomMessageTimer);
    bottomMessageTimer = null;
  }
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
  const openHelp = () => {
    helpModal.style.display = 'flex';
    buildHelpContentOnce();
  };
  const closeHelp = () => { helpModal.style.display = 'none'; };
  helpButton?.addEventListener('click', openHelp);
  helpButtonGame?.addEventListener('click', openHelp);
  helpCloseButton?.addEventListener('click', closeHelp);
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) closeHelp();
  });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeHelp(); });
}

function openReportForm(){
  window.open(REPORT_FORM_URL, '_blank', 'noopener,noreferrer');
}

function openGithubIssues(){
  window.open(REPORT_GITHUB_URL, '_blank', 'noopener,noreferrer');
}

function openReportDestinationModal(){
  const { reportDestinationModal } = elements;
  if (!reportDestinationModal) return false;
  reportDestinationModal.style.display = 'flex';
  reportDestinationModal.setAttribute('aria-hidden', 'false');
  return true;
}

function hideReportDestinationModal(){
  const { reportDestinationModal } = elements;
  if (!reportDestinationModal) return;
  reportDestinationModal.style.display = 'none';
  reportDestinationModal.setAttribute('aria-hidden', 'true');
}

function setupReportDestinationModal(){
  const {
    reportDestinationModal,
    reportDestinationGoogleButton,
    reportDestinationGithubButton,
    reportDestinationCloseButton
  } = elements;

  if (!reportDestinationModal) return;

  const closeModal = () => hideReportDestinationModal();

  const handleGoogleSelect = (event) => {
    event?.preventDefault?.();
    closeModal();
    if (!showReportConfirmModal()) {
      openReportForm();
    }
  };

  const handleGithubSelect = (event) => {
    event?.preventDefault?.();
    closeModal();
    openGithubIssues();
  };

  reportDestinationGoogleButton?.addEventListener('click', handleGoogleSelect);
  reportDestinationGithubButton?.addEventListener('click', handleGithubSelect);
  reportDestinationCloseButton?.addEventListener('click', closeModal);

  reportDestinationModal.addEventListener('click', (event) => {
    if (event.target === reportDestinationModal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && reportDestinationModal.style.display === 'flex') {
      closeModal();
    }
  });
}

function showReportConfirmModal(){
  const { reportConfirmModal } = elements;
  if (!reportConfirmModal) return false;
  reportConfirmModal.style.display = 'flex';
  reportConfirmModal.setAttribute('aria-hidden', 'false');
  return true;
}

function hideReportConfirmModal(){
  const { reportConfirmModal } = elements;
  if (!reportConfirmModal) return;
  reportConfirmModal.style.display = 'none';
  reportConfirmModal.setAttribute('aria-hidden', 'true');
}

function setupReportConfirmModal(){
  const { reportConfirmModal, reportConfirmYesButton, reportConfirmNoButton } = elements;
  if (!reportConfirmModal) return;
  const closeModal = () => hideReportConfirmModal();

  reportConfirmNoButton?.addEventListener('click', closeModal);
  reportConfirmYesButton?.addEventListener('click', () => {
    closeModal();
    openReportForm();
  });

  reportConfirmModal.addEventListener('click', (event) => {
    if (event.target === reportConfirmModal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && reportConfirmModal.style.display === 'flex') {
      closeModal();
    }
  });
}

function setupReportButtons(){
  const { reportButton, reportButtonGame } = elements;
  if (!reportButton && !reportButtonGame) return;
  const handleClick = (event) => {
    event?.preventDefault?.();
    if (!openReportDestinationModal()) {
      if (!showReportConfirmModal()) {
        openReportForm();
      }
    }
  };
  reportButton?.addEventListener('click', handleClick);
  reportButtonGame?.addEventListener('click', handleClick);
}

setupHelpModal();
setupReportDestinationModal();
setupReportConfirmModal();
setupReportButtons();

export { elements };

// ==== Help Content Population ====
let helpBuilt = false;
function buildHelpContentOnce(){
  if (helpBuilt) return;
  try {
    // Remove legacy text-only yaku list if present
    const legacyGrid = document.querySelector('#help-modal .yaku-grid');
    if (legacyGrid){
      const prev = legacyGrid.previousElementSibling;
      if (prev && prev.tagName === 'H3') prev.remove();
      legacyGrid.remove();
    }
    renderMonthsGrid();
    renderYakuExamples();
    helpBuilt = true;
  } catch (e) {
    // fail silently to avoid breaking help open
    console?.warn?.('Failed to build help content', e);
  }
}

function createHelpCard(name){
  const el = document.createElement('div');
  el.className = 'card help-card';
  el.style.backgroundImage = `url('${getCardImage(name)}')`;
  el.title = name;
  el.setAttribute('aria-label', name);
  return el;
}

function renderMonthsGrid(){
  const container = document.getElementById('help-months');
  if (!container) return;
  container.innerHTML = '';

  const MONTHS = [
    { key: '松', label: '一月（松）' },
    { key: '梅', label: '二月（梅）' },
    { key: '桜', label: '三月（桜）' },
    { key: '藤', label: '四月（藤）' },
    { key: '菖蒲', label: '五月（菖蒲）' },
    { key: '牡丹', label: '六月（牡丹）' },
    { key: '萩', label: '七月（萩）' },
    { key: '芒', label: '八月（芒）' },
    { key: '菊', label: '九月（菊）' },
    { key: '紅葉', label: '十月（紅葉）' },
    { key: '柳', label: '十一月（柳）' },
    { key: '桐', label: '十二月（桐）' }
  ];

  // group cards by month using exported names (with duplicates tagged)
  const groups = new Map();
  for (const name of RENAMED_CARD_NAMES){
    const m = getCardMonth(name);
    if (!groups.has(m)) groups.set(m, []);
    groups.get(m).push(name);
  }

  for (const { key, label } of MONTHS){
    const row = document.createElement('div');
    row.className = 'month-row';

    const title = document.createElement('div');
    title.className = 'month-title';
    title.textContent = label;
    row.appendChild(title);

    const cardsWrap = document.createElement('div');
    cardsWrap.className = 'month-cards';
    (groups.get(key) || []).forEach(name => cardsWrap.appendChild(createHelpCard(name)));
    row.appendChild(cardsWrap);

    container.appendChild(row);
  }
}

function renderYakuExamples(){
  const container = document.getElementById('yaku-examples');
  if (!container) return;
  container.innerHTML = '';

  const EXAMPLES = [
    { title: '五光', points: '（15点）', cards: ['松に鶴','桜に幕','芒に月','柳に小野道風','桐に鳳凰'] },
    { title: '四光', points: '（8点）', cards: ['松に鶴','桜に幕','芒に月','桐に鳳凰'] },
    { title: '雨四光', points: '（7点）', cards: ['松に鶴','桜に幕','柳に小野道風','桐に鳳凰'] },
    { title: '三光', points: '（5点）', cards: ['松に鶴','桜に幕','芒に月'] },
    { title: '猪鹿蝶', points: '（5点）', cards: ['萩に猪','紅葉に鹿','牡丹に蝶'] },
      { title: '赤短', points: '（5点）', cards: ['松に短冊','梅に短冊','桜に短冊'] },
      { title: '青短', points: '（5点）', cards: ['牡丹に短冊','菊に短冊','紅葉に短冊'] },
    { title: '月見酒', points: '（5点）', cards: ['芒に月','菊に盃'] },
    { title: '花見酒', points: '（5点）', cards: ['桜に幕','菊に盃'] },
    { title: 'タネ', points: '（1+点）', cards: ['萩に猪','紅葉に鹿','牡丹に蝶','藤に時鳥','梅に鶯'] },
    { title: '短冊', points: '（1+点）', cards: ['松に短冊','梅に短冊','桜に短冊','菖蒲に短冊','柳に短冊'] },
    { title: 'カス', points: '（1+点）', cards: ['松','梅','桜','藤','菖蒲','牡丹','萩','芒','菊','紅葉'] }
  ];

  for (const { title, cards } of EXAMPLES){
    const block = document.createElement('div');
    block.className = 'yaku-example';

    const h = document.createElement('div');
    h.className = 'yaku-example-title';
    const nameEl = document.createElement('span');
    nameEl.textContent = title;
    const ptsEl = document.createElement('span');
    const ex = EXAMPLES.find(e => e.title === title);
    ptsEl.className = 'yaku-example-points';
    ptsEl.textContent = ex?.points || '';
    h.appendChild(nameEl);
    h.appendChild(ptsEl);
    block.appendChild(h);

    const wrap = document.createElement('div');
    wrap.className = 'yaku-example-cards';
    cards.forEach(name => wrap.appendChild(createHelpCard(name)));
    block.appendChild(wrap);

    container.appendChild(block);
  }
}
