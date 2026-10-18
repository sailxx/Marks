// SVG-плашки README: белый фон, тонкая рамка, без свечений и анимаций. Шрифты Golos Text и JetBrains Mono
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
  accent: { hi: '#111111', grad: ['#111111', '#111111'], on: '#FFFFFF', glow: '#000000', glow2: '#000000', btn: ['#111111', '#111111'] },
});
const { T, esc, fitText, fontCss } = K;

const C = { ink: '#111111', muted: '#6B6B6B', line: '#E6E6E6', soft: '#F4F4F4' };
const W = 880;

/** Плашка: белый фон и тонкая рамка. */
const svg = (h, label, body) => (fg, fm) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(label)}">
<style>${fontCss(fg, fm)}</style>
<rect x=".5" y=".5" width="${W - 1}" height="${h - 1}" rx="16" fill="#fff" stroke="${C.line}"/>
${body}
</svg>
`;
const text = (x, y, s, { size, weight = 500, fill = C.ink, mono = false, anchor } = {}) =>
  `<text${mono ? ' class="m"' : ''} x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}"${anchor ? ` text-anchor="${anchor}"` : ''}>${T(s)}</text>`;

// Логотип — геометрия иконки расширения: лента-закладка (128×128: M32 10h64v108l-32-24-32 24z)
function ribbon(x, y, n, fill = C.ink) {
  const k = n / 128, p = (a, b) => `${(x + a * k).toFixed(1)} ${(y + b * k).toFixed(1)}`;
  return `<path d="M${p(32, 10)}L${p(96, 10)}L${p(96, 118)}L${p(64, 94)}L${p(32, 118)}z" fill="${fill}" stroke="${fill}" stroke-width="${(8 * k).toFixed(1)}" stroke-linejoin="round"/>`;
}

// Окно расширения в светлой теме (как в popup.css)
const SITES = ['GitHub', 'Wikipedia', 'Figma', 'Hacker News'];
function popup(x, y, l) {
  const w = 280, rowH = 40;
  const h = 8 + SITES.length * rowH + 8 + 42;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#fff" stroke="${C.line}"/>`;
  SITES.forEach((name, i) => {
    const ry = y + 8 + i * rowH;
    const hover = i === 1;
    if (hover) s += `<rect x="${x + 6}" y="${ry}" width="${w - 12}" height="${rowH}" rx="6" fill="${C.soft}"/>`;
    s += `<rect x="${x + 16}" y="${ry + 10}" width="20" height="20" rx="5" fill="#EBEBEB"/>`;
    s += text(x + 26, ry + 24.5, name[0], { size: 11, weight: 700, fill: '#8A8A8A', anchor: 'middle' });
    s += text(x + 48, ry + 25, name, { size: 14 });
    if (hover) s += text(x + w - 18, ry + 24.5, l.del, { size: 12, fill: '#C0392B', anchor: 'end' });
  });
  const fy = y + 8 + SITES.length * rowH + 8;
  s += `<line x1="${x}" y1="${fy}" x2="${x + w}" y2="${fy}" stroke="${C.line}"/>`;
  s += text(x + 20, fy + 27, l.add, { size: 13, fill: C.muted });
  return { s, h };
}

// ---------- HERO ----------
function hero(l) {
  const pop = popup(0, 0, l);
  const H = pop.h + 64;
  let b = ribbon(40, 40, 30) + text(78, 63, 'Marks', { size: 22, weight: 700 }) +
    text(78 + K.width('Marks', 22, 700) + 10, 63, 'v' + VERSION, { size: 13, mono: true, fill: C.muted });
  b += fitText(40, H / 2 + 12, l.title, 470, { size: 30, weight: 700, fill: C.ink });
  b += fitText(40, H / 2 + 44, l.sub, 470, { size: 16, weight: 500, fill: C.muted });
  b += popup(W - 40 - 280, (H - pop.h) / 2, l).s;
  return svg(H, l.alt, b);
}

// ---------- УПРАВЛЕНИЕ ----------
function controls(l) {
  const rowH = 44, top = 76;
  let b = text(40, 54, l.controlsTitle, { size: 20, weight: 700 });
  l.controls.forEach(([k, d], i) => {
    const y = top + i * rowH;
    b += `<line x1="40" y1="${y}" x2="${W - 40}" y2="${y}" stroke="${C.line}"/>`;
    b += text(40, y + 28, k, { size: 14, weight: 600, mono: true });
    b += text(260, y + 28, d, { size: 15, fill: C.muted });
  });
  const fy = top + l.controls.length * rowH;
  b += `<line x1="40" y1="${fy}" x2="${W - 40}" y2="${fy}" stroke="${C.line}"/>`;
  b += fitText(40, fy + 40, l.facts, W - 80, { size: 14, weight: 500, fill: C.muted });
  return svg(fy + 68, l.controlsAlt, b);
}

// ---------- сборка ----------
const langs = {};
for (const [lang, l] of Object.entries(STR)) {
  langs[lang] = () => ({
    [`hero-${lang}.svg`]: hero(l),
    [`cta-${lang}.svg`]: K.button(l.cta, ICONS.download, true),
    [`controls-${lang}.svg`]: controls(l),
  });
}
await K.build(OUT, langs, 'Marksv.');
