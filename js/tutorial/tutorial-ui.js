export function showTutorialMessage(html, nextCallback, options = {}) {
  let container = document.getElementById('tutorial-overlay');
  if (!container) {
    container = document.createElement('div');
    container.id = 'tutorial-overlay';
    const app = document.getElementById('app');
    if (app) app.appendChild(container);
    else document.body.appendChild(container);
  }

  const position = options.position || 'center';
  const buttonText = options.buttonText || '次へ';

  container.className = ''; // Reset classes
  if (position !== 'center') {
    container.classList.add(`position-${position}`);
  }

  container.innerHTML = `
    <div class="tutorial-message-box">
      <div class="tutorial-text">${html}</div>
      ${nextCallback ? `<button id="tutorial-next-btn" class="action-button small">${buttonText}</button>` : ''}
    </div>
  `;
  
  container.style.display = 'flex';

  if (nextCallback) {
    const btn = document.getElementById('tutorial-next-btn');
    btn.addEventListener('click', nextCallback);
  }
}

export function hideTutorialMessage() {
  const container = document.getElementById('tutorial-overlay');
  if (container) {
    container.style.display = 'none';
  }
}

export function highlightElement(selector) {
  // 既存のハイライトを消す
  clearHighlight();

  if (!selector) return;
  
  const el = document.querySelector(selector);
  if (el) {
    el.classList.add('tutorial-highlight');
    // 要素が画面外ならスクロール（必要なら）
    // el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

export function clearHighlight() {
  const highlighted = document.querySelectorAll('.tutorial-highlight');
  highlighted.forEach(el => el.classList.remove('tutorial-highlight'));
}
