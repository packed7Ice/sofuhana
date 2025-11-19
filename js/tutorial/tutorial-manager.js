import { state } from '../state.js';
import { TUTORIAL_SCENARIO, TUTORIAL_INITIAL_STATE } from './tutorial-scenario.js';
import { showTutorialMessage, hideTutorialMessage, highlightElement, clearHighlight } from './tutorial-ui.js';

export class TutorialManager {
  constructor() {
    this.isActive = false;
    this.currentStepIndex = 0;
    this.waitingForAction = null; // 'play_card', 'next', etc.
  }

  startTutorial() {
    this.isActive = true;
    this.currentStepIndex = 0;
    state.isTutorial = true;
    
    // チュートリアル用の初期状態をセット
    // 注意: これは dealCards の代わりに使用される
    this.setupTutorialState();
    
    this.showCurrentStep();
  }

  setupTutorialState() {
    state.playerHand = [...TUTORIAL_INITIAL_STATE.playerHand];
    state.cpuHand = [...TUTORIAL_INITIAL_STATE.cpuHand];
    state.board = [...TUTORIAL_INITIAL_STATE.board];
    state.deck = [...TUTORIAL_INITIAL_STATE.deck];
    state.playerCaptured = [];
    state.cpuCaptured = [];
    state.currentRound = 1;
    state.playerScore = 0;
    state.cpuScore = 0;
    state.playerTurn = true;
    state.currentDealer = 'player';
  }

  endTutorial() {
    this.isActive = false;
    state.isTutorial = false;
    hideTutorialMessage();
    clearHighlight();
    
    // タイトルに戻る
    // dom-elements.js の showScreen を使うために動的インポートか、グローバルな関数を使う
    // ここでは簡易的に window.location.reload() でリセットするか、
    // あるいは script.js で定義された関数を呼び出したいが、循環参照になる可能性があるため
    // カスタムイベントを発火して script.js 側で処理するのがきれい
    
    // 簡易実装としてリロード
    window.location.reload();
  }

  // ゲームの進行を一時停止させるためのPromiseを返す
  async pause() {
    if (!this.isActive) return;
    const step = TUTORIAL_SCENARIO[this.currentStepIndex];
    if (step && step.waitForConfirmation) {
      return new Promise(resolve => {
        this.resumeCallback = resolve;
      });
    }
  }

  nextStep() {
    if (this.resumeCallback) {
      this.resumeCallback();
      this.resumeCallback = null;
    }

    if (this.currentStepIndex >= TUTORIAL_SCENARIO.length - 1) {
      this.endTutorial();
      return;
    }
    this.currentStepIndex++;
    this.showCurrentStep();
  }

  showCurrentStep() {
    const step = TUTORIAL_SCENARIO[this.currentStepIndex];
    if (!step) return;

    const showNext = step.action === 'next' || step.waitForConfirmation || step.action === 'finish';
    const options = {
      position: step.position,
      buttonText: step.buttonText
    };

    showTutorialMessage(
      step.message, 
      showNext ? () => {
        if (step.action === 'finish') {
          this.endTutorial();
        } else {
          this.nextStep();
        }
      } : null,
      options
    );
    
    if (step.highlight) {
      highlightElement(step.highlight);
    } else {
      clearHighlight();
    }

    this.waitingForAction = step.action;
  }

  // プレイヤーがカードを出そうとした時のチェック
  checkPlayerAction(cardName) {
    if (!this.isActive) return true; // チュートリアルでなければ許可

    const step = TUTORIAL_SCENARIO[this.currentStepIndex];
    if (step.action === 'wait_for_play') {
      if (cardName === step.targetCard) {
        // 正しいカードを出した
        this.waitingForAction = null;
        hideTutorialMessage(); // 一旦隠す
        clearHighlight();
        // 次のステップへは、ゲームの進行に合わせて進める必要がある
        // ここでは許可だけ返す
        return true;
      } else {
        // 違うカードを出そうとした
        // 警告などを出すか、単に無視する
        return false;
      }
    }
    
    // 'next' 待ちなどの時にカードを出そうとしたらブロック
    return false;
  }

  // ゲームの進行に合わせて呼ばれるフック
  onPlayerPlayed() {
    if (!this.isActive) return;
    const step = TUTORIAL_SCENARIO[this.currentStepIndex];
    if (step.action === 'wait_for_play') {
      this.nextStep(); // play_card -> explain_draw
    }
  }

  onBeforeDraw() {
    if (!this.isActive) return;
    // explain_draw ステップで止まっているはずなので、ここでポーズさせる
    // ただし、pause() は script.js 側で呼ばれるので、ここでは何もしなくていいかもしれない
    // あるいは、ステップが進んでいない場合の保険
  }

  onAfterDraw() {
    if (!this.isActive) return;
    const step = TUTORIAL_SCENARIO[this.currentStepIndex];
    if (step.action === 'auto_draw') {
      // ここで自動で進まず、ユーザーの確認（次へボタン）を待つ
      // this.nextStep(); 
    }
  }

  onCpuTurnStart() {
    if (!this.isActive) return;
    // script.js 側で pause() されるため、ここでは何もしなくてよい
    // wait_for_cpu ステップが表示され、ユーザーが「次へ」を押すと pause() が解除されてCPUが動く
  }
  
  // CPUのターンが終わった後に呼ばれる
  onCpuTurnEnd() {
      if (!this.isActive) return;
      const step = TUTORIAL_SCENARIO[this.currentStepIndex];
      if (step.action === 'wait_for_cpu') {
          this.nextStep();
      }
  }
}

export const tutorialManager = new TutorialManager();
