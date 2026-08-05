# Luji's Foodtruck — Landing Page

Landing page estilo Miami/fiesta para Luji's Foodtruck (empanadas argentinas), con panel admin oculto para editar los próximos eventos.

## Cómo correrlo

```bash
npm install
cp .env.example .env   # y editá los valores
npm start
```

Abrí `http://localhost:3000`.

## Variables de entorno (`.env`)

- `PORT` — puerto del servidor (default 3000).
- `ADMIN_PASSWORD` — contraseña del panel admin (`/admin`). **Cambiala antes de publicar el sitio.**
- `SESSION_SECRET` — secreto de sesión. **Cambialo por uno propio y no lo compartas.**

## Estructura

```
public/
  index.html        Landing principal (hero, menú, catering, testimonios, eventos, contacto)
  menu.html         Menú completo + armado de pedido (envía por WhatsApp)
  admin/index.html  Panel oculto para gestionar eventos (protegido por contraseña)
  assets/css        Sistema de diseño (tokens de color/tipografía, mobile-first, rem)
  assets/js         Lógica de front (nav, eventos, formulario, carrito, admin)
data/
  events.json       Eventos (lugar, dirección, fecha, horario) — editable desde /admin
  contacts.json     Mensajes recibidos por el formulario de contacto (se crea solo)
server.js           Backend Express: sirve el sitio y expone la API
```

## Cosas para ajustar antes de publicar

1. **Número de WhatsApp**: en [`public/assets/js/menu.js`](public/assets/js/menu.js) cambiá `WHATSAPP_NUMBER` por el número real (sin `+` ni espacios, con código de país).
2. **Contraseña de admin**: definí `ADMIN_PASSWORD` en `.env` (no dejes la de ejemplo).
3. **Datos de contacto**: teléfono/email en `index.html` (sección Contact) y el footer.
4. **Menú y precios**: los sabores de empanadas en `index.html` (teaser) y `menu.js` (menú completo) son de ejemplo — reemplazalos por los reales.
5. **Imágenes**: no se usaron fotos porque todavía no las tenemos — todas las ilustraciones son SVG (livianas, ya optimizadas). Cuando tengas fotos reales del truck/empanadas, convertilas a `.webp` (calidad ~75-80, ancho máx. ~1600px para hero, ~800px para cards) y las metemos en `public/assets/img/`.

## Panel admin de eventos

Entrá a `/admin`, ingresá la contraseña y vas a poder agregar, editar y eliminar eventos (lugar, dirección, fecha, horario). Cada evento muestra automáticamente un mapa de Google Maps embebido según la dirección cargada — no hace falta API key.

## Deploy

Cualquier hosting que corra Node (Render, Railway, un VPS, etc.) sirve. Como usa sesión en memoria y un archivo JSON como base de datos, andá con cuidado si el hosting reinicia el filesystem en cada deploy (los eventos cargados desde `/admin` se perderían). Para producción real a futuro, migrar `data/events.json` a una base de datos (ej. Supabase) es la mejora natural.
