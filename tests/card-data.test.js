import test from 'node:test';
import assert from 'node:assert/strict';

if (typeof globalThis.window === 'undefined') {
  globalThis.window = {};
}

globalThis.window.hanafudaCardImages ??= {};
globalThis.window.__HANAFUDA_CARD_IMAGE_CONFIG__ ??= {};

const {
  checkYaku,
  scoreFromCaptured,
  RENAMED_CARD_NAMES
} = await import('../js/card-data.js');

const monthCard = (monthIndex, offset) => {
  const idx = (monthIndex * 4) + offset;
  const card = RENAMED_CARD_NAMES[idx];
  if (!card) {
    throw new Error(`カードが見つかりません (month=${monthIndex}, offset=${offset})`);
  }
  return card;
};

test('猪鹿蝶を正しく検出する', () => {
  const cards = [
    monthCard(6, 0), // 萩に猪
    monthCard(9, 0), // 紅葉に鹿
    monthCard(5, 0)  // 牡丹に蝶
  ];
  const yaku = checkYaku(cards);
  assert.ok(yaku.includes('猪鹿蝶'), '猪鹿蝶の役が成立するはずです');
});

test('短冊系の役と加点を計算できる', () => {
  const tanCards = [
    monthCard(0, 1), // 松に短冊
    monthCard(1, 1), // 梅に短冊
    monthCard(2, 1), // 桜に短冊
    monthCard(5, 1), // 牡丹に短冊
    monthCard(8, 1), // 菊に短冊
    monthCard(9, 1)  // 紅葉に短冊
  ];
  const result = scoreFromCaptured(tanCards);
  assert.ok(result.yakuList.includes('赤短'), '赤短が成立するはずです');
  assert.ok(result.yakuList.includes('青短'), '青短が成立するはずです');
  assert.ok(result.yakuList.includes('短冊'), '短冊が成立するはずです');
  assert.equal(result.basePoints, 12, '基礎点は 12 点のはずです');
});

test('カス 10 枚の加点を計算できる', () => {
  const kasuCards = [
    monthCard(0, 2), monthCard(0, 3),
    monthCard(1, 2), monthCard(1, 3),
    monthCard(2, 2), monthCard(2, 3),
    monthCard(3, 2), monthCard(3, 3),
    monthCard(4, 2), monthCard(4, 3)
  ];
  const result = scoreFromCaptured(kasuCards);
  assert.ok(result.yakuList.includes('カス'), 'カスが成立するはずです');
  assert.equal(result.basePoints, 1, 'カス 10 枚で 1 点加点されるはずです');
});
