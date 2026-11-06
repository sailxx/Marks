// In-memory browser API fixture for visual checks; no real bookmarks are touched.
const folder = { id: '1', title: 'Bookmarks bar', children: [
  { id: '10', title: 'YouTube', url: 'https://youtube.com', dateAdded: 6 },
  { id: '11', title: 'Gmail', url: 'https://mail.google.com', dateAdded: 5 },
  { id: '12', title: 'Behance', url: 'https://behance.net', dateAdded: 4 },
  { id: '13', title: 'Landbook', url: 'https://land-book.com', dateAdded: 3 },
  { id: '14', title: 'Supahero', url: 'https://supahero.io', dateAdded: 2 },
  { id: '15', title: 'Recent Design', url: 'https://recent.design', dateAdded: 1 },
  { id: '2', title: 'Design', children: [
    { id: '20', title: 'Minimal Gallery', url: 'https://minimal.gallery' }
  ] }
] };
window.chrome = {
  runtime: { id: 'preview' },
  bookmarks: {
    getTree: async () => [{ id: '0', children: [folder] }],
    create: async (data) => {
      const parent = data.parentId === '2' ? folder.children.find(n => n.id === '2') : folder;
      parent.children.unshift({ ...data, id: String(Date.now()), dateAdded: Date.now() });
    },
    remove: async (id) => {
      folder.children = folder.children.filter(n => n.id !== id);
      for (const node of folder.children) if (node.children) node.children = node.children.filter(n => n.id !== id);
    }
  },
  tabs: {
    query: async () => [{ title: 'Marks preview', url: 'https://example.com' }],
    create: async (data) => { window.lastOpenedTab = data; }
  }
};
