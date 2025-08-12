// game_manager.js

const app = document.getElementById('app');

async function loadScreen(screenName, data = {}) {
    try {
        const response = await fetch(`${screenName}/${screenName}.html`);
        const html = await response.text();
        app.innerHTML = html;

        window.gameData = data;

        const script = document.createElement('script');
        script.src = `${screenName}/${screenName}.js`;
        app.appendChild(script);
    } catch (error) {
        console.error('画面の読み込みに失敗しました:', error);
    }
}

window.switchScreen = loadScreen;
window.addEventListener('resize', () => {
    const app = document.getElementById('app');
    if (app) {
        const scaleX = window.innerWidth / 1920;
        const scaleY = window.innerHeight / 1080;
        const scale = Math.min(scaleX, scaleY);
        app.style.transform = `scale(${scale})`;
    }
});

window.dispatchEvent(new Event('resize'));
loadScreen('title');