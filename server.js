require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
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
fs.mkdirSync(PRODUCTS_UPLOAD_DIR, { recursive: true });
const EVENTS_VIDEO_DIR = path.join(__dirname, 'public', 'assets', 'video', 'events');
const EVENTS_FLYER_DIR = path.join(__dirname, 'public', 'assets', 'pdf', 'events');
fs.mkdirSync(EVENTS_VIDEO_DIR, { recursive: true });
fs.mkdirSync(EVENTS_FLYER_DIR, { recursive: true });

const DEFAULT_SETTINGS = { deliveryDays: [2, 4], deliveryMinimum: 60, halfDozenPrice: 32, dozenPrice: 52 };

const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const productPhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_PHOTO_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('UNSUPPORTED_PHOTO_TYPE'));
    }
  }
});

// Resizes/compresses an uploaded photo (from memory) down to a lightweight
// webp file on disk, and returns its public URL. Keeps the site's images
// optimized even when the source photo comes straight off someone's phone.
async function saveOptimizedPhoto(fileBuffer) {
  const filename = crypto.randomUUID() + '.webp';
  const destPath = path.join(PRODUCTS_UPLOAD_DIR, filename);
  await sharp(fileBuffer)
    .rotate()
    .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(destPath);
  return photoUrl(filename);
}

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

// ---------- Event media (video/flyer) uploads ----------
const eventMediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      return file.mimetype === 'video/mp4' ? cb(null, true) : cb(new Error('UNSUPPORTED_VIDEO_TYPE'));
    }
    if (file.fieldname === 'flyer') {
      return file.mimetype === 'application/pdf' ? cb(null, true) : cb(new Error('UNSUPPORTED_FLYER_TYPE'));
    }
    cb(new Error('UNSUPPORTED_FIELD'));
  }
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'flyer', maxCount: 1 }
]);

function saveEventFile(buffer, dir, publicDir, ext) {
  const filename = crypto.randomUUID() + ext;
  fs.writeFileSync(path.join(dir, filename), buffer);
  return BACKEND_PUBLIC_URL + '/assets/' + publicDir + '/events/' + filename;
}

function removeEventFile(fileUrl, publicDir, dir) {
  if (!fileUrl) return;
  const match = fileUrl.match(new RegExp('/assets/' + publicDir + '/events/[^/?#]+$'));
  if (!match) return;
  const abs = path.join(__dirname, 'public', match[0]);
  if (abs.startsWith(dir)) fs.unlink(abs, () => {});
}

function saveEventVideo(buffer) {
  return saveEventFile(buffer, EVENTS_VIDEO_DIR, 'video', '.mp4');
}
function saveEventFlyer(buffer) {
  return saveEventFile(buffer, EVENTS_FLYER_DIR, 'pdf', '.pdf');
}
function removeEventVideo(url) {
  removeEventFile(url, 'video', EVENTS_VIDEO_DIR);
}
function removeEventFlyer(url) {
  removeEventFile(url, 'pdf', EVENTS_FLYER_DIR);
}

// ---------- Health check (for uptime pingers, keeps Render's free tier awake) ----------
app.get('/health', (req, res) => {
  res.status(200).send('ok');
});

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
app.post('/api/admin/events', requireAdmin, eventMediaUpload, (req, res) => {
  const place = cleanString(req.body.place, 150);
  const address = cleanString(req.body.address, 200);
  const date = cleanString(req.body.date, 20);
  const dateEnd = cleanString(req.body.dateEnd, 20);
  const time = cleanString(req.body.time, 60);
  const mapsUrl = cleanString(req.body.mapsUrl, 300);
  const instagram = cleanString(req.body.instagram, 300);

  if (!place || !address || !date || !time) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  let video = null;
  let flyer = null;
  try {
    if (req.files && req.files.video && req.files.video[0]) {
      video = saveEventVideo(req.files.video[0].buffer);
    }
    if (req.files && req.files.flyer && req.files.flyer[0]) {
      flyer = saveEventFlyer(req.files.flyer[0].buffer);
    }
  } catch (err) {
    console.error('Event media processing failed:', err);
    return res.status(400).json({ error: 'No pudimos procesar el video o PDF adjunto.' });
  }

  const events = readJson(EVENTS_FILE, []);
  const newEvent = {
    id: crypto.randomUUID(),
    place,
    address,
    date,
    dateEnd: dateEnd || null,
    time,
    mapsUrl: mapsUrl || null,
    instagram: instagram || null,
    video,
    flyer
  };
  events.push(newEvent);
  writeJson(EVENTS_FILE, events);
  res.json(newEvent);
});

