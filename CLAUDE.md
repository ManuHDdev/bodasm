# CLAUDE.md — Boda José Andrés & Silvia

## Descripción
Web de invitación de boda para José Andrés y Silvia. Boda el 28 de noviembre en la Parroquia San Bartolomé de La Coronada.

## Stack
- Frontend: HTML5 + CSS3 + Vanilla JS (sin frameworks)
- Backend: Node.js + Express + SQLite (via better-sqlite3)
- Despliegue: Docker en servidor propio (ssh -p 2269 87.216.88.165)

## Arquitectura para personalización futura
La URL soporta el parámetro ?invitado=nombre para mostrar contenido personalizado.
El frontend lee este parámetro desde JS y lo usa para personalizar el saludo.
El backend almacena el parámetro junto con cada respuesta RSVP.

## Paleta de colores
- Fondo principal: #FAF7F2 (crema cálido)
- Acento principal: #C9A96E (dorado suave)
- Acento secundario: #D4B896 (arena)
- Texto principal: #3D3530 (marrón oscuro cálido)
- Texto suave: #8C7B6B (marrón medio)
- Blanco roto: #FFFDF9

## Tipografías (Google Fonts)
- Display/títulos: Cormorant Garamond (elegante, serif)
- Cuerpo/subtítulos: Jost (limpia, moderna, ligera)

## Secciones de la web (en orden)
1. Hero — nombres y fecha con animación de entrada
2. Cuenta atrás — contador dinámico hasta el 28/11/2025
3. Nuestra historia — texto genérico placeholder
4. Ceremonia — Parroquia San Bartolomé de La Coronada con mapa
5. Cóctel — pendiente de confirmar lugar
6. Banquete — pendiente de confirmar lugar
7. Código de vestimenta — placeholder elegante
8. Galería de fotos — grid con placeholders
9. RSVP — formulario que llama al backend
10. Footer

## API Backend
- POST /api/rsvp — guarda confirmación
- GET /api/rsvp — lista todas (protegida con API key simple)

## Reglas de código
- Mobile-first, completamente responsive
- Animaciones CSS puras (scroll reveal con IntersectionObserver)
- Sin jQuery, sin librerías externas salvo Google Fonts
- El backend corre en puerto 3001, el frontend en puerto 80 (nginx en Docker)
- CORS configurado para permitir solo el dominio propio
