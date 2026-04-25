/* ═══════════════════════════════════════════════════════
   CONFIGURACIÓN
═══════════════════════════════════════════════════════ */
const CONFIG = {
  API_BASE: 'http://localhost:3001',
  WEDDING_DATE: new Date('2026-11-28T12:30:00'),
};

/* ═══════════════════════════════════════════════════════
   SOBRE DE INVITACIÓN
═══════════════════════════════════════════════════════ */
function initEnvelope() {
  const screen = document.getElementById('envelope-screen');
  const flap   = document.getElementById('env-flap');
  const body   = document.getElementById('env-body');
  const seal   = document.getElementById('envelope-seal');

  if (!screen || !seal) return;

  seal.addEventListener('click', openEnvelope);
  seal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
  });

  function openEnvelope() {
    seal.removeEventListener('click', openEnvelope);
    seal.disabled = true;

    // ① Sello desaparece
    seal.style.opacity   = '0';
    seal.style.transform = 'translate(-50%, -50%) scale(0.55)';
    seal.style.transition = 'opacity 0.22s ease, transform 0.22s ease';

    // ② Solapa sube por arriba, cuerpo baja por abajo
    setTimeout(() => {
      flap.classList.add('open');   // translateY(-100%) — sale por arriba
      body.classList.add('open');   // translateY(+100%) — sale por abajo
      document.body.classList.remove('envelope-stage');
    }, 220);

    // ③ Limpiar DOM al acabar la transición (0.9 s) + margen
    setTimeout(() => {
      screen.remove();
      initScrollReveal();
    }, 1300);
  }
}

/* ═══════════════════════════════════════════════════════
   PERSONALIZACIÓN POR INVITADO (?invitado=nombre)
═══════════════════════════════════════════════════════ */
function initGuestPersonalization() {
  const params = new URLSearchParams(window.location.search);
  const guest  = params.get('invitado');

  if (!guest || guest.trim() === '') return;

  const name = decodeURIComponent(guest.trim());

  // Saludo en el hero
  const greetingEl = document.getElementById('hero-greeting');
  if (greetingEl) {
    greetingEl.textContent = `Hola, ${name} — te esperamos con mucho cariño.`;
    greetingEl.hidden = false;
  }

  // Nombre en la sección RSVP
  const rsvpGuestEl = document.getElementById('rsvp-guest-names');
  if (rsvpGuestEl) {
    rsvpGuestEl.textContent = name;
  }

  // Pre-rellenar campo nombre del formulario
  const nameInput = document.getElementById('rsvp-name');
  if (nameInput) {
    nameInput.value = name;
  }
}

/* ═══════════════════════════════════════════════════════
   RSVP: TOGGLE DEL FORMULARIO (sobre → abre form)
═══════════════════════════════════════════════════════ */
function initRsvpToggle() {
  const btn     = document.getElementById('rsvp-toggle-btn');
  const formWrap = document.getElementById('rsvp-form-wrap');

  if (!btn || !formWrap) return;

  function openForm() {
    formWrap.hidden = false;
    btn.style.display = 'none';
    formWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  btn.addEventListener('click', openForm);
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openForm(); }
  });
}

/* ═══════════════════════════════════════════════════════
   CUENTA ATRÁS
═══════════════════════════════════════════════════════ */
function pad(n) {
  return String(n).padStart(2, '0');
}

function updateCountdown() {
  const now  = new Date();
  const diff = CONFIG.WEDDING_DATE - now;

  const daysEl    = document.getElementById('cd-days');
  const hoursEl   = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (!daysEl) return;

  if (diff <= 0) {
    [daysEl, hoursEl, minutesEl, secondsEl].forEach(el => { el.textContent = '00'; });
    return;
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  animateNumber(daysEl,    pad(days));
  animateNumber(hoursEl,   pad(hours));
  animateNumber(minutesEl, pad(minutes));
  animateNumber(secondsEl, pad(seconds));
}

function animateNumber(el, newValue) {
  if (el.textContent === newValue) return;
  el.classList.remove('flip');
  void el.offsetWidth;
  el.textContent = newValue;
  el.classList.add('flip');
}

/* ═══════════════════════════════════════════════════════
   SCROLL REVEAL (IntersectionObserver)
═══════════════════════════════════════════════════════ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  elements.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════
   FORMULARIO RSVP
═══════════════════════════════════════════════════════ */
function initRsvpForm() {
  const form          = document.getElementById('rsvp-form');
  const successEl     = document.getElementById('rsvp-success');
  const errorEl       = document.getElementById('form-error');
  const submitBtn     = document.getElementById('rsvp-submit');
  const btnText       = submitBtn?.querySelector('.btn__text');
  const btnLoading    = submitBtn?.querySelector('.btn__loading');
  const companionsGrp = document.getElementById('group-companions');
  const radioButtons  = form?.querySelectorAll('input[name="asistencia"]');

  if (!form) return;

  // Mostrar/ocultar acompañantes
  radioButtons.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'si' && radio.checked) {
        companionsGrp.classList.remove('hidden');
      } else if (radio.value === 'no' && radio.checked) {
        companionsGrp.classList.add('hidden');
      }
    });
  });

  companionsGrp.classList.add('hidden');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name       = form.querySelector('#rsvp-name').value.trim();
    const email      = form.querySelector('#rsvp-email').value.trim();
    const asistencia = form.querySelector('input[name="asistencia"]:checked');

    if (!name || !email || !asistencia) {
      showError('Por favor, completa los campos obligatorios: nombre, email y confirmación de asistencia.');
      return;
    }

    if (!isValidEmail(email)) {
      showError('Por favor, introduce un email válido.');
      return;
    }

    const params   = new URLSearchParams(window.location.search);
    const invitado = params.get('invitado') || '';

    const payload = {
      nombre:       name,
      email:        email,
      telefono:     form.querySelector('#rsvp-phone').value.trim(),
      asistencia:   asistencia.value,
      acompanantes: form.querySelector('#rsvp-companions').value,
      alergias:     form.querySelector('#rsvp-allergies').value.trim(),
      mensaje:      form.querySelector('#rsvp-message').value.trim(),
      invitado:     invitado,
    };

    setLoadingState(true);
    hideError();

    try {
      const res = await fetch(`${CONFIG.API_BASE}/api/rsvp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status}`);
      }

      form.hidden = true;
      successEl.hidden = false;
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      showError('Ha ocurrido un error al enviar tu confirmación. Por favor, inténtalo de nuevo.');
    } finally {
      setLoadingState(false);
    }
  });

  function setLoadingState(loading) {
    submitBtn.disabled = loading;
    btnText.hidden     = loading;
    btnLoading.hidden  = !loading;
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideError() {
    errorEl.hidden = true;
    errorEl.textContent = '';
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ═══════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initEnvelope();              // gestiona el sobre; llama a initScrollReveal al terminar
  initGuestPersonalization();  // personaliza por ?invitado=
  initRsvpToggle();            // abre el formulario al pulsar el sobre RSVP
  initRsvpForm();              // gestiona el envío del formulario

  updateCountdown();
  setInterval(updateCountdown, 1000);
});
