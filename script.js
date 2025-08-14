document.addEventListener('DOMContentLoaded', () => {
    // 画面要素の取得
    const titleScreen = document.getElementById('title-screen');
    const roundsScreen = document.getElementById('rounds-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultScreen = document.getElementById('result-screen');

    const startGameButton = document.getElementById('start-game-button');
    const roundButtons = document.querySelectorAll('.round-button');
    const restartButton = document.getElementById('restart-button');
    const returnToTitleButton = document.getElementById('return-to-title-button');

    // ゲーム画面の要素
    const boardArea = document.getElementById('board-area');
    const playerHandArea = document.getElementById('player-hand-area');
    const cpuHandArea = document.getElementById('cpu-hand-area');
    const messageArea = document.getElementById('message');
    const koikoiButton = document.getElementById('koikoi-button');
    const shobuButton = document.getElementById('shobu-button');
    const actionButtons = document.getElementById('action-buttons');
    const playerScoreSpan = document.getElementById('player-score');
    const cpuScoreSpan = document.getElementById('cpu-score');
    const currentRoundSpan = document.getElementById('current-round');
    const playerLightArea = document.getElementById('player-light-area');
    const playerTaneArea = document.getElementById('player-tane-area');
    const playerTanArea = document.getElementById('player-tan-area');
    const playerKasuArea = document.getElementById('player-kasu-area');
    const cpuLightArea = document.getElementById('cpu-light-area');
    const cpuTaneArea = document.getElementById('cpu-tane-area');
    const cpuTanArea = document.getElementById('cpu-tan-area');
    const cpuKasuArea = document.getElementById('cpu-kasu-area');

    // script.js の DOM要素の取得部分に追加
    const cardInfoBox = document.getElementById('card-info-box');
    const cardInfoMonth = document.getElementById('card-info-month');
    const cardInfoName = document.getElementById('card-info-name');
    const cardInfoType = document.getElementById('card-info-type');

    // リザルト画面の要素
    const resultMessageElement = document.getElementById('result-message');
    const finalPlayerScoreElement = document.getElementById('final-player-score');
    const finalCpuScoreElement = document.getElementById('final-cpu-score');

    // 花札の定義
    const allCards = [
        '松に鶴', '松に短冊', '松', '松',
        '梅に鶯', '梅に短冊', '梅', '梅',
        '桜に幕', '桜に短冊', '桜', '桜',
        '藤に不如帰', '藤に短冊', '藤', '藤',
        '菖蒲に八ツ橋', '菖蒲に短冊', '菖蒲', '菖蒲',
        '牡丹に蝶', '牡丹に短冊', '牡丹', '牡丹',
        '萩に猪', '萩に短冊', '萩', '萩',
        '芒に月', '芒に雁', '芒', '芒',
        '菊に杯', '菊に短冊', '菊', '菊',
        '紅葉に鹿', '紅葉に短冊', '紅葉', '紅葉',
        '柳に小野道風', '柳に燕', '柳に短冊', '柳',
        '桐に鳳凰', '桐', '桐', '桐'
    ];

    // 役と点数の定義
    const YAKU_POINTS = {
        '五光': 15, '四光': 8, '雨四光': 7, '三光': 5,
        '猪鹿蝶': 5, '赤短': 5, '青短': 5,
        'タネ': 1, '短冊': 1, 'カス': 1
    };

    // ゲームの状態を管理する変数
    let deck = [];
    let playerHand = [];
    let cpuHand = [];
    let board = [];
    let playerCaptured = [];
    let cpuCaptured = [];
    let playerTurn = true;
    let totalRounds = 0;
    let currentRound = 1;
    let playerScore = 0;
    let cpuScore = 0;
    let playerKoikoi = false;
    let cpuKoikoi = false;

    // カード名からファイル名を生成するヘルパー関数
    function getCardImage(cardName) {
        const fileName = cardName
            .replace(/に/g, '_')
            .replace(/ /g, '_')
            .toLowerCase();
        return `images/cards/${fileName}.png`;
    }

    // script.js のどこかに、ヘルパー関数として追加
    function getCardMonth(cardName) {
        // 例: '松に鶴' -> '松', '桜' -> '桜'
        const parts = cardName.split('に');
        return parts[0];
    }

    // シャッフル関数
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 札を配る関数
    function dealCards() {
        deck = shuffle([...allCards]);
        playerHand = deck.splice(0, 8);
        cpuHand = deck.splice(0, 8);
        board = deck.splice(0, 8);
        playerCaptured = [];
        cpuCaptured = [];
    }

    // 画面の札を再描画する関数
/* script.js の renderCards 関数の抜粋 */
function renderCards(area, cards, isFaceDown = false) {
    area.innerHTML = '';
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        
        if (isFaceDown) {
            cardElement.classList.add('back');
        } else {
            cardElement.style.backgroundImage = `url('${getCardImage(card)}')`;
            cardElement.textContent = card;
            
            // マウスオーバーイベントを追加
            cardElement.addEventListener('mouseover', () => {
                const month = getCardMonth(card);
                const type = getCardType(card);
                
                cardInfoMonth.textContent = `月: ${month}`;
                cardInfoName.textContent = `札: ${card}`;
                cardInfoType.textContent = `種類: ${type}`;
                cardInfoBox.style.display = 'block';
            });

            // マウスアウトイベントを追加
            cardElement.addEventListener('mouseout', () => {
                cardInfoBox.style.display = 'none';
            });
        }
        
        area.appendChild(cardElement);
    });
}

    // UIをまとめて更新する関数
    function updateUI() {
        renderCards(boardArea, board);
        renderCards(playerHandArea, playerHand);
        renderCards(cpuHandArea, cpuHand, true);
        
        const playerCapturedSorted = {
            '光': playerCaptured.filter(c => getCardType(c) === '光' || getCardType(c) === '雨光'),
            'タネ': playerCaptured.filter(c => getCardType(c) === 'タネ'),
            '短冊': playerCaptured.filter(c => getCardType(c) === '短冊'),
            'カス': playerCaptured.filter(c => getCardType(c) === 'カス')
        };
        renderCards(playerLightArea, playerCapturedSorted['光']);
        renderCards(playerTaneArea, playerCapturedSorted['タネ']);
        renderCards(playerTanArea, playerCapturedSorted['短冊']);
        renderCards(playerKasuArea, playerCapturedSorted['カス']);

        const cpuCapturedSorted = {
            '光': cpuCaptured.filter(c => getCardType(c) === '光' || getCardType(c) === '雨光'),
            'タネ': cpuCaptured.filter(c => getCardType(c) === 'タネ'),
            '短冊': cpuCaptured.filter(c => getCardType(c) === '短冊'),
            'カス': cpuCaptured.filter(c => getCardType(c) === 'カス')
        };
        renderCards(cpuLightArea, cpuCapturedSorted['光']);
        renderCards(cpuTaneArea, cpuCapturedSorted['タネ']);
        renderCards(cpuTanArea, cpuCapturedSorted['短冊']);
        renderCards(cpuKasuArea, cpuCapturedSorted['カス']);

        playerScoreSpan.textContent = playerScore;
        cpuScoreSpan.textContent = cpuScore;
        currentRoundSpan.textContent = `第${currentRound}回戦`;
    }

    // 札の分類ヘルパー関数
    function getCardType(cardName) {
        if (cardName === '松に鶴' || cardName === '桜に幕' || cardName === '芒に月' || cardName === '桐に鳳凰') {
            return '光';
        }
        if (cardName === '柳に小野道風') {
            return '雨光';
        }
        if (cardName.includes('短冊')) {
            return '短冊';
        }
        if (cardName === '萩に猪' || cardName === '紅葉に鹿' || cardName === '牡丹に蝶' ||
            cardName === '梅に鶯' || cardName === '藤に不如帰' || cardName === '菖蒲に八ツ橋' ||
            cardName === '芒に雁' || cardName === '柳に燕' || cardName === '菊に杯') {
            return 'タネ';
        }
        return 'カス';
    }

    // 役の判定関数（メインロジック）
    function checkYaku(cards) {
        const yakuList = [];
        const cardTypes = cards.map(getCardType);

        const inoshikachoCards = ['萩に猪', '紅葉に鹿', '牡丹に蝶'];
        if (inoshikachoCards.every(card => cards.includes(card))) {
            yakuList.push('猪鹿蝶');
        }

        if (['松に短冊', '梅に短冊', '桜に短冊'].every(card => cards.includes(card))) {
            yakuList.push('赤短');
        }
        if (['牡丹に短冊', '菊に短冊', '紅葉に短冊'].every(card => cards.includes(card))) {
            yakuList.push('青短');
        }

        const lightCards = cards.filter(card => getCardType(card) === '光' || getCardType(card) === '雨光');
        if (lightCards.length === 5) {
            yakuList.push('五光');
        } else if (lightCards.length === 4) {
            if (lightCards.some(card => getCardType(card) === '雨光')) {
                yakuList.push('雨四光');
            } else {
                yakuList.push('四光');
            }
        } else if (lightCards.length === 3) {
            yakuList.push('三光');
        }

        const tan_count = cards.filter(card => getCardType(card) === '短冊').length;
        if (tan_count >= 5) {
            yakuList.push('短冊');
        }
        const tane_count = cards.filter(card => getCardType(card) === 'タネ').length;
        if (tane_count >= 5) {
            yakuList.push('タネ');
        }
        const kasu_count = cards.filter(card => getCardType(card) === 'カス').length;
        if (kasu_count >= 10) {
            yakuList.push('カス');
        }

        return yakuList;
    }

    // 役から得点を計算する関数
    function calculateScore(yakuList) {
        let score = 0;
        yakuList.forEach(yaku => {
            score += YAKU_POINTS[yaku];
        });
        return score;
    }
    
// script.js の endRound 関数を以下に書き換え

function endRound(winner) {
    const playerYakuList = checkYaku(playerCaptured);
    const cpuYakuList = checkYaku(cpuCaptured);
    
    let playerScoreForRound = calculateScore(playerYakuList);
    let cpuScoreForRound = calculateScore(cpuYakuList);
    
    // 次の親を決定する変数
    let nextTurn = null;

    if (winner === 'player') {
        if (cpuKoikoi) {
            playerScoreForRound *= 2;
        } else if (playerKoikoi && playerScoreForRound > 0) {
            playerScoreForRound *= 2;
        }
        playerScore += playerScoreForRound;
        messageArea.textContent = `勝負！あなたの勝ちです！${playerScoreForRound}点獲得しました。`;
        nextTurn = 'player'; // プレイヤーが勝利したので、次の親はプレイヤー
    } else if (winner === 'cpu') {
        if (playerKoikoi) {
            cpuScoreForRound *= 2;
        } else if (cpuKoikoi && cpuScoreForRound > 0) {
            cpuScoreForRound *= 2;
        }
        cpuScore += cpuScoreForRound;
        messageArea.textContent = `勝負！相手の勝ちです！${cpuScoreForRound}点獲得しました。`;
        nextTurn = 'cpu'; // CPUが勝利したので、次の親はCPU
    } else {
        messageArea.textContent = '引き分けです。';
        // 引き分けの場合は親を交代しない
        nextTurn = 'current'; // ここは現状維持
    }
    
    if (currentRound >= totalRounds) {
        setTimeout(() => {
            showScreen('result-screen');
            finalPlayerScoreElement.textContent = playerScore;
            finalCpuScoreElement.textContent = cpuScore;
            if (playerScore > cpuScore) {
                resultMessageElement.textContent = 'あなたの勝利！';
            } else if (cpuScore > playerScore) {
                resultMessageElement.textContent = 'あなたの敗北...';
            } else {
                resultMessageElement.textContent = '引き分けです。';
            }
            playerScore = 0;
            cpuScore = 0;
            currentRound = 1;
        }, 3000);
    } else {
        currentRound++;
        setTimeout(() => {
            startGame(nextTurn); // 次の親を引数として渡す
        }, 3000);
    }
}

    // プレイヤーのターン進行処理
    function playerTurnHandler(playerCard) {
        const cardIndex = playerHand.indexOf(playerCard);
        if (cardIndex > -1) {
            playerHand.splice(cardIndex, 1);
        }

        let matchedCards = [];
        const month = playerCard.split('に')[0];
        const boardMatchIndex = board.findIndex(bCard => bCard.startsWith(month));

        if (boardMatchIndex > -1) {
            matchedCards.push(playerCard, board.splice(boardMatchIndex, 1)[0]);
        } else {
            board.push(playerCard);
        }

        if (deck.length > 0) {
            const cardFromDeck = deck.shift();
            const deckMonth = cardFromDeck.split('に')[0];
            const deckMatchIndex = board.findIndex(bCard => bCard.startsWith(deckMonth));

            if (deckMatchIndex > -1) {
                matchedCards.push(cardFromDeck, board.splice(deckMatchIndex, 1)[0]);
            } else {
                board.push(cardFromDeck);
            }
        }
        
        if (matchedCards.length > 0) {
            playerCaptured.push(...matchedCards);
            const yakuList = checkYaku(playerCaptured);
            if (yakuList.length > 0) {
                messageArea.textContent = `役ができました！(${yakuList.join(', ')}) こいこいしますか？`;
                actionButtons.style.display = 'flex';
                playerHandArea.removeEventListener('click', playerHandClickHandler);
                return;
            }
        }

        updateUI();

        if (playerHand.length === 0 && deck.length === 0) {
            endRound('none');
            return;
        }

        playerTurn = false;
        messageArea.textContent = '相手の番です。';
        setTimeout(() => {
            cpuTurnHandler();
        }, 1500);
    }

    // CPUのターン進行処理
    function cpuTurnHandler() {
        messageArea.textContent = '相手が考えています...';

        let cpuPlayedCard = null;
        let matchedCardIndex = -1;

        for (let i = 0; i < cpuHand.length; i++) {
            const cpuCard = cpuHand[i];
            const month = cpuCard.split('に')[0];
            matchedCardIndex = board.findIndex(bCard => bCard.startsWith(month));
            if (matchedCardIndex > -1) {
                cpuPlayedCard = cpuCard;
                cpuHand.splice(i, 1);
                break;
            }
        }

        if (!cpuPlayedCard) {
            const randomIndex = Math.floor(Math.random() * cpuHand.length);
            cpuPlayedCard = cpuHand.splice(randomIndex, 1)[0];
        }

        let cpuMatchedCards = [];
        const month = cpuPlayedCard.split('に')[0];
        const boardMatchIndex = board.findIndex(bCard => bCard.startsWith(month));
        if (boardMatchIndex > -1) {
            cpuMatchedCards.push(cpuPlayedCard, board.splice(boardMatchIndex, 1)[0]);
        } else {
            board.push(cpuPlayedCard);
        }

        let cardFromDeck = null;
        if (deck.length > 0) {
            cardFromDeck = deck.shift();
            const deckMonth = cardFromDeck.split('に')[0];
            const deckMatchIndex = board.findIndex(bCard => bCard.startsWith(deckMonth));
            if (deckMatchIndex > -1) {
                cpuMatchedCards.push(cardFromDeck, board.splice(deckMatchIndex, 1)[0]);
            } else {
                board.push(cardFromDeck);
            }
        }
        
        if (cpuMatchedCards.length > 0) {
            cpuCaptured.push(...cpuMatchedCards);
            const yakuList = checkYaku(cpuCaptured);
            if (yakuList.length > 0) {
                endRound('cpu');
                return;
            }
        }

        updateUI();
        
        if (cpuHand.length === 0 && deck.length === 0) {
            endRound('none');
            return;
        }

        playerTurn = true;
        messageArea.textContent = 'あなたの番です。手札から札を選んでください。';
    }

    // プレイヤーの手札クリックイベントハンドラ
    function playerHandClickHandler(e) {
        if (!playerTurn || !e.target.classList.contains('card')) {
            return;
        }
        const selectedCard = e.target.textContent;
        playerTurnHandler(selectedCard);
    }
    
    // 画面切り替え関数
// script.js の showScreen 関数を以下に書き換え

function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
        screen.style.opacity = '0'; // フェードアウト
        screen.style.zIndex = '1';
    });

    const activeScreen = document.getElementById(screenId);
    activeScreen.classList.add('active');
    activeScreen.style.opacity = '1'; // フェードイン
    activeScreen.style.zIndex = '100';
}

    // ゲーム開始
