# Deploy: backend on Render + site on Hostinger

Tu plan de Hostinger no soporta Node.js, así que separamos el proyecto en dos partes:

- **Backend** (`server.js`, panel admin, API de eventos/productos/contacto) → Render.com (gratis)
- **Frontend** (todo lo de `public/`) → tu hosting de Hostinger, tal como lo tenés pensado

Seguí estos pasos en orden. Ya te dejé todo el código listo (CORS, URLs configurables, etc.) — solo falta la parte de "apretar botones" en las webs de Render/Hostinger/GitHub, que no puedo hacer por vos.

## 1. Subir el código a GitHub

El proyecto ya tiene un repo git local con un commit hecho. Te falta:

1. Andá a [github.com](https://github.com) y creá una cuenta si no tenés.
2. Creá un repositorio nuevo (botón "New repository"). Dejalo **privado** si preferís, no hace falta que sea público. No marques "Add a README" (ya tenemos uno).
3. GitHub te va a mostrar comandos para conectar tu repo local. Corré esto en la carpeta del proyecto (reemplazá la URL por la que te dé GitHub):

```bash
git remote add origin https://github.com/TU-USUARIO/lujis-foodtruck.git
git branch -M main
git push -u origin main
```

Te va a pedir que inicies sesión en GitHub (usá tu usuario y un "Personal Access Token" en vez de contraseña si te lo pide — GitHub te guía en el momento).

## 2. Crear el backend en Render

1. Andá a [render.com](https://render.com) y creá una cuenta gratis (podés entrar directo con GitHub).
2. En el dashboard, **New +** → **Web Service**.
3. Conectá tu repo de GitHub (`lujis-foodtruck`).
4. Configurá:
   - **Name**: `lujis-backend` (o el que quieras)
   - **Region**: la más cercana (US East sirve bien para Miami)
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free
5. En **Environment Variables**, agregá:
   - `NODE_ENV` = `production`
   - `ADMIN_PASSWORD` = *(elegí una contraseña real, no la de prueba)*
   - `SESSION_SECRET` = *(cualquier texto largo random)*
   - `ALLOWED_ORIGINS` = tu dominio de Hostinger, ej: `https://lujisfoodtruck.com,https://www.lujisfoodtruck.com` (sin barra al final, separado por coma si son varios)
   - `BACKEND_PUBLIC_URL` = lo completás en el paso 3, una vez que sepas la URL que te da Render
6. Deploy. Cuando termine, Render te da una URL tipo `https://lujis-backend.onrender.com` — **copiala**.

> ⚠️ Plan gratis de Render: el servidor "se duerme" después de un rato sin uso, y el primer pedido después de eso tarda ~30-50 segundos en responder (después va normal). Si eso te molesta para el panel admin, se puede pasar a un plan pago (~$7/mes) más adelante sin cambiar nada de código.

## 3. Conectar el frontend con el backend

Con la URL de Render en mano:

1. En Render, volvé a **Environment Variables** y completá `BACKEND_PUBLIC_URL` con esa misma URL (sin barra al final). Guardá — Render va a reiniciar el servicio solo.
2. En tu proyecto local, abrí [public/assets/js/config.js](public/assets/js/config.js) y reemplazá esta línea:

```js
var PRODUCTION_API_BASE = "https://REPLACE-WITH-YOUR-RENDER-URL.onrender.com";
```

con tu URL real de Render (sin barra al final).

3. Guardá, y subí el cambio a GitHub también (no es obligatorio para el backend, pero mantiene todo sincronizado):

```bash
git add public/assets/js/config.js
git commit -m "Set production API base URL"
git push
```

## 4. Subir el frontend a Hostinger

Solo subís el contenido de la carpeta **`public/`** (no `server.js`, no `data/`, no `node_modules/`, no `package.json`).

1. En el hPanel de Hostinger, entrá a **File Manager** (o usá FTP).
2. Andá a la carpeta `public_html` (o la carpeta raíz de tu dominio).
3. Subí **todo el contenido de `public/`** ahí adentro — es decir, `index.html`, `menu.html`, la carpeta `admin/` y la carpeta `assets/` van directo dentro de `public_html`, no dentro de una subcarpeta `public`.

## 5. Probar todo

Una vez subido:

- [ ] Entrá a tu dominio y confirmá que carga el hero, el menú, la galería
- [ ] Entrá a `tudominio.com/menu.html` y probá armar un pedido (debería abrir WhatsApp)
- [ ] Entrá a `tudominio.com/admin/`, iniciá sesión con la contraseña que pusiste en Render, y confirmá que podés ver/editar eventos y productos
- [ ] Probá el formulario de contacto
- [ ] Si algo no carga, abrí la consola del navegador (F12 → Console) y fijate si hay errores de CORS — si los hay, revisá que `ALLOWED_ORIGINS` en Render tenga EXACTAMENTE tu dominio (con `https://`, sin barra final)

## Notas

- **Contraseña de admin**: la que pusiste como `ADMIN_PASSWORD` en Render. Si la olvidás, la cambiás ahí mismo (Environment Variables → Save → redeploy automático).
- **Datos** (eventos, productos, mensajes de contacto): viven como archivos en el disco de Render. Si en algún momento cambiás de plan o Render reinicia el disco, revisá que persistan — si no, el siguiente paso natural es migrar `data/*.json` a una base de datos real (te puedo ayudar con eso cuando llegue el momento).
