document.addEventListener('DOMContentLoaded', () => {
    // --- 画面要素 ---
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

    // メッセージ領域（存在しなければ作る）
    const messageArea = document.getElementById('message') || createMessageArea();

    // リザルト画面の要素
    const resultMessageElement = document.getElementById('result-message');
    const finalPlayerScoreElement = document.getElementById('final-player-score');
    const finalCpuScoreElement = document.getElementById('final-cpu-score');

    // ツールチップ（カード情報）
    const cardInfoBox = ensureTooltip();
    const cardInfoMonth = cardInfoBox.querySelector('#card-info-month');
    const cardInfoName = cardInfoBox.querySelector('#card-info-name');
    const cardInfoType = cardInfoBox.querySelector('#card-info-type');

    // --- 花札の定義 ---
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

    // --- 役と点数 ---
    const YAKU_POINTS = {
        '五光': 15, '四光': 8, '雨四光': 7, '三光': 5,
        '猪鹿蝶': 5, '赤短': 5, '青短': 5,
        'タネ': 1, '短冊': 1, 'カス': 1
    };

    // --- ゲーム状態 ---
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

    // ★ 先手（親）を保持（流れ後も据え置き）
    let currentDealer = 'player'; // 'player' | 'cpu'

    // プレイヤーの場札選択待ち（同月2枚時）
    let pendingSelection = null; // { handCard: string }

    // ================= ユーティリティ =================
    function createMessageArea() {
        const el = document.createElement('div');
        el.className = 'game-message';
        el.id = 'message';
        gameScreen.appendChild(el);
        return el;
    }

    function getCardImage(cardName) {
        const fileName = cardName
            .replace(/に/g, '_')
            .replace(/ /g, '_')
            .toLowerCase();
        return `images/cards/${fileName}.png`;
    }

    function getCardMonth(cardName) {
        return cardName.split('に')[0]; // '桜に幕' -> '桜', '桜' -> '桜'
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function ensureTooltip() {
        let tip = document.getElementById('card-info-box');
        if (!tip) {
            tip = document.createElement('div');
            tip.id = 'card-info-box';
            tip.innerHTML = `
                <p id="card-info-month"></p>
                <p id="card-info-name"></p>
                <p id="card-info-type"></p>
            `;
            document.body.appendChild(tip);
        }
        tip.style.display = 'none';
        tip.style.position = 'fixed'; // 画面固定
        tip.style.zIndex = '9999';
        return tip;
    }

    function showTooltipForCard(card, targetEl) {
        const month = getCardMonth(card);
        const type = getCardType(card);
        cardInfoMonth.textContent = `月: ${month}`;
        cardInfoName.textContent = `札: ${card}`;
        cardInfoType.textContent = `種類: ${type}`;
        positionTooltipAbove(targetEl);
        cardInfoBox.style.display = 'block';
    }

    function hideTooltip() {
        cardInfoBox.style.display = 'none';
    }

    function positionTooltipAbove(el) {
        const rect = el.getBoundingClientRect();
        const tipRect = cardInfoBox.getBoundingClientRect();
        const x = rect.left + rect.width / 2 - tipRect.width / 2;
        const y = rect.top - tipRect.height - 8; // 札の上8px
        cardInfoBox.style.left = Math.max(8, Math.min(window.innerWidth - tipRect.width - 8, x)) + 'px';
        cardInfoBox.style.top = Math.max(8, y) + 'px';
    }

    // ================= 札の分類・役判定 =================
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

    function checkYaku(cards) {
        const yakuList = [];

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
        if (tan_count >= 5) yakuList.push('短冊');

        const tane_count = cards.filter(card => getCardType(card) === 'タネ').length;
        if (tane_count >= 5) yakuList.push('タネ');

        const kasu_count = cards.filter(card => getCardType(card) === 'カス').length;
        if (kasu_count >= 10) yakuList.push('カス');

        return yakuList;
    }

    function calculateScore(yakuList) {
        return yakuList.reduce((s, y) => s + (YAKU_POINTS[y] || 0), 0);
    }

    // ================= 配り =================
    function dealCards() {
        deck = shuffle([...allCards]);
        playerHand = deck.splice(0, 8);
        cpuHand = deck.splice(0, 8);
        board = deck.splice(0, 8);
        playerCaptured = [];
        cpuCaptured = [];
    }

    // ================= 描画 =================
    function renderCards(area, cards, isFaceDown = false) {
        area.innerHTML = '';
        cards.forEach((card) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');

            if (isFaceDown) {
                cardElement.classList.add('back');
            } else {
                cardElement.style.backgroundImage = `url('${getCardImage(card)}')`;
                cardElement.textContent = card;

                // ツールチップ（札上部）
                cardElement.addEventListener('mouseenter', () => showTooltipForCard(card, cardElement));
                cardElement.addEventListener('mouseleave', hideTooltip);
                cardElement.addEventListener('mousemove', () => positionTooltipAbove(cardElement));
            }
            area.appendChild(cardElement);
        });
    }

    function updateCapturedUI() {
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
    }

    function updateUI() {
        renderCards(boardArea, board);
        renderCards(playerHandArea, playerHand);
        renderCards(cpuHandArea, cpuHand, true);
        updateCapturedUI();

        playerScoreSpan.textContent = playerScore;
        cpuScoreSpan.textContent = cpuScore;
        currentRoundSpan.textContent = `第${currentRound}回戦`;
    }

    // ================= ラウンド終了・流れ =================
    // ★ どちらも手札がなくなったら「流れ」
    function maybeNagare() {
        if (playerHand.length === 0 && cpuHand.length === 0) {
            messageArea.textContent = '流れ（どちらも手札が無くなりました）。';
            endRound('none'); // 親は据え置き
            return true;
        }
        return false;
    }

    function endRound(winner) {
        const playerYakuList = checkYaku(playerCaptured);
        const cpuYakuList = checkYaku(cpuCaptured);
        let playerScoreForRound = calculateScore(playerYakuList);
        let cpuScoreForRound = calculateScore(cpuYakuList);

        // ★ 次ラウンドの先手（親）決定：デフォは据え置き（流れ時の仕様）
        let nextTurn = currentDealer;

        if (winner === 'player') {
            if (cpuKoikoi) playerScoreForRound *= 2;
            else if (playerKoikoi && playerScoreForRound > 0) playerScoreForRound *= 2;
            playerScore += playerScoreForRound;
            messageArea.textContent = `勝負！あなたの勝ちです！${playerScoreForRound}点獲得しました。`;

            // 勝敗時に親を移す運用にしたい場合は次行を有効化
            // nextTurn = 'player';

        } else if (winner === 'cpu') {
            if (playerKoikoi) cpuScoreForRound *= 2;
            else if (cpuKoikoi && cpuScoreForRound > 0) cpuScoreForRound *= 2;
            cpuScore += cpuScoreForRound;
            messageArea.textContent = `勝負！相手の勝ちです！${cpuScoreForRound}点獲得しました。`;

            // 勝敗時に親を移す運用にしたい場合は次行を有効化
            // nextTurn = 'cpu';

        } else {
            // ★ 流れ
            messageArea.textContent = '流れ（どちらも手札が無くなりました）。';
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
                // リセット
                playerScore = 0;
                cpuScore = 0;
                currentRound = 1;
            }, 1200);
        } else {
            currentRound++;
            // ★ 親を記録して次を開始
            currentDealer = nextTurn;
            setTimeout(() => startGame(currentDealer), 1200);
        }
    }

    // ================= プレイヤーのターン =================
    function playerTurnHandler(playerCard) {
        if (pendingSelection) return; // 選択待ち中は無視

        const month = getCardMonth(playerCard);
        // 場の同月札を収集
        const boardMatchIdxs = [];
        board.forEach((bCard, i) => {
            if (getCardMonth(bCard) === month) boardMatchIdxs.push(i);
        });

        // 0枚：場に出す
        if (boardMatchIdxs.length === 0) {
            removeFromHand(playerCard);
            board.push(playerCard);
            // 山札処理
            drawAndResolve(month);
            postPlayerAction();
            return;
        }

        // 1枚：その1枚と取得
        if (boardMatchIdxs.length === 1) {
            removeFromHand(playerCard);
            const taken = [playerCard, board.splice(boardMatchIdxs[0], 1)[0]];
            resolveCapture(playerCaptured, taken);
            // 山札処理
            drawAndResolve();
            postPlayerAction(true);
            return;
        }

        // 2枚：選択させる
        if (boardMatchIdxs.length === 2) {
            messageArea.textContent = 'どちらの札を取るか選んでください。';
            highlightAndAwaitBoardChoice(boardMatchIdxs, playerCard);
            return;
        }

        // 3枚以上：総取り
        removeFromHand(playerCard);
        const taken = [playerCard, ...board.filter(c => getCardMonth(c) === month)];
        // 盤面から該当月を全削除
        board = board.filter(c => getCardMonth(c) !== month);
        resolveCapture(playerCaptured, taken);
        // 山札処理
        drawAndResolve();
        postPlayerAction(true);
    }

    function removeFromHand(card) {
        const idx = playerHand.indexOf(card);
        if (idx > -1) playerHand.splice(idx, 1);
    }

    function resolveCapture(capturedArr, takenCards) {
        if (takenCards.length > 0) {
            capturedArr.push(...takenCards);
            const yakuList = checkYaku(capturedArr);
            if (capturedArr === playerCaptured && yakuList.length > 0) {
                messageArea.textContent = `役ができました！(${yakuList.join(', ')}) こいこいしますか？`;
                actionButtons.style.display = 'flex';
                playerHandArea.removeEventListener('click', playerHandClickHandler);
                updateUI();
                return true;
            }
        }
        return false;
    }

    function drawAndResolve() {
        if (deck.length === 0) return;
        const cardFromDeck = deck.shift();
        const month = getCardMonth(cardFromDeck);
        const idxs = [];
        board.forEach((b, i) => { if (getCardMonth(b) === month) idxs.push(i); });

        if (idxs.length === 0) {
            board.push(cardFromDeck);
        } else if (idxs.length === 1) {
            const taken = [cardFromDeck, board.splice(idxs[0], 1)[0]];
            resolveCapture(playerTurn ? playerCaptured : cpuCaptured, taken);
        } else if (idxs.length >= 2) {
            // 山札は総取りとして扱う（簡易ルール）
            const sameMonth = board.filter(c => getCardMonth(c) === month);
            board = board.filter(c => getCardMonth(c) !== month);
            resolveCapture(playerTurn ? playerCaptured : cpuCaptured, [cardFromDeck, ...sameMonth]);
        }
    }

    function postPlayerAction() {
        updateUI();

        // ★ どちらも手札が0なら「流れ」
        if (maybeNagare()) return;

        if (actionButtons.style.display !== 'flex') {
            playerTurn = false;
            messageArea.textContent = '相手の番です。';
            setTimeout(cpuTurnHandler, 900);
        }
    }

    // 2枚マッチの選択UI
    function highlightAndAwaitBoardChoice(matchIdxs, handCard) {
        pendingSelection = { handCard };
        // ハイライト
        [...boardArea.children].forEach((el, i) => {
            el.classList.toggle('selectable', matchIdxs.includes(i));
        });

        const onClick = (e) => {
            const el = e.target.closest('.card');
            if (!el) return;
            const idx = Array.from(boardArea.children).indexOf(el);
            if (!matchIdxs.includes(idx)) return;

            // 決定
            boardArea.removeEventListener('click', onClick);
            [...boardArea.children].forEach(el => el.classList.remove('selectable'));

            // 手札から取り除き、選んだ場札と取得
            removeFromHand(pendingSelection.handCard);
            const taken = [pendingSelection.handCard, board.splice(idx, 1)[0]];
            resolveCapture(playerCaptured, taken);
            pendingSelection = null;

            // 山札処理と進行
            drawAndResolve();
            postPlayerAction();
        };

        boardArea.addEventListener('click', onClick);
    }

    // ================= CPUのターン =================
    function cpuTurnHandler() {
        hideTooltip();
        messageArea.textContent = '相手が考えています...';

        let cpuPlayedCard = null;
        let matchedIdxs = [];

        // まずマッチを探す
        for (let i = 0; i < cpuHand.length; i++) {
            const c = cpuHand[i];
            const m = getCardMonth(c);
            matchedIdxs = [];
            board.forEach((b, bi) => { if (getCardMonth(b) === m) matchedIdxs.push(bi); });
            if (matchedIdxs.length > 0) {
                cpuPlayedCard = cpuHand.splice(i, 1)[0];
                break;
            }
        }

        // なければランダム出し
        if (!cpuPlayedCard) {
            const randomIndex = Math.floor(Math.random() * cpuHand.length);
            cpuPlayedCard = cpuHand.splice(randomIndex, 1)[0];
            board.push(cpuPlayedCard);
            // 山札
            drawAndResolve();
            updateUI();

            // ★ 流れチェック
            if (maybeNagare()) return;

            playerTurn = true;
            messageArea.textContent = 'あなたの番です。手札から札を選んでください。';
            return;
        }

        // マッチがある場合
        const month = getCardMonth(cpuPlayedCard);
        if (matchedIdxs.length === 1) {
            const taken = [cpuPlayedCard, board.splice(matchedIdxs[0], 1)[0]];
            resolveCapture(cpuCaptured, taken);
        } else if (matchedIdxs.length >= 2) {
            // 3枚以上は総取り、2枚はどちらか（CPUは左の札を選択）
            if (matchedIdxs.length >= 3) {
                const allSame = board.filter(c => getCardMonth(c) === month);
                board = board.filter(c => getCardMonth(c) !== month);
                resolveCapture(cpuCaptured, [cpuPlayedCard, ...allSame]);
            } else {
                const chosen = matchedIdxs[0];
                const taken = [cpuPlayedCard, board.splice(chosen, 1)[0]];
                resolveCapture(cpuCaptured, taken);
            }
        }

        // 山札
        drawAndResolve();
        updateUI();

        // ★ 流れチェック
        if (maybeNagare()) return;

        playerTurn = true;
        messageArea.textContent = 'あなたの番です。手札から札を選んでください。';
    }

    // ================= 画面切替 =================
    function showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
            screen.style.opacity = '0';
            screen.style.zIndex = '1';
        });
        const activeScreen = document.getElementById(screenId);
        activeScreen.classList.add('active');
        activeScreen.style.opacity = '1';
        activeScreen.style.zIndex = '100';
    }

    function startGame(startingPlayer = 'player') {
        dealCards();
        updateUI();

        // ★ 先手（親）を記録して反映
        if (startingPlayer === 'player' || startingPlayer === 'cpu') {
            currentDealer = startingPlayer;
        }
        if (currentDealer === 'player') {
            playerTurn = true;
            messageArea.textContent = `第${currentRound}回戦：あなたの番です。`;
        } else {
            playerTurn = false;
            messageArea.textContent = `第${currentRound}回戦：相手の番です。`;
            setTimeout(cpuTurnHandler, 900);
        }

        playerKoikoi = false;
        cpuKoikoi = false;

        // 二重登録防止
        playerHandArea.removeEventListener('click', playerHandClickHandler);
        playerHandArea.addEventListener('click', playerHandClickHandler);
    }

    // ================= イベント =================
    function playerHandClickHandler(e) {
        if (!playerTurn) return;
        const cardEl = e.target.closest('.card');
        if (!cardEl) return;
        const selectedCard = cardEl.textContent;
        if (!selectedCard) return; // 裏札など
        playerTurnHandler(selectedCard);
    }

    startGameButton.addEventListener('click', () => showScreen('rounds-screen'));

    roundButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            totalRounds = parseInt(e.target.dataset.rounds, 10);
            showScreen('game-screen');
            // 初回の親はデフォルトでプレイヤー
            currentDealer = 'player';
            startGame(currentDealer);
        });
    });

    koikoiButton.addEventListener('click', () => {
        actionButtons.style.display = 'none';
        playerKoikoi = true;
        playerHandArea.addEventListener('click', playerHandClickHandler);
        messageArea.textContent = 'こいこいを宣言しました。続行します。';
        playerTurn = false;
        setTimeout(cpuTurnHandler, 900);
    });

    shobuButton.addEventListener('click', () => {
        actionButtons.style.display = 'none';
        endRound('player');
    });

    restartButton?.addEventListener('click', () => {
        showScreen('rounds-screen');
    });

    returnToTitleButton?.addEventListener('click', () => {
        showScreen('title-screen');
    });

    // 初期画面
    showScreen('title-screen');

    // レイアウトスケール（既存仕様）
    window.addEventListener('resize', () => {
        const app = document.getElementById('app');
        const scaleX = window.innerWidth / 1920;
        const scaleY = window.innerHeight / 1080;
        const scale = Math.min(scaleX, scaleY);
        app.style.transform = `scale(${scale})`;
    });
    window.dispatchEvent(new Event('resize'));
});