app.put('/api/admin/events/:id', requireAdmin, eventMediaUpload, (req, res) => {
  const events = readJson(EVENTS_FILE, []);
  const idx = events.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Evento no encontrado.' });

  const place = cleanString(req.body.place, 150);
  const address = cleanString(req.body.address, 200);
  const date = cleanString(req.body.date, 20);
  const dateEnd = cleanString(req.body.dateEnd, 20);
  const time = cleanString(req.body.time, 60);
  const mapsUrl = cleanString(req.body.mapsUrl, 300);
  const instagram = cleanString(req.body.instagram, 300);

  if (!place || !address || !date || !time) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  let video = events[idx].video || null;
  let flyer = events[idx].flyer || null;

  try {
    if (req.files && req.files.video && req.files.video[0]) {
      removeEventVideo(video);
      video = saveEventVideo(req.files.video[0].buffer);
    } else if (req.body.removeVideo === 'true') {
      removeEventVideo(video);
      video = null;
    }
    if (req.files && req.files.flyer && req.files.flyer[0]) {
      removeEventFlyer(flyer);
      flyer = saveEventFlyer(req.files.flyer[0].buffer);
    } else if (req.body.removeFlyer === 'true') {
      removeEventFlyer(flyer);
      flyer = null;
    }
  } catch (err) {
    console.error('Event media processing failed:', err);
    return res.status(400).json({ error: 'No pudimos procesar el video o PDF adjunto.' });
  }

  events[idx] = {
    id: req.params.id,
    place,
    address,
    date,
    dateEnd: dateEnd || null,
    time,
    mapsUrl: mapsUrl || null,
    instagram: instagram || null,
    video,
    flyer
  };
  writeJson(EVENTS_FILE, events);
  res.json(events[idx]);
});

app.delete('/api/admin/events/:id', requireAdmin, (req, res) => {
  const events = readJson(EVENTS_FILE, []);
  const target = events.find((e) => e.id === req.params.id);
  if (target) {
    removeEventVideo(target.video);
    removeEventFlyer(target.flyer);
  }
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

app.post('/api/admin/products', requireAdmin, productPhotoUpload.single('photo'), async (req, res) => {
  const title = cleanString(req.body.title, 100);
  const description = cleanString(req.body.description, 300);
  const price = Number(req.body.price);
  const category = cleanCategory(req.body.category);
  const unit = cleanUnit(req.body.unit);

  if (!title || !Number.isFinite(price) || price < 0) {
    return res.status(400).json({ error: 'Título y precio válido son obligatorios.' });
  }

  let photo = null;
  if (req.file) {
    try {
      photo = await saveOptimizedPhoto(req.file.buffer);
    } catch (err) {
      console.error('Photo processing failed:', err);
      return res.status(400).json({ error: 'No pudimos procesar esa imagen. Probá con otro archivo JPG, PNG o WEBP.' });
    }
  }

  const products = readJson(PRODUCTS_FILE, []);
  const newProduct = {
    id: crypto.randomUUID(),
    title,
    description,
    price,
    photo,
    category,
    unit
  };
  products.push(newProduct);
  writeJson(PRODUCTS_FILE, products);
  res.json(newProduct);
});

app.put('/api/admin/products/:id', requireAdmin, productPhotoUpload.single('photo'), async (req, res) => {
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
    let newPhoto;
    try {
      newPhoto = await saveOptimizedPhoto(req.file.buffer);
    } catch (err) {
      console.error('Photo processing failed:', err);
      return res.status(400).json({ error: 'No pudimos procesar esa imagen. Probá con otro archivo JPG, PNG o WEBP.' });
    }
    removePhotoFile(photo);
    photo = newPhoto;
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
  const halfDozenPrice = Number(req.body.halfDozenPrice);
  const dozenPrice = Number(req.body.dozenPrice);

  if (
    deliveryDays.length === 0 ||
    !Number.isFinite(deliveryMinimum) ||
    deliveryMinimum < 0 ||
    !Number.isFinite(halfDozenPrice) ||
    halfDozenPrice < 0 ||
    !Number.isFinite(dozenPrice) ||
    dozenPrice < 0
  ) {
    return res.status(400).json({ error: 'Revisá los días de delivery y que los precios/mínimo sean válidos.' });
  }

  const settings = { deliveryDays, deliveryMinimum, halfDozenPrice, dozenPrice };
  writeJson(SETTINGS_FILE, settings);
  res.json(settings);
});

// ---------- Error handler (keeps upload/photo errors as clean JSON) ----------
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      if (err.field === 'photo') {
        return res.status(400).json({ error: 'La imagen es demasiado grande (máx. 8MB).' });
      }
      return res.status(400).json({ error: 'El archivo es demasiado grande (máx. 25MB).' });
    }
    return res.status(400).json({ error: 'No pudimos subir el archivo. Intentá de nuevo.' });
  }
  if (err && err.message === 'UNSUPPORTED_PHOTO_TYPE') {
    return res.status(400).json({ error: 'Formato de imagen no soportado. Usá JPG, PNG o WEBP.' });
  }
  if (err && err.message === 'UNSUPPORTED_VIDEO_TYPE') {
    return res.status(400).json({ error: 'Formato de video no soportado. Usá MP4.' });
  }
  if (err && err.message === 'UNSUPPORTED_FLYER_TYPE') {
    return res.status(400).json({ error: 'Formato de archivo no soportado. Usá PDF.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor.' });
});

app.listen(PORT, () => {
  console.log(`Luji's Foodtruck server listening on http://localhost:${PORT}`);
});
