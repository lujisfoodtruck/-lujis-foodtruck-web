require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'lujis-dev-secret-change-me';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
// The public URL of THIS backend once deployed (e.g. https://lujis-backend.onrender.com).
// Used to build absolute links to admin-uploaded photos so they load correctly
// even when the frontend is hosted on a different domain (e.g. Hostinger).
const BACKEND_PUBLIC_URL = (process.env.BACKEND_PUBLIC_URL || '').replace(/\/+$/, '');
// Comma-separated list of frontend origins allowed to call this API in production
// (e.g. "https://lujisfoodtruck.com,https://www.lujisfoodtruck.com").
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const EVENTS_FILE = path.join(__dirname, 'data', 'events.json');
const CONTACTS_FILE = path.join(__dirname, 'data', 'contacts.json');
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');
const PRODUCTS_UPLOAD_DIR = path.join(__dirname, 'public', 'assets', 'img', 'products');

const DEFAULT_SETTINGS = { deliveryDays: [2, 4], deliveryMinimum: 60 };

const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const productPhotoUpload = multer({
  storage: multer.diskStorage({
    destination: PRODUCTS_UPLOAD_DIR,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, crypto.randomUUID() + ext);
    }
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, ALLOWED_PHOTO_TYPES.has(file.mimetype));
  }
});

// Render (and most hosts) sit behind a proxy; trust it so secure cookies work.
app.set('trust proxy', 1);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow same-origin/non-browser requests (no Origin header) and localhost dev.
      if (!origin || !IS_PRODUCTION || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: IS_PRODUCTION ? 'none' : 'lax',
      secure: IS_PRODUCTION,
      maxAge: 1000 * 60 * 60 * 4
    }
  })
);
app.use(express.static(path.join(__dirname, 'public')));

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'No autorizado' });
}

function cleanString(value, maxLen) {
  return typeof value === 'string' ? value.trim().slice(0, maxLen) : '';
}

// ---------- Public: events ----------
app.get('/api/events', (req, res) => {
  const events = readJson(EVENTS_FILE, []);
  res.json(events);
});

// ---------- Public: contact form ----------
app.post('/api/contact', (req, res) => {
  const name = cleanString(req.body.name, 100);
  const email = cleanString(req.body.email, 150);
  const phone = cleanString(req.body.phone, 40);
  const message = cleanString(req.body.message, 1000);

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Nombre, email y mensaje son obligatorios.' });
  }

  const entry = {
    id: crypto.randomUUID(),
    name,
    email,
    phone,
    message,
    receivedAt: new Date().toISOString()
  };

  const contacts = readJson(CONTACTS_FILE, []);
  contacts.push(entry);
  writeJson(CONTACTS_FILE, contacts);

  res.json({ ok: true });
});

