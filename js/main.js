// ===== NAVIGATION =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.style.background = 'rgba(5,13,26,0.98)';
    navbar.style.borderBottomColor = 'rgba(77,166,255,0.2)';
  } else {
    navbar.style.background = 'rgba(5,13,26,0.92)';
    navbar.style.borderBottomColor = 'rgba(77,166,255,0.12)';
  }
});

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navLinks.style.display = navLinks.classList.contains('open') ? 'flex' : 'none';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '72px';
    navLinks.style.left = '0'; navLinks.style.right = '0';
    navLinks.style.background = 'rgba(5,13,26,0.98)';
    navLinks.style.padding = '20px 5%';
    navLinks.style.gap = '18px';
    navLinks.style.borderBottom = '1px solid rgba(77,166,255,0.12)';
  });
}

// ===== FADE-UP OBSERVER =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => {
  el.classList.add('animate');
  observer.observe(el);
});

// ===== MODAL =====
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// ===== TOAST =====
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.querySelector('.toast-msg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ===== FORM SUBMIT =====
function initForms() {
  document.querySelectorAll('form').forEach(form => {
    if (form.id === 'bookingForm') return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
      setTimeout(() => {
        showToast('✅ Message sent! We\'ll be in touch soon.');
        form.reset();
        if (btn) { btn.textContent = btn.dataset.original || 'Submit'; btn.disabled = false; }
      }, 1200);
    });
  });
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString() + suffix;
      if (current >= target) clearInterval(timer);
    }, 20);
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initForms();

  // Counter observer
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounters(); counterObserver.disconnect(); }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) counterObserver.observe(statsSection);

  // Save original button text
  document.querySelectorAll('button[type=submit]').forEach(btn => {
    btn.dataset.original = btn.textContent;
  });

  // Booking form
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = document.getElementById('bookingSubmitBtn');
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Booking...';

      const name    = document.getElementById('b-name').value.trim();
      const phone   = document.getElementById('b-phone').value.trim();
      const email   = document.getElementById('b-email').value.trim();
      const service = document.getElementById('b-service').value;
      const vehicle = document.getElementById('b-vehicle').value.trim();
      const date    = document.getElementById('b-date').value;
      const notes   = document.getElementById('b-notes').value.trim();

      if (!name || !phone || !service) {
        showToast('Please fill in your name, phone, and service type.');
        btn.disabled = false;
        btn.textContent = original;
        return;
      }

      try {
        const res  = await fetch('https://app.dinqdigital.com/api/quote', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_name:  name,
            contact_name:  name,
            email:         email,
            phone:         phone,
            product_type:  service,
            quantity:      '1 service',
            shipping_destination: 'In-shop — Seattle, WA',
            customization_notes: [
              vehicle ? 'Vehicle: ' + vehicle : '',
              date    ? 'Preferred date: ' + date : '',
              notes   ? notes : ''
            ].filter(Boolean).join(' | '),
          }),
        });
        const data = await res.json();

        if (data.success) {
          document.getElementById('bookingFormWrap').innerHTML =
            '<div style="text-align:center;padding:40px 20px;">' +
            '<div style="width:72px;height:72px;background:linear-gradient(135deg,#FF6B1A,#FF8C42);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 20px;box-shadow:0 8px 28px rgba(255,107,26,0.4);">✅</div>' +
            '<h3 style="color:white;font-size:22px;font-family:Playfair Display,serif;margin-bottom:10px;">Appointment Requested!</h3>' +
            '<p style="color:rgba(180,210,255,0.6);font-size:14px;margin-bottom:24px;">We\'ll call you within 1 hour to confirm your appointment.</p>' +
            '<div style="background:rgba(255,107,26,0.1);border:1px solid rgba(255,107,26,0.3);border-radius:10px;padding:16px 24px;display:inline-block;">' +
            '<div style="font-size:11px;color:rgba(180,210,255,0.4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;">Confirmation ID</div>' +
            '<div style="font-size:28px;font-weight:800;color:#FF8C42;font-family:Playfair Display,serif;">' + data.order_id + '</div>' +
            '</div>' +
            '</div>';
        } else {
          throw new Error(data.error || 'Failed');
        }
      } catch(err) {
        btn.disabled = false;
        btn.textContent = original;
        showToast('Something went wrong. Please call us at (206) 555-0198.');
      }
    });
  }
});
