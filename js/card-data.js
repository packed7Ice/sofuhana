const DEFAULT_CARD_IMAGE_CONFIG = {
  /**
   * カード画像のベースディレクトリ。
   * 画像を変更することで配置の構成を保ったまま差し替え可能。
   */
  basePath: 'images/cards',
  /**
   * 画像の拡張子。拡張子を含むパスを overrides で指定する場合は不要。
   */
  defaultExtension: 'png',
  /**
   * 各カードごとの任意パス。必要なカードだけ指定すればOK。
   * 例: '松に鶴': 'assets/matsu_crane.webp'
   */
  overrides: {
    // 1月 松
    '松に鶴': 'images/cards/1/Matsu_kou.png',
    '松に短冊': 'images/cards/1/Matsu_tan.png',
    '松': 'images/cards/1/Matsu_kasu1.png',
    // 2月 梅
    '梅に鶯': 'images/cards/2/Ume_tane.png',
    '梅に短冊': 'images/cards/2/Ume_tan.png',
    '梅': 'images/cards/2/Ume_kasu1.png',
    // 3月 桜
    '桜に幕': 'images/cards/3/Sakura_kou.png',
    '桜に短冊': 'images/cards/3/Sakura_tan.png',
    '桜': 'images/cards/3/Sakura_kasu1.png',
    // 4月 藤
    '藤に時鳥': 'images/cards/4/Fuji_tane.png',
    '藤に短冊': 'images/cards/4/Fuji_tan.png',
    '藤': 'images/cards/4/Fuji_kasu1.png',
    // 5月 菖蒲
    '菖蒲に八橋': 'images/cards/5/Ayame_tane.png',
    '菖蒲に短冊': 'images/cards/5/Ayame_tan.png',
    '菖蒲': 'images/cards/5/Ayame_kasu1.png',
    // 6月 牡丹
    '牡丹に蝶': 'images/cards/6/Botan_tane.png',
    '牡丹に短冊': 'images/cards/6/Botan_tan.png',
    '牡丹': 'images/cards/6/Botan_kasu1.png',
    // 7月 萩
    '萩に猪': 'images/cards/7/Hagi_tane.png',
    '萩に短冊': 'images/cards/7/Hagi_tan.png',
    '萩': 'images/cards/7/Hagi_kasu1.png',
    // 8月 芒
    '芒に月': 'images/cards/8/Susuki_kou.png',
    '芒に雁': 'images/cards/8/Susuki_tane.png',
    '芒': 'images/cards/8/Susuki_kasu1.png',
    // 9月 菊
    '菊に盃': 'images/cards/9/Kiku_tane.png',
    '菊に短冊': 'images/cards/9/Kiku_tan.png',
    '菊': 'images/cards/9/Kiku_kasu1.png',
    // 10月 紅葉
    '紅葉に鹿': 'images/cards/10/Momiji_tane.png',
    '紅葉に短冊': 'images/cards/10/Momiji_tan.png',
    '紅葉': 'images/cards/10/Momiji_kasu1.png',
    // 11月 柳
    '柳に小野道風': 'images/cards/11/Yanagi_kou.png',
    '柳に燕': 'images/cards/11/Yanagi_tane.png',
    '柳に短冊': 'images/cards/11/Yanagi_tan.png',
    '柳': 'images/cards/11/Yanagi_kasu.png',
    // 12月 桐
    '桐に鳳凰': 'images/cards/12/Kiri_kou.png',
    '桐': 'images/cards/12/Kiri_kasu1.png'
  },
  /**
   * 裏面画像。
   */
  backImage: 'images/back.png'
};

