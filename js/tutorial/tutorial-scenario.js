export const TUTORIAL_SCENARIO = [
  {
    id: 'intro',
    message: '「そふ花」へようこそ！<br>このチュートリアルでは、花札（こいこい）の基本的な遊び方を説明します。<br>まずは画面をクリックして進めてください。',
    action: 'next',
    highlight: null,
    position: 'center',
    buttonText: '次へ'
  },
  {
    id: 'hand_explanation',
    message: 'これがあなたの「手札」です。<br>自分の番では、まず手札から1枚選んで場に出します。',
    action: 'next',
    highlight: '#player-hand-area',
    position: 'top',
    buttonText: '次へ'
  },
  {
    id: 'board_explanation',
    message: 'これが「場札」です。<br>手札と同じ「月（植物の種類）」の札が場にあれば、その札を取ることができます。',
    action: 'next',
    highlight: '#board-area',
    position: 'bottom', // 場札が見えるように下へ
    buttonText: '次へ'
  },
  {
    id: 'play_card',
    message: 'では、実際にやってみましょう。<br>手札の「松に鶴（1月）」をクリックして出してください。<br>場の「松に短冊」と合わせることができます。',
    action: 'wait_for_play',
    targetCard: '松に鶴',
    highlight: '[data-card="松に鶴"]',
    position: 'top'
  },
  {
    id: 'explain_draw',
    message: '手札を出した後は、山札から1枚引きます。<br>これは自動で行われます。',
    action: 'next', // ここで一旦止める（onBeforeDrawで進む）
    highlight: '#deck-area',
    position: 'center',
    waitForConfirmation: true,
    buttonText: '次へ'
  },
  {
    id: 'draw_card',
    message: '山札から引いた札も、場の札と同じ月なら取ることができます。<br>取った札は自分の「持ち札」になります。',
    action: 'auto_draw', // 実際のドロー処理を待つ
    highlight: '.captured-player',
    position: 'top',
    // ここはドロー後の結果を見せるため、ドロー完了を待つ
  },
  {
    id: 'match_explanation',
    message: 'このようにして、手札と場札、山札と場札を合わせて札を集めていきます。',
    action: 'next',
    highlight: '.captured-player',
    position: 'top',
    buttonText: '次へ'
  },
  {
    id: 'cpu_turn',
    message: '次は相手の番です。<br>相手も同じように手札を出し、山札を引きます。',
    action: 'wait_for_cpu',
    highlight: '.player-cpu-area',
    position: 'bottom'
  },
  {
    id: 'yaku_explanation',
    message: '特定の組み合わせの札を集めると「役（やく）」ができます。<br>役ができると点数になります。',
    action: 'next',
    highlight: '#card-info-box', 
    position: 'center',
    buttonText: '次へ'
  },
  {
    id: 'finish',
    message: 'チュートリアルは以上です。<br>実際に遊んで役を覚えていきましょう！',
    action: 'finish',
    highlight: null,
    position: 'center',
    buttonText: '終了'
  }
];

// チュートリアル用の固定デッキ設定
// プレイヤーに「松に鶴」、場に「松に短冊」などを配置して確実に取れるようにする
export const TUTORIAL_INITIAL_STATE = {
  playerHand: ['松に鶴', '梅に鶯', '桜に幕', '藤に時鳥', '菖蒲に八橋', '牡丹に蝶', '萩に猪', '芒に月'],
  cpuHand:    ['菊に盃', '紅葉に鹿', '柳に小野道風', '桐に鳳凰', '松', '梅', '桜', '藤'],
  board:      ['松に短冊', '梅に短冊', '桜に短冊', '藤に短冊', '菖蒲に短冊', '牡丹に短冊', '萩に短冊', '芒に雁'],
  deck:       ['菊に短冊', '紅葉に短冊', '柳に短冊', '桐', '松', '梅', '桜', '藤'] // 適当な残り
};
