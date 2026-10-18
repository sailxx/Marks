// SVG-плашки README в стиле Okto Calc: чёрный фон, белые свечения, шрифты Golos Text и JetBrains Mono
// (урезаются под каждый язык). Тексты — strings.json.
// Шрифты (OFL-1.1) положить в tools/readme/.font/: golos.ttf (Golos Text) и jbmono.ttf (JetBrains Mono).
// Запуск: cd tools/readme && npm install && node build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createKit, ICONS } from './kit.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(DIR, '../..');
const OUT = path.join(REPO, 'assets/readme');
const STR = JSON.parse(fs.readFileSync(path.join(DIR, 'strings.json'), 'utf8'));
const VERSION = JSON.parse(fs.readFileSync(path.join(REPO, 'manifest.json'), 'utf8')).version;

const K = createKit({
  golos: path.join(DIR, '.font/golos.ttf'),
  mono: path.join(DIR, '.font/jbmono.ttf'),
  accent: { hi: '#FFFFFF', grad: ['#FFFFFF', '#8C8C8C'], on: '#000000', glow: '#FFFFFF', glowOpacity: 0.1, glow2: '#FFFFFF', btn: ['#FFFFFF', '#D4D4D4'] },
});
const { P, T, card, chip, sectionHead, iconBox, lines, wrap, fitText, delay, svg } = K;

// Логотип — геометрия иконки расширения: лента-закладка (128×128: M32 10h64v108l-32-24-32 24z)
function ribbon(x, y, n, fill = '#fff') {
  const k = n / 128, p = (a, b) => `${(x + a * k).toFixed(1)} ${(y + b * k).toFixed(1)}`;
  return `<path d="M${p(32, 10)}L${p(96, 10)}L${p(96, 118)}L${p(64, 94)}L${p(32, 118)}z" fill="${fill}" stroke="${fill}" stroke-width="${(8 * k).toFixed(1)}" stroke-linejoin="round"/>`;
}

// Окно расширения: список закладок и кнопка добавления внизу (как в popup.css)
const SITES = [['GitHub', 92], ['Wikipedia', 116], ['Figma', 70], ['Hacker News', 132], ['Notion', 80]];
function popup(x, y, l) {
  const w = 300, rowH = 44, h = 12 + SITES.length * rowH + 12 + 48;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#161616" stroke="#2c2c2c"/>`;
  SITES.forEach(([name], i) => {
    const ry = y + 12 + i * rowH;
    const hover = i === 1;
    if (hover) s += `<rect x="${x + 6}" y="${ry}" width="${w - 12}" height="${rowH}" rx="8" fill="#1f1f1f"/>`;
    s += `<rect x="${x + 16}" y="${ry + 12}" width="20" height="20" rx="5" fill="#262626"/>`;
    s += `<text x="${x + 26}" y="${ry + 26.5}" text-anchor="middle" font-size="11" font-weight="700" fill="#8a8a8a">${T(name[0])}</text>`;
    s += `<text x="${x + 48}" y="${ry + 27}" font-size="14" font-weight="500" fill="#E8E8E8">${T(name)}</text>`;
    if (hover) s += `<text x="${x + w - 18}" y="${ry + 26.5}" text-anchor="end" font-size="12" font-weight="500" fill="#E26B5D" class="blink2">${T(l.del)}</text>`;
  });
  const fy = y + 12 + SITES.length * rowH + 12;
  s += `<line x1="${x}" y1="${fy}" x2="${x + w}" y2="${fy}" stroke="#262626"/>`;
  s += `<text x="${x + 20}" y="${fy + 30}" font-size="13" font-weight="500" fill="#7a7a7a">${T(l.add)}</text>`;
  return { s, h };
}
const BLINK = '.blink2{animation:b2 3s ease-in-out infinite}@keyframes b2{0%,30%{opacity:0}45%,85%{opacity:1}100%{opacity:0}}@media (prefers-reduced-motion:reduce){.blink2{animation:none}}';