(function addKasuDuplicateOverrides(cfg){
  if (!cfg || !cfg.overrides) return;
  Object.assign(cfg.overrides, {
    '松(2)': 'images/cards/1/Matsu_kasu2.png',
    '梅(2)': 'images/cards/2/Ume_kasu2.png',
    '桜(2)': 'images/cards/3/Sakura_kasu2.png',
    '藤(2)': 'images/cards/4/Fuji_kasu2.png',
    '菖蒲(2)': 'images/cards/5/Ayame_kasu2.png',
    '牡丹(2)': 'images/cards/6/Botan_kasu2.png',
    '萩(2)': 'images/cards/7/Hagi_kasu2.png',
    '芒(2)': 'images/cards/8/Susuki_kasu2.png',
    '菊(2)': 'images/cards/9/Kiku_kasu2.png',
    '紅葉(2)': 'images/cards/10/Momiji_kasu2.png',
    '桐(2)': 'images/cards/12/Kiri_kasu2.png',
    '桐(3)': 'images/cards/12/Kiri_kasu3.png'
  });
})(DEFAULT_CARD_IMAGE_CONFIG);

const externalCardImageConfig =
  window.__HANAFUDA_CARD_IMAGE_CONFIG__ ||
  window.hanafudaCardImages?.config ||
  {};

export const CARD_IMAGE_CONFIG = {
  ...DEFAULT_CARD_IMAGE_CONFIG,
  ...externalCardImageConfig,
  overrides: {
    ...DEFAULT_CARD_IMAGE_CONFIG.overrides,
    ...(externalCardImageConfig?.overrides || {})
  }
};

const cardImageApi = window.hanafudaCardImages || {};
Object.assign(cardImageApi, {
  config: CARD_IMAGE_CONFIG,
  setBasePath(path){ CARD_IMAGE_CONFIG.basePath = path ?? ''; },
  setDefaultExtension(ext){ CARD_IMAGE_CONFIG.defaultExtension = ext ?? ''; },
  setOverride(name, imagePath){ if(!name) return; CARD_IMAGE_CONFIG.overrides[name] = imagePath; },
  removeOverride(name){ if(!name) return; delete CARD_IMAGE_CONFIG.overrides[name]; },
  clearOverrides(){ CARD_IMAGE_CONFIG.overrides = {}; },
  setBackImage(path){ CARD_IMAGE_CONFIG.backImage = path ?? ''; }
});
window.hanafudaCardImages = cardImageApi;
window.__HANAFUDA_CARD_IMAGE_CONFIG__ = CARD_IMAGE_CONFIG;

export const CARD_NAMES = [
  '松に鶴','松に短冊','松','松',
  '梅に鶯','梅に短冊','梅','梅',
  '桜に幕','桜に短冊','桜','桜',
  '藤に時鳥','藤に短冊','藤','藤',
  '菖蒲に八橋','菖蒲に短冊','菖蒲','菖蒲',
  '牡丹に蝶','牡丹に短冊','牡丹','牡丹',
  '萩に猪','萩に短冊','萩','萩',
  '芒に月','芒に雁','芒','芒',
  '菊に盃','菊に短冊','菊','菊',
  '紅葉に鹿','紅葉に短冊','紅葉','紅葉',
  '柳に小野道風','柳に燕','柳に短冊','柳',
  '桐に鳳凰','桐','桐','桐'
];

export const RENAMED_CARD_NAMES = (() => {
  const counts = Object.create(null);
  return CARD_NAMES.map(name => {
    const isPlainMonth = !name.includes('光') && !name.includes('短冊');
    if (!isPlainMonth) return name;
    const month = name;
    counts[month] = (counts[month] || 0) + 1;
    if (counts[month] === 1) return name;
    return `${month}(${counts[month]})`;
  });
})();

const YAKU_POINTS = {
  '五光': 15, '四光': 8, '雨四光': 7, '三光': 5,
  '猪鹿蝶': 5, '赤短': 5, '青短': 5,
  '月見酒': 5, '花見酒': 5,
  'タネ': 1, '短冊': 1, 'カス': 1
};

export function normalizeCardFileName(cardName){
  return cardName
    .normalize('NFKC')
    .replace(/\s+/g, '_')
    .replace(/・/g, '_')
    .replace(/[()（）・、,]/g, '')
    .toLowerCase();
}

