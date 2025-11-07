import { state } from './state.js';
import { getCardImage, getCardBackImage, getCardType, getCardMonth } from './card-data.js';
import { elements } from './dom-elements.js';

const cardInfoBox = ensureTooltip();
const cardInfoMonth = cardInfoBox.querySelector('#card-info-month');
const cardInfoName  = cardInfoBox.querySelector('#card-info-name');
const cardInfoType  = cardInfoBox.querySelector('#card-info-type');

function ensureTooltip(){
  let tip = document.getElementById('card-info-box');
  if (!tip){
    tip = document.createElement('div');
    tip.id = 'card-info-box';
    tip.innerHTML = '<p id="card-info-month"></p><p id="card-info-name"></p><p id="card-info-type"></p>';
    document.body.appendChild(tip);
  }
  tip.style.display = 'none';
  tip.style.position = 'fixed';
  tip.style.zIndex = '9999';
  return tip;
}

function showTooltipForCard(card, targetEl){
  cardInfoMonth.textContent = `月: ${getCardMonth(card)}`;
  cardInfoName.textContent  = `札: ${card}`;
  cardInfoType.textContent  = `種別: ${getCardType(card)}`;
  positionTooltipAbove(targetEl);
  cardInfoBox.style.display = 'block';
}

export function hideTooltip(){
  cardInfoBox.style.display = 'none';
}

function positionTooltipAbove(el){
  const cardRect = el.getBoundingClientRect();
  const tipRect = cardInfoBox.getBoundingClientRect();
  const x = cardRect.left + cardRect.width / 2 - tipRect.width / 2;
  const y = cardRect.top - tipRect.height - 8;
  cardInfoBox.style.left = `${Math.max(8, Math.min(window.innerWidth - tipRect.width - 8, x))}px`;
  cardInfoBox.style.top = `${Math.max(8, y)}px`;
}

function renderCards(area, cards, isFaceDown = false){
  if (!area) return;
  area.innerHTML = '';
  cards.forEach(card => {
    const el = document.createElement('div');
    el.classList.add('card');
    if (isFaceDown){
      el.classList.add('back');
      const backImage = getCardBackImage();
      el.style.backgroundImage = backImage ? `url('${backImage}')` : '';
      el.textContent = '';
    } else {
      el.style.backgroundImage = `url('${getCardImage(card)}')`;
      el.textContent = card;
      el.addEventListener('mouseenter', () => showTooltipForCard(card, el));
      el.addEventListener('mouseleave', hideTooltip);
      el.addEventListener('mousemove', () => positionTooltipAbove(el));
    }
    area.appendChild(el);
  });
}

function updateCapturedUI(){
  const groupByType = (cards, type) => cards.filter(card => (
    type === '光'
      ? (getCardType(card) === '光' || getCardType(card) === '雨光')
      : getCardType(card) === type
  ));

  renderCards(elements.playerLightArea, groupByType(state.playerCaptured,'光'));
  renderCards(elements.playerTaneArea,  groupByType(state.playerCaptured,'タネ'));
  renderCards(elements.playerTanArea,   groupByType(state.playerCaptured,'短冊'));
  renderCards(elements.playerKasuArea,  groupByType(state.playerCaptured,'カス'));

  renderCards(elements.cpuLightArea, groupByType(state.cpuCaptured,'光'));
  renderCards(elements.cpuTaneArea,  groupByType(state.cpuCaptured,'タネ'));
  renderCards(elements.cpuTanArea,   groupByType(state.cpuCaptured,'短冊'));
  renderCards(elements.cpuKasuArea,  groupByType(state.cpuCaptured,'カス'));
}

export function updateUI(){
  renderCards(elements.boardArea, state.board);
  renderCards(elements.playerHandArea, state.playerHand);
  renderCards(elements.cpuHandArea, state.cpuHand, true);
  updateCapturedUI();

  if (elements.playerScoreSpan) elements.playerScoreSpan.textContent = state.playerScore;
  if (elements.cpuScoreSpan) elements.cpuScoreSpan.textContent = state.cpuScore;
  if (elements.currentRoundSpan) elements.currentRoundSpan.textContent = `第${state.currentRound}回戦`;

  if (elements.deckCount) elements.deckCount.textContent = String(state.deck.length);
  if (elements.deckImage) {
    const back = getCardBackImage() || 'images/back.png';
    elements.deckImage.src = back;
    elements.deckImage.style.opacity = state.deck.length > 0 ? '1' : '0.35';
  }

  if (elements.drawPreviewImage && !elements.drawPreviewImage.src) {
    elements.drawPreviewImage.removeAttribute('src');
  }
}