// ---------- Admin auth ----------
app.post('/api/admin/login', (req, res) => {
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (password && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Contraseña incorrecta.' });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/admin/session', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// ---------- Admin: events CRUD ----------
app.post('/api/admin/events', requireAdmin, (req, res) => {
  const place = cleanString(req.body.place, 150);
  const address = cleanString(req.body.address, 200);
  const date = cleanString(req.body.date, 20);
  const time = cleanString(req.body.time, 60);

  if (!place || !address || !date || !time) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const events = readJson(EVENTS_FILE, []);
  const newEvent = { id: crypto.randomUUID(), place, address, date, time };
  events.push(newEvent);
  writeJson(EVENTS_FILE, events);
  res.json(newEvent);
});

app.put('/api/admin/events/:id', requireAdmin, (req, res) => {
  const events = readJson(EVENTS_FILE, []);
  const idx = events.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Evento no encontrado.' });

  const place = cleanString(req.body.place, 150);
  const address = cleanString(req.body.address, 200);
  const date = cleanString(req.body.date, 20);
  const time = cleanString(req.body.time, 60);

  if (!place || !address || !date || !time) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  events[idx] = { id: req.params.id, place, address, date, time };
  writeJson(EVENTS_FILE, events);
  res.json(events[idx]);
});

app.delete('/api/admin/events/:id', requireAdmin, (req, res) => {
  const events = readJson(EVENTS_FILE, []);
  const next = events.filter((e) => e.id !== req.params.id);
  writeJson(EVENTS_FILE, next);
  res.json({ ok: true });
});

// ---------- Public: products ----------
app.get('/api/products', (req, res) => {
  const products = readJson(PRODUCTS_FILE, []);
  res.json(products);
});

// ---------- Admin: products CRUD ----------
function removePhotoFile(photoPath) {
  if (!photoPath) return;
  // photoPath may be a relative path ("/assets/img/products/x.jpg") or an
  // absolute URL (when BACKEND_PUBLIC_URL is set) — only the pathname matters.
  const match = photoPath.match(/\/assets\/img\/products\/[^/?#]+$/);
  if (!match) return;
  const abs = path.join(__dirname, 'public', match[0]);
  if (abs.startsWith(PRODUCTS_UPLOAD_DIR)) {
    fs.unlink(abs, () => {});
  }
}

function cleanCategory(value) {
  return value === 'frozen' ? 'frozen' : 'fresh';
}

function cleanUnit(value) {
  return value === 'docena' ? 'docena' : 'un';
}

function photoUrl(filename) {
  return BACKEND_PUBLIC_URL + '/assets/img/products/' + filename;
}

app.post('/api/admin/products', requireAdmin, productPhotoUpload.single('photo'), (req, res) => {
  const title = cleanString(req.body.title, 100);
  const description = cleanString(req.body.description, 300);
  const price = Number(req.body.price);
  const category = cleanCategory(req.body.category);
  const unit = cleanUnit(req.body.unit);

  if (!title || !Number.isFinite(price) || price < 0) {
    return res.status(400).json({ error: 'Título y precio válido son obligatorios.' });
  }

  const products = readJson(PRODUCTS_FILE, []);
  const newProduct = {
    id: crypto.randomUUID(),
    title,
    description,
    price,
    photo: req.file ? photoUrl(req.file.filename) : null,
    category,
    unit
  };
  products.push(newProduct);
  writeJson(PRODUCTS_FILE, products);
  res.json(newProduct);
});

app.put('/api/admin/products/:id', requireAdmin, productPhotoUpload.single('photo'), (req, res) => {
  const products = readJson(PRODUCTS_FILE, []);
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado.' });

  const title = cleanString(req.body.title, 100);
  const description = cleanString(req.body.description, 300);
  const price = Number(req.body.price);
  const category = cleanCategory(req.body.category);
  const unit = cleanUnit(req.body.unit);

  if (!title || !Number.isFinite(price) || price < 0) {
    return res.status(400).json({ error: 'Título y precio válido son obligatorios.' });
  }

  let photo = products[idx].photo;
  if (req.file) {
    removePhotoFile(photo);
    photo = photoUrl(req.file.filename);
  } else if (req.body.removePhoto === 'true') {
    removePhotoFile(photo);
    photo = null;
  }

  products[idx] = { id: req.params.id, title, description, price, photo, category, unit };
  writeJson(PRODUCTS_FILE, products);
  res.json(products[idx]);
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  const products = readJson(PRODUCTS_FILE, []);
  const target = products.find((p) => p.id === req.params.id);
  if (target) removePhotoFile(target.photo);
  const next = products.filter((p) => p.id !== req.params.id);
  writeJson(PRODUCTS_FILE, next);
  res.json({ ok: true });
});

// ---------- Public: order settings ----------
app.get('/api/settings', (req, res) => {
  res.json(readJson(SETTINGS_FILE, DEFAULT_SETTINGS));
});

// ---------- Admin: order settings ----------
app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const rawDays = Array.isArray(req.body.deliveryDays) ? req.body.deliveryDays : [];
  const deliveryDays = [...new Set(rawDays.map(Number))]
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
    .sort((a, b) => a - b);
  const deliveryMinimum = Number(req.body.deliveryMinimum);

  if (deliveryDays.length === 0 || !Number.isFinite(deliveryMinimum) || deliveryMinimum < 0) {
    return res.status(400).json({ error: 'Elegí al menos un día de delivery y un mínimo válido.' });
  }

  const settings = { deliveryDays, deliveryMinimum };
  writeJson(SETTINGS_FILE, settings);
  res.json(settings);
});

app.listen(PORT, () => {
  console.log(`Luji's Foodtruck server listening on http://localhost:${PORT}`);
});
