import { getCardType } from './card-data.js';

export class YakuAssist {
  constructor() {
    this.active = false;
    this.hintBox = null;
  }

  enable() {
    this.active = true;
  }

  disable() {
    this.active = false;
    this.clearHint();
  }

  clearHint() {
    const hintBox = this.getHintBox();
    if (hintBox) {
      hintBox.textContent = '';
      hintBox.style.display = 'none';
    }
  }

  getHintBox() {
    if (this.hintBox && document.body.contains(this.hintBox)) {
      return this.hintBox;
    }
    const existing = document.getElementById('yaku-hint-box');
    if (existing) {
      this.hintBox = existing;
      return this.hintBox;
    }
    if (typeof document === 'undefined') return null;
    const fallback = document.createElement('div');
    fallback.id = 'yaku-hint-box';
    fallback.style.display = 'none';
    document.body.appendChild(fallback);
    this.hintBox = fallback;
    return this.hintBox;
  }

  checkAndShowHint(state) {
    if (!this.active) return;
    const hintBox = this.getHintBox();
    if (!hintBox) return;
    
    const captured = state.playerCaptured || [];
    const hand = state.playerHand || [];
    const board = state.board || [];
    
    // 簡易的なリーチ判定
    // あと1枚で完成する役を探す
    
    const potentialYakus = [
      { name: '猪鹿蝶', required: ['萩に猪','紅葉に鹿','牡丹に蝶'] },
      { name: '赤短', required: ['松に短冊','梅に短冊','桜に短冊'] },
      { name: '青短', required: ['牡丹に短冊','菊に短冊','紅葉に短冊'] },
      { name: '三光', type: '光', count: 3 },
      { name: '月見酒', required: ['芒に月', '菊に盃'] },
      { name: '花見酒', required: ['桜に幕', '菊に盃'] }
    ];

    let hint = '';

    for (const yaku of potentialYakus) {
      if (yaku.required) {
        const missing = yaku.required.filter(card => !captured.includes(card));
        if (missing.length === 1) {
          // その足りない1枚が、場にあるか、手札にあるか
          const target = missing[0];
          const inHand = hand.includes(target);
          const onBoard = board.includes(target);
          
          if (inHand || onBoard) {
            hint = `あと1枚で「${yaku.name}」です！`;
            break;
          }
        }
      } else if (yaku.type) {
        const currentCount = captured.filter(c => getCardType(c) === yaku.type).length;
        if (currentCount === yaku.count - 1) {
           // 光札などが場か手札にあるかチェックするのは少し複雑なので省略、あるいは簡易チェック
           hint = `あと1枚で「${yaku.name}」です！`;
           break;
        }
      }
    }

    if (hint) {
      hintBox.textContent = hint;
      hintBox.style.display = 'block';
    } else {
      this.clearHint();
    }
  }
}

export const yakuAssist = new YakuAssist();