export function getCardImage(cardName){
  const overrides = CARD_IMAGE_CONFIG.overrides || {};
  const basePath = (CARD_IMAGE_CONFIG.basePath || '').replace(/\/$/, '');
  const ext = CARD_IMAGE_CONFIG.defaultExtension
    ? `.${CARD_IMAGE_CONFIG.defaultExtension.replace(/^\./, '')}`
    : '';

  const override = overrides[cardName];
  if (override) {
    const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(override) || override.startsWith('/') || override.startsWith('./') || override.startsWith('../');
    if (isAbsolute) return override;

    const hasDirectory = override.includes('/');
    const hasExtension = /\.[a-z0-9]+$/i.test(override);
    const file = hasExtension ? override : `${override}${ext}`;

    if (!basePath || hasDirectory) {
      return file;
    }
    return `${basePath}/${file}`;
  }

  const fileName = normalizeCardFileName(cardName);
  if (!basePath) {
    return `${fileName}${ext}`;
  }
  return `${basePath}/${fileName}${ext}`;
}

export function getCardBackImage(){
  return CARD_IMAGE_CONFIG.backImage || '';
}

export function getCardMonth(cardName){
  if (!cardName) return '';
  const base = String(cardName).replace(/\s*\(\d+\)$/, '');
  return base.split('に')[0];
}

export function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getCardType(name){
  if (name === '松に鶴' || name === '桜に幕' || name === '芒に月' || name === '桐に鳳凰') return '光';
  if (name === '柳に小野道風') return '雨光';
  if (name.includes('短冊')) return '短冊';
  if (name === '萩に猪' || name === '紅葉に鹿' || name === '牡丹に蝶' ||
      name === '梅に鶯' || name === '藤に時鳥' || name === '菖蒲に八橋' ||
      name === '芒に雁' || name === '柳に燕' || name === '菊に盃') return 'タネ';
  return 'カス';
}

export function checkYaku(cards){
  const yakuList = [];

  const inoshikacho = ['萩に猪','紅葉に鹿','牡丹に蝶'];
  if (inoshikacho.every(c => cards.includes(c))) yakuList.push('猪鹿蝶');

  if (['松に短冊','梅に短冊','桜に短冊'].every(c => cards.includes(c))) yakuList.push('赤短');
  if (['牡丹に短冊','菊に短冊','柳に短冊'].every(c => cards.includes(c))) yakuList.push('青短');

  if (cards.includes('芒に月') && cards.includes('菊に盃')) yakuList.push('月見酒');
  if (cards.includes('桜に幕') && cards.includes('菊に盃')) yakuList.push('花見酒');

  const lights = cards.filter(c => getCardType(c)==='光' || c==='柳に小野道風');
  const tane = cards.filter(c => getCardType(c)==='タネ');
  const tanzaku = cards.filter(c => getCardType(c)==='短冊');
  let kasu = cards.filter(c => getCardType(c)==='カス').length;
  if (cards.includes('菊に盃')) kasu += 1; // 「菊に盃」はカスにも数える

  const hasRain = cards.includes('柳に小野道風');
  if (lights.length >= 5) yakuList.push('五光');
  else if (lights.length === 4 && !hasRain) yakuList.push('四光');
  else if (lights.length === 4 && hasRain) yakuList.push('雨四光');
  else if (lights.length >= 3 && !hasRain) yakuList.push('三光');

  if (tane.length >= 5) yakuList.push('タネ');
  if (tanzaku.length >= 5) yakuList.push('短冊');
  if (kasu >= 10) yakuList.push('カス');

  return yakuList;
}

export function scoreFromCaptured(cards){
  const yakuList = checkYaku(cards);
  let pts = calculateScore(yakuList);

  const tan = cards.filter(c => getCardType(c)==='短冊').length;
  const tane = cards.filter(c => getCardType(c)==='タネ').length;
  let kasu = cards.filter(c => getCardType(c)==='カス').length + (cards.includes('菊に盃') ? 1 : 0);

  if (tan >= 5)  pts += (tan - 4);
  if (tane >= 5) pts += (tane - 4);
  if (kasu >= 10) pts += (kasu - 9);

  return { yakuList, basePoints: pts };
}

export function calculateScore(yakuList){
  return yakuList.reduce((sum, yaku) => sum + (YAKU_POINTS[yaku] || 0), 0);
}