// script.js の startGame 関数を以下に書き換え

function startGame(startingPlayer = 'player') { // デフォルトはプレイヤーが先手
    dealCards();
    updateUI();
    
    // 親の決定
    if (startingPlayer === 'player') {
        playerTurn = true;
        messageArea.textContent = `第${currentRound}回戦：あなたの番です。`;
    } else if (startingPlayer === 'cpu') {
        playerTurn = false;
        messageArea.textContent = `第${currentRound}回戦：相手の番です。`;
        setTimeout(cpuTurnHandler, 1500);
    } else { // 'current'の場合、親は交代しない
        // 前のターンの親が続行
    }

    playerKoikoi = false;
    cpuKoikoi = false;
    playerHandArea.addEventListener('click', playerHandClickHandler);
}

    // イベントリスナー
    startGameButton.addEventListener('click', () => {
        showScreen('rounds-screen');
    });

    roundButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            totalRounds = parseInt(e.target.dataset.rounds, 10);
            showScreen('game-screen');
            startGame();
        });
    });

    koikoiButton.addEventListener('click', () => {
        actionButtons.style.display = 'none';
        playerKoikoi = true;
        playerHandArea.addEventListener('click', playerHandClickHandler);
        messageArea.textContent = 'こいこいを宣言しました。続行します。';
        playerTurn = false;
        setTimeout(() => {
            cpuTurnHandler();
        }, 1500);
    });

    shobuButton.addEventListener('click', () => {
        actionButtons.style.display = 'none';
        endRound('player');
    });
    
    restartButton.addEventListener('click', () => {
        showScreen('rounds-screen');
    });

    returnToTitleButton.addEventListener('click', () => {
        showScreen('title-screen');
    });

    // ページロード時にタイトル画面を表示
    showScreen('title-screen');

    // 画面サイズ変更時の調整
    window.addEventListener('resize', () => {
        const app = document.getElementById('app');
        const scaleX = window.innerWidth / 1920;
        const scaleY = window.innerHeight / 1080;
        const scale = Math.min(scaleX, scaleY);
        app.style.transform = `scale(${scale})`;
    });

    window.dispatchEvent(new Event('resize'));
       // イベントリスナーをDOMロード時に一度だけ設定
    playerHandArea.addEventListener('click', playerHandClickHandler);
});