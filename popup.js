const list = document.getElementById('list');
const form = document.getElementById('add');
const addTitle = document.getElementById('add-title');
const addUrl = document.getElementById('add-url');
const addFolder = document.getElementById('add-folder');

const favicon = (url) =>
  `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`;

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function hasBookmarks(node) {
  return node.url || (node.children || []).some(hasBookmarks);
}

function renderItem(node) {
  const row = el('div', 'item');
  row.title = node.url;

  const img = el('img', 'fav');
  img.src = favicon(node.url);
  img.alt = '';
  img.addEventListener('error', () => {
    let host = '';
    try { host = new URL(node.url).hostname.replace(/^www\./, ''); } catch {}
    img.replaceWith(el('span', 'fav letter', (node.title || host || '?')[0].toUpperCase()));
  });

  const name = el('span', 'name', node.title || node.url);

  const del = el('button', 'del', '✕');
  del.title = 'Удалить';
  del.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!del.classList.contains('armed')) {
      del.classList.add('armed');
      del.textContent = 'удалить?';
      setTimeout(() => {
        del.classList.remove('armed');
        del.textContent = '✕';
      }, 2500);
      return;
    }
    await chrome.bookmarks.remove(node.id);
    render();
  });

  row.append(img, name, del);
  row.addEventListener('click', (e) => {
    chrome.tabs.create({ url: node.url, active: !(e.ctrlKey || e.metaKey) });
    if (!(e.ctrlKey || e.metaKey)) window.close();
  });
  row.addEventListener('auxclick', (e) => {
    if (e.button === 1) chrome.tabs.create({ url: node.url, active: false });
  });
  return row;
}

function renderFolder(node, open) {
  const box = el('details', 'folder');
  box.open = open;
  box.append(el('summary', null, node.title || 'Без названия'));
  const links = node.children.filter((c) => c.url).sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
  for (const child of links) box.append(renderItem(child));
  for (const child of node.children) {
    if (!child.url && hasBookmarks(child)) box.append(renderFolder(child, false));
  }
  return box;
}

function collectFolders(node, depth, out) {
  if (node.url) return;
  if (depth >= 0) out.push({ id: node.id, title: node.title, depth });
  for (const child of node.children || []) collectFolders(child, depth + 1, out);
}

async function render() {
  const [root] = await chrome.bookmarks.getTree();
  list.replaceChildren();

  // Корневые папки («Панель закладок», «Другие закладки») без заголовков:
  // их закладки идут общим списком сверху, вложенные папки — ниже.
  const tops = root.children;
  const links = tops
    .flatMap((top) => top.children.filter((c) => c.url))
    .sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
  const subfolders = tops.flatMap((top) => top.children.filter((c) => !c.url && hasBookmarks(c)));

  if (!links.length && !subfolders.length) list.append(el('div', 'empty', 'Закладок пока нет'));
  for (const link of links) list.append(renderItem(link));
  for (const folder of subfolders) list.append(renderFolder(folder, false));

  const folders = [];
  root.children.forEach((c) => collectFolders(c, 0, folders));
  const selected = addFolder.value;
  addFolder.replaceChildren(
    ...folders.map((f) => {
      const o = el('option', null, '  '.repeat(f.depth) + (f.title || 'Без названия'));
      o.value = f.id;
      return o;
    })
  );
  if (selected) addFolder.value = selected;
}

async function openForm() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  addTitle.value = tab?.title || '';
  addUrl.value = tab?.url && /^https?:|^file:/.test(tab.url) ? tab.url : '';
  form.hidden = false;
  (addUrl.value ? addTitle : addUrl).focus();
}

document.getElementById('toggle-add').addEventListener('click', () => {
  if (form.hidden) openForm();
  else form.hidden = true;
});

document.getElementById('add-cancel').addEventListener('click', () => {
  form.hidden = true;
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  let url = addUrl.value.trim();
  if (!url) return;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) url = 'https://' + url;
  await chrome.bookmarks.create({
    parentId: addFolder.value,
    index: 0,
    title: addTitle.value.trim() || url,
    url,
  });
  form.hidden = true;
  render();
});

render();