// ---------- HERO ----------
function hero(l) {
  const W = 880;
  let b = `<g class="r"><rect x="40" y="36" width="36" height="36" rx="10" fill="#0E0E0E" stroke="#3a3a3a"/>${ribbon(46, 42, 24)}
<text x="88" y="62" font-size="24" font-weight="800" letter-spacing="-.4">${T('Marks')}</text></g>`;
  b += `<g class="r" ${delay(1)}>${chip(178, 39, 'v' + VERSION).s}</g>`;
  const ts = 34;
  const all = [...wrap(l.line1, 480, ts, 800), ...wrap('*' + l.line2 + '*', 480, ts, 800)];
  b += `<g class="r" ${delay(2)}>${lines(40, 150, all, { size: ts, weight: 800, lh: ts * 1.22, spacing: '-.8' })}</g>`;
  const pop = popup(0, 0, l);
  const H = Math.max(150 + (all.length - 1) * ts * 1.22 + 80, pop.h + 72);
  const py = (H - pop.h) / 2;
  b += `<g class="r" ${delay(3)}><ellipse cx="690" cy="${H / 2}" rx="200" ry="190" fill="url(#g1)"/>${popup(540, py, l).s}</g>`;
  return svg(W, H, l.alt, b + `<style>${BLINK}</style>`);
}

// ---------- ВОЗМОЖНОСТИ ----------
const FEAT_ICONS = [
  '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  '<path d="M12 19V5M6 11l6-6 6 6"/>',
  '<path d="M12 5v14M5 12h14"/>',
  '<path d="M6 6l12 12M18 6 6 18"/>',
  '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill="currentColor"/>',
  ICONS.lock,
];
function features(l) {
  const head = sectionHead(l.featuresTitle, l.featuresHead);
  let b = head.s;
  const cw = (800 - 2 * 12) / 3;
  const items = l.features.map(([t, d]) => [t, wrap(d, cw - 40, 14, 500)]);
  const ch = 92 + Math.max(...items.map(([, d]) => d.length)) * 20 + 4;
  items.forEach(([t, d], i) => {
    const x = 40 + (i % 3) * (cw + 12), y = head.y + Math.floor(i / 3) * (ch + 12);
    b += `<g class="r" ${delay(2 + i * 0.6)} color="#fff">${card(x, y, cw, ch)}${iconBox(x + 20, y + 20, FEAT_ICONS[i])}
${fitText(x + 72, y + 46, t, cw - 88, { size: 17, weight: 700 })}
${lines(x + 20, y + 92, d, { size: 14, weight: 500, lh: 20, fill: P.muted })}</g>`;
  });
  return svg(880, head.y + 2 * ch + 12 + 36, l.featuresAlt, b);
}

// ---------- В ЦИФРАХ ----------
function numbers(l) {
  const head = sectionHead(l.numbersChip, l.numbersHead);
  let b = head.s;
  const w = (800 - 3 * 12) / 4;
  l.numbers.forEach(([n, d], i) => {
    const x = 40 + i * (w + 12), y = head.y;
    const [num, unit = ''] = n.split(' ');
    b += `<g class="r" ${delay(2 + i)}>${card(x, y, w, 120)}
<text class="m" x="${x + 22}" y="${y + 58}" font-size="40" font-weight="700" letter-spacing="-1.5" fill="url(#tg)">${T(num)}<tspan font-size="17" fill="${P.muted}">${T(unit ? ' ' + unit : '')}</tspan></text>
${fitText(x + 22, y + 92, d, w - 40, { size: 14, weight: 500, fill: P.muted })}</g>`;
  });
  return svg(880, head.y + 120 + 36, l.numbersAlt, b);
}

// ---------- сборка ----------
const langs = {};
for (const [lang, l] of Object.entries(STR)) {
  langs[lang] = () => ({
    [`hero-${lang}.svg`]: hero(l),
    [`cta-${lang}.svg`]: K.button(l.cta, ICONS.download, true),
    [`features-${lang}.svg`]: features(l),
    [`numbers-${lang}.svg`]: numbers(l),
  });
}
await K.build(OUT, langs, 'Marksv.');
