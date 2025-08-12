// title/title.js

document.addEventListener('DOMContentLoaded', () => {
    const startGameButton = document.getElementById('start-game-button');
    const titleScreen = document.getElementById('title-screen');

    startGameButton.addEventListener('click', () => {
        window.switchScreen('game');
    });

    titleScreen.classList.add('active');
});