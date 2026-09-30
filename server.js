const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const DATA_FILE = path.join(__dirname, 'data', 'links.json');

// Ensure data directory and file exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([
    {
      id: '1',
      title: 'Instagram',
      handle: '@nasieeeev',
      url: 'https://www.instagram.com/nasieeeev',
      icon: 'instagram'
    },
    {
      id: '2',
      title: 'TikTok',
      handle: '@extazzzy077',
      url: 'https://www.tiktok.com/@extazzzy077',
      icon: 'tiktok'
    }
  ], null, 2));
}

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Helpers
function readLinks() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeLinks(links) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2));
}

function isAuth(req) {
  return req.cookies && req.cookies.admin_auth === 'true';
}

// Public API — get links
app.get('/api/links', (req, res) => {
  res.json(readLinks());
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.cookie('admin_auth', 'true', {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax'
    });
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, error: 'Неверный пароль' });
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('admin_auth');
  res.json({ success: true });
});

// Check auth
app.get('/api/admin/check', (req, res) => {
  res.json({ authenticated: isAuth(req) });
});

// Admin — get links (same data)
app.get('/api/admin/links', (req, res) => {
  if (!isAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
  res.json(readLinks());
});

// Admin — add link
app.post('/api/admin/links', (req, res) => {
  if (!isAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { title, handle, url, icon } = req.body;
  if (!title || !url) return res.status(400).json({ error: 'Title and URL required' });

  const links = readLinks();
  const newLink = {
    id: uuidv4(),
    title: title.trim(),
    handle: (handle || '').trim(),
    url: url.trim(),
    icon: (icon || 'link').trim().toLowerCase()
  };
  links.push(newLink);
  writeLinks(links);
  res.json(newLink);
});

// Admin — update link
app.put('/api/admin/links/:id', (req, res) => {
  if (!isAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const { title, handle, url, icon } = req.body;

  const links = readLinks();
  const idx = links.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  links[idx] = {
    ...links[idx],
    title: title !== undefined ? title.trim() : links[idx].title,
    handle: handle !== undefined ? handle.trim() : links[idx].handle,
    url: url !== undefined ? url.trim() : links[idx].url,
    icon: icon !== undefined ? icon.trim().toLowerCase() : links[idx].icon
  };
  writeLinks(links);
  res.json(links[idx]);
});

// Admin — delete link
app.delete('/api/admin/links/:id', (req, res) => {
  if (!isAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  let links = readLinks();
  const before = links.length;
  links = links.filter(l => l.id !== id);
  if (links.length === before) return res.status(404).json({ error: 'Not found' });
  writeLinks(links);
  res.json({ success: true });
});

// Admin — reorder
app.put('/api/admin/reorder', (req, res) => {
  if (!isAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { order } = req.body; // array of ids
  if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be array' });

  const links = readLinks();
  const map = Object.fromEntries(links.map(l => [l.id, l]));
  const reordered = order.map(id => map[id]).filter(Boolean);
  // append any missing
  links.forEach(l => {
    if (!order.includes(l.id)) reordered.push(l);
  });
  writeLinks(reordered);
  res.json(reordered);
});

// SPA fallback for admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin password: ${ADMIN_PASSWORD === 'admin123' ? 'admin123 (change via ADMIN_PASSWORD env)' : '***'}`);
});
