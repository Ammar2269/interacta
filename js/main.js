// ============================================
// INTERACTA - Main JavaScript
// ============================================

(function() {

    // ── DARK / LIGHT MODE TOGGLE ──────────────────────────────────────────────
    const themeToggle = document.getElementById('themeToggle');

    // Restore saved preference
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            document.body.classList.toggle('light-mode');
            localStorage.setItem(
                'theme',
                document.body.classList.contains('light-mode') ? 'light' : 'dark'
            );
        });
    }

    // ── MOBILE MENU ───────────────────────────────────────────────────────────
    const hamburger = document.querySelector('.hamburger');
    const navMenu   = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger) hamburger.classList.remove('active');
            if (navMenu)   navMenu.classList.remove('active');
        });
    });

    // ── SMOOTH SCROLL ─────────────────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ── COUNTER ANIMATION ─────────────────────────────────────────────────────
    const counters = document.querySelectorAll('.counter');
    let animated = false;

    function animateCounters() {
        if (animated) return;
        const section = document.querySelector('.hero-stats');
        if (section && section.getBoundingClientRect().top < window.innerHeight - 100) {
            counters.forEach(counter => {
                const target    = parseInt(counter.getAttribute('data-target'));
                let current     = 0;
                const increment = target / 50;
                const tick = () => {
                    if (current < target) {
                        current += increment;
                        counter.innerText = Math.ceil(current);
                        setTimeout(tick, 20);
                    } else {
                        counter.innerText = target;
                    }
                };
                tick();
            });
            animated = true;
        }
    }

    window.addEventListener('scroll', animateCounters);
    window.addEventListener('load',   animateCounters);

    // ── CONTACT FORM ──────────────────────────────────────────────────────────
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const name    = document.getElementById('name').value;
            const email   = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            const box     = document.getElementById('formMessage');

            if (name && email && message) {
                box.innerHTML = '<div style="background:#00A8E8;color:#00171F;padding:12px;border-radius:8px;">✅ Thank you! We\'ll get back to you within 24 hours.</div>';
                contactForm.reset();
                setTimeout(() => box.innerHTML = '', 5000);
            } else {
                box.innerHTML = '<div style="background:#ff4757;color:white;padding:12px;border-radius:8px;">⚠️ Please fill all fields.</div>';
                setTimeout(() => box.innerHTML = '', 3000);
            }
        });
    }

    // ── NEWSLETTER ────────────────────────────────────────────────────────────
    const newsletterForm = document.querySelector('#newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', e => {
            e.preventDefault();
            if (newsletterForm.querySelector('input').value) {
                alert('Thanks for subscribing!');
                newsletterForm.reset();
            }
        });
    }

})();
