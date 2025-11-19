import { checkYaku, getCardType, YAKU_POINTS } from './card-data.js';
import { showPersistentMessage } from './dom-elements.js';

export class YakuAssist {
  constructor() {
    this.active = false;
  }

  enable() {
    this.active = true;
  }

  disable() {
    this.active = false;
  }

  checkAndShowHint(state) {
    if (!this.active) return;
    
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

    // 専用のヒント表示要素を使用（card-info-boxを上書きしない）
    let hintBox = document.getElementById('yaku-hint-box');
    if (!hintBox) {
      hintBox = document.createElement('div');
      hintBox.id = 'yaku-hint-box';
      hintBox.style.cssText = `
        position: fixed;
        bottom: 120px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.85);
        color: #ffeb3b;
        font-weight: bold;
        padding: 12px 24px;
        border-radius: 8px;
        border: 2px solid #ffeb3b;
        z-index: 1000;
        font-size: 20px;
        display: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      `;
      document.body.appendChild(hintBox);
    }

    if (hint) {
      hintBox.textContent = hint;
      hintBox.style.display = 'block';
    } else {
      hintBox.style.display = 'none';
    }
  }
}

export const yakuAssist = new YakuAssist();
