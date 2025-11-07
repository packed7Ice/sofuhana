import { RENAMED_CARD_NAMES, getCardMonth, shuffle } from './card-data.js';

const allCards = [...RENAMED_CARD_NAMES];

export const state = {
  deck: [],
  playerHand: [],
  cpuHand: [],
  board: [],
  playerCaptured: [],
  cpuCaptured: [],
  playerTurn: true,
  totalRounds: 0,
  currentRound: 1,
  playerScore: 0,
  cpuScore: 0,
  playerKoikoi: false,
  cpuKoikoi: false,
  currentDealer: 'player',
  pendingSelection: null
};

export const DELAYS = {
  playToBoard: 450,
  afterCaptureBeforeDraw: 500,
  drawToBoard: 1200
};

export const sleep = (ms) => new Promise(res => setTimeout(res, ms));

export function dealCards(){
  do {
    state.deck = shuffle([...allCards]);
    state.playerHand = state.deck.splice(0,8);
    state.cpuHand    = state.deck.splice(0,8);
    state.board      = state.deck.splice(0,8);
  } while (hasFourOfSameMonth(state.board));

  state.playerCaptured = [];
  state.cpuCaptured = [];
}

function hasFourOfSameMonth(cards){
  const counts = {};
  cards.forEach(card => {
    const month = getCardMonth(card);
    counts[month] = (counts[month] || 0) + 1;
  });
  return Object.values(counts).some(count => count === 4);
}

export function initialHandBonus(hand){
  const counts = {};
  hand.forEach(card => {
    const month = getCardMonth(card);
    counts[month] = (counts[month] || 0) + 1;
  });
  const fourOfKind = Object.values(counts).some(count => count === 4);
  const fourPairs = Object.values(counts).filter(count => count >= 2).length >= 4;
  return fourOfKind || fourPairs;
}
