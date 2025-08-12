// result/result.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const resultMessageElement = document.getElementById('result-message');
    const finalPlayerScoreElement = document.getElementById('final-player-score');
    const finalCpuScoreElement = document.getElementById('final-cpu-score');
    const restartButton = document.getElementById('restart-button');
    const returnToTitleButton = document.getElementById('return-to-title-button');

    // ゲーム終了時に渡されたデータを取得
    const gameData = window.gameData || {};
    const finalPlayerScore = gameData.playerScore;
    const finalCpuScore = gameData.cpuScore;

    // スコアの表示
    finalPlayerScoreElement.textContent = finalPlayerScore;
    finalCpuScoreElement.textContent = finalCpuScore;

    // 勝敗メッセージの表示
    if (finalPlayerScore > finalCpuScore) {
        resultMessageElement.textContent = 'あなたの勝利！';
    } else if (finalCpuScore > finalPlayerScore) {
        resultMessageElement.textContent = 'あなたの敗北...';
    } else {
        resultMessageElement.textContent = '引き分けです。';
    }

    // ボタンのイベントリスナー
    restartButton.addEventListener('click', () => {
        // もう一度プレイするためにゲーム画面に遷移
        const newGameData = {
            totalRounds: gameData.totalRounds
        };
        window.switchScreen('game', newGameData);
    });

    returnToTitleButton.addEventListener('click', () => {
        // タイトル画面に切り替える
        window.switchScreen('title');
    });
});