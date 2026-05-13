// ============================================
// INTERACTA - Scroll & Filter Animations
// ============================================

// Scroll Reveal Animation
const revealElements = document.querySelectorAll('.service-card, .portfolio-item, .stat-box, .about-content');

function checkReveal() {
    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            element.classList.add('revealed');
        }
    });
}

revealElements.forEach(el => {
    el.classList.add('scroll-reveal');
});

window.addEventListener('scroll', checkReveal);
window.addEventListener('load', checkReveal);

// Portfolio Filter Functionality
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            portfolioItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Parallax effect on hero section
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        hero.style.opacity = 1 - scrolled / 700;
    }
});

// Header background change on scroll — respects light/dark mode
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (!header) return;
    if (window.scrollY > 50) {
        header.style.backdropFilter = 'blur(14px)';
        header.style.background = document.body.classList.contains('light-mode')
            ? 'rgba(255,255,255,0.95)'
            : 'rgba(0,23,31,0.95)';
    } else {
        header.style.backdropFilter = 'blur(12px)';
        header.style.background = document.body.classList.contains('light-mode')
            ? 'rgba(255,255,255,0.92)'
            : 'rgba(0,23,31,0.92)';
    }
});

// Keep header in sync when theme is toggled mid-scroll
const observer = new MutationObserver(function () {
    const header = document.querySelector('.header');
    if (!header) return;
    if (window.scrollY > 50) {
        header.style.background = document.body.classList.contains('light-mode')
            ? 'rgba(255,255,255,0.95)'
            : 'rgba(0,23,31,0.95)';
    }
});

observer.observe(document.body, { attributes: true });
