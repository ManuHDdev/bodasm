# Invitación de Boda — José Andrés & Silvia

Web de invitación de boda. Boda el 28 de noviembre de 2025 en la Parroquia San Bartolomé de La Coronada (Badajoz).

## Stack

- **Frontend:** HTML5 + CSS3 + Vanilla JS — servido por nginx dentro de Docker
- **Backend:** Node.js + Express + SQLite (better-sqlite3)
- **Despliegue:** Docker Compose en servidor propio

---

## Estructura del proyecto

```
InvitacionBoda/
├── frontend/
│   ├── index.html
│   ├── css/styles.css
│   ├── js/main.js
│   ├── nginx.conf        ← configuración nginx dentro del contenedor
│   └── Dockerfile
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── routes/rsvp.js
│   ├── data/             ← base de datos SQLite (ignorada por git)
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
├── nginx-vhost.conf      ← para el nginx del servidor (no Docker)
├── .env.example
└── .gitignore
```

---

## Desarrollo local

### Requisitos
- Docker Desktop
- Node.js 20+

### Arrancar

```bash
# 1. Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 2. Construir y arrancar
docker compose up --build

# 3. Abrir en el navegador
# http://localhost:3080
```

### Verificar que funciona

```bash
# Frontend
curl http://localhost:3080

# Backend (debe devolver 401 sin API key)
curl http://localhost:3001/api/rsvp

# Backend con API key
curl -H "Authorization: Bearer TU_API_KEY" http://localhost:3001/api/rsvp
```

### Desarrollo del backend sin Docker

```bash
cd backend
cp .env.example .env   # editar con tus valores
npm install
npm run dev            # node --watch server.js
```

---

## Personalización por invitado

La URL acepta el parámetro `?invitado=Nombre`:

```
https://tudominio.com?invitado=María
```

El frontend muestra "Hola, María" en el sobre y pre-rellena el formulario RSVP. El nombre también se almacena junto a la confirmación en la base de datos.

---

## API

### POST `/api/rsvp`

Confirmar asistencia.

**Body (JSON):**
```json
{
  "nombre": "Ana García",
  "email": "ana@ejemplo.com",
  "telefono": "+34 600 000 000",
  "asistencia": "si",
  "acompanantes": "1",
  "alergias": "Intolerancia al gluten",
  "mensaje": "¡Muchas felicidades!",
  "invitado": "Ana"
}
```

**Respuesta exitosa:**
```json
{ "success": true, "message": "¡Confirmación recibida! Gracias, Ana García." }
```

Si el email ya existe, actualiza el registro (upsert).

### GET `/api/rsvp`

Listar todas las confirmaciones. Requiere API key.

```bash
curl -H "Authorization: Bearer TU_API_KEY" https://tudominio.com/api/rsvp
```

**Respuesta:**
```json
{
  "success": true,
  "totals": {
    "confirmados": 12,
    "no_vienen": 2,
    "total_personas": 18,
    "total_respuestas": 14
  },
  "data": [ ... ]
}
```

---

## Despliegue en servidor con apps existentes

### Arquitectura de puertos

```
Internet
   │  443 / 80
   ▼
nginx del servidor  ←── gestiona SSL con Certbot
   │                    (no interfiere con otros virtualhosts)
   │  proxy_pass → 127.0.0.1:3080
   ▼
Contenedor frontend (nginx:alpine)  :3080→:80
   │  proxy_pass → http://backend:3001
   ▼
Contenedor backend (node:alpine)    solo red Docker interna
   │
   ▼
SQLite  (./backend/data/boda.db, volumen montado)
```

**Puntos clave:**
- El contenedor frontend escucha en `127.0.0.1:3080` — **no** está expuesto al exterior directamente.
- El contenedor backend **no** tiene ningún puerto mapeado al host — solo es accesible desde la red Docker interna.
- El nginx del servidor actúa de único punto de entrada público y gestiona el SSL.

### Pasos de despliegue

**1. Subir el código al servidor**

```bash
scp -P 2269 -r . usuario@87.216.88.165:~/boda
# o bien con git clone
```

**2. Crear el fichero `.env` en el servidor**

```bash
cd ~/boda
cp .env.example .env
nano .env
# API_KEY=genera una clave larga y aleatoria
# ALLOWED_ORIGIN=https://tudominio.com
```

**3. Configurar el virtualhost nginx del servidor**

```bash
# Editar el dominio en el fichero
sed -i 's/bodasm.duckdns.org/tudominio.com/g' nginx-vhost.conf

# Copiar al servidor nginx
sudo cp nginx-vhost.conf /etc/nginx/sites-available/boda

# Activar
sudo ln -s /etc/nginx/sites-available/boda /etc/nginx/sites-enabled/boda

# Verificar sintaxis (no debe afectar a otros virtualhosts)
sudo nginx -t

# Recargar
sudo systemctl reload nginx
```

**4. Obtener SSL con Certbot**

Certbot detectará el nuevo virtualhost y añadirá el bloque HTTPS automáticamente, **sin tocar** los certificados ni configuraciones existentes:

```bash
sudo certbot --nginx -d tudominio.com
sudo systemctl reload nginx
```

**5. Arrancar los contenedores**

```bash
cd ~/boda
docker compose up -d --build
```

**6. Verificar que todo funciona**

```bash
# Desde el servidor: el frontend responde internamente
curl http://127.0.0.1:3080

# Backend responde (401 sin key es correcto)
curl http://127.0.0.1:3080/api/rsvp

# Backend con key
curl -H "Authorization: Bearer TU_API_KEY" http://127.0.0.1:3080/api/rsvp

# Desde fuera: HTTPS funciona
curl https://tudominio.com
```

### Actualizar la aplicación

```bash
cd ~/boda
git pull
docker compose up -d --build
```

La base de datos SQLite está en `./backend/data/boda.db` (volumen montado), por lo que **no se pierde** al reconstruir los contenedores.

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `API_KEY` | Clave para el GET `/api/rsvp` | `s3cr3t0-muy-largo` |
| `ALLOWED_ORIGIN` | Origen CORS permitido | `https://tudominio.com` |
