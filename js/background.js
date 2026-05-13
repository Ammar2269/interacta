// ============================================
// INTERACTA - Animated Background Canvas
// • Floating nodes that connect near mouse
// • Glowing cursor trail (spark particles)
// • Ripple burst on click
// • Scroll drift
// ============================================
 
(function () {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
 
    // ── Brand colours ─────────────────────────────────────────────────────────
    const DARK_COLORS  = ['rgba(0,168,232,', 'rgba(0,126,167,', 'rgba(0,52,89,'];
    const LIGHT_COLORS = ['rgba(0,168,232,', 'rgba(0,126,167,', 'rgba(0,52,89,'];
 
    // ── Config ────────────────────────────────────────────────────────────────
    const NODE_COUNT     = 80;
    const CONNECT_DIST   = 150;
    const MOUSE_RADIUS   = 180;
    const MOUSE_STRENGTH = 0.018;
    const SCROLL_FACTOR  = 0.08;
 
    let W, H;
    let mouse     = { x: -9999, y: -9999 };
    let prevMouse = { x: -9999, y: -9999 };
    let scrollY   = 0;
    let nodes     = [];
    let sparks    = [];   // cursor trail particles
    let ripples   = [];   // click ripple rings
 
    // ── Node class ────────────────────────────────────────────────────────────
    class Node {
        constructor() { this.reset(true); }
 
        reset(random) {
            this.x  = random ? Math.random() * W : (Math.random() < 0.5 ? -10 : W + 10);
            this.y  = Math.random() * H;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.r  = Math.random() * 2.5 + 1;
            this.baseAlpha = Math.random() * 0.45 + 0.15;
            this.alpha = this.baseAlpha;
            const palette = document.body.classList.contains('light-mode') ? LIGHT_COLORS : DARK_COLORS;
            this.color = palette[Math.floor(Math.random() * palette.length)];
        }
 
        update() {
            const dx   = mouse.x - this.x;
            const dy   = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_RADIUS && dist > 0) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                this.vx += dx / dist * force * MOUSE_STRENGTH;
                this.vy += dy / dist * force * MOUSE_STRENGTH;
            }
 
            this.vy -= scrollY * SCROLL_FACTOR * 0.001;
 
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > 1.2) { this.vx *= 0.98; this.vy *= 0.98; }
 
            this.x += this.vx;
            this.y += this.vy;
 
            const md = Math.sqrt((mouse.x - this.x) ** 2 + (mouse.y - this.y) ** 2);
            this.alpha = md < MOUSE_RADIUS
                ? this.baseAlpha + (1 - this.baseAlpha) * ((MOUSE_RADIUS - md) / MOUSE_RADIUS) * 0.6
                : this.baseAlpha;
 
            if (this.x < -20)  this.x = W + 20;
            if (this.x > W+20) this.x = -20;
            if (this.y < -20)  this.y = H + 20;
            if (this.y > H+20) this.y = -20;
        }
 
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            ctx.fill();
        }
    }
 
    // ── Spark (cursor trail) ──────────────────────────────────────────────────
    class Spark {
        constructor(x, y, vx, vy) {
            this.x     = x;
            this.y     = y;
            this.vx    = vx + (Math.random() - 0.5) * 1.2;
            this.vy    = vy + (Math.random() - 0.5) * 1.2;
            this.life  = 1.0;
            this.decay = Math.random() * 0.04 + 0.03;
            this.r     = Math.random() * 4 + 2.5;
            this.hue   = Math.random() > 0.5 ? '0,168,232' : '0,126,167';
        }
 
        update() {
            this.x    += this.vx;
            this.y    += this.vy;
            this.vx   *= 0.94;
            this.vy   *= 0.94;
            this.life -= this.decay;
            this.r    *= 0.97;
        }
 
        draw() {
            if (this.life <= 0) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(this.r, 0.1), 0, Math.PI * 2);
            ctx.fillStyle    = `rgba(${this.hue},${Math.min(this.life * 1.4, 1)})`;
            ctx.shadowColor  = `rgba(${this.hue},${this.life})`;
            ctx.shadowBlur   = 18;
            ctx.fill();
            ctx.shadowBlur   = 0;
        }
    }
 
    // ── Ripple (click burst) ──────────────────────────────────────────────────
    class Ripple {
        constructor(x, y) {
            this.x      = x;
            this.y      = y;
            this.radius = 0;
            this.maxR   = 90;
            this.life   = 1.0;
            this.decay  = 0.025;
        }
 
        update() {
            this.radius += (this.maxR - this.radius) * 0.12;
            this.life   -= this.decay;
        }
 
        draw() {
            if (this.life <= 0) return;
            const isLight = document.body.classList.contains('light-mode');
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = isLight
                ? `rgba(0,126,167,${this.life * 0.95})`
                : `rgba(0,168,232,${this.life})`;
            ctx.lineWidth   = 2.5;
            ctx.shadowColor = `rgba(0,168,232,${this.life * 0.9})`;
            ctx.shadowBlur  = 20;
            ctx.stroke();
            ctx.shadowBlur  = 0;
 
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,168,232,${this.life})`;
            ctx.fill();
        }
    }
 
    // ── Helpers ───────────────────────────────────────────────────────────────
    function spawnSparks() {
        const dx    = mouse.x - prevMouse.x;
        const dy    = mouse.y - prevMouse.y;
        const speed = Math.sqrt(dx * dx + dy * dy);
        if (speed < 2) return;
        const count = Math.min(Math.floor(speed * 0.6), 9);
        for (let i = 0; i < count; i++) {
            sparks.push(new Spark(mouse.x, mouse.y, dx * 0.15, dy * 0.15));
        }
    }
 
    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
 
    function initNodes() {
        nodes = Array.from({ length: NODE_COUNT }, () => new Node());
    }
 
    function drawLines() {
        const isLight = document.body.classList.contains('light-mode');
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx   = nodes[i].x - nodes[j].x;
                const dy   = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECT_DIST) {
                    const alpha = (1 - dist / CONNECT_DIST) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = isLight
                        ? `rgba(0,126,167,${alpha})`
                        : `rgba(0,168,232,${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }
 
    // ── Main loop ─────────────────────────────────────────────────────────────
    function animate() {
        ctx.clearRect(0, 0, W, H);
 
        if (!document.body.classList.contains('light-mode') && mouse.x > 0) {
            const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300);
            grad.addColorStop(0, 'rgba(0,168,232,0.05)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
        }
 
        spawnSparks();
        prevMouse.x = mouse.x;
        prevMouse.y = mouse.y;
 
        sparks  = sparks.filter(s => s.life > 0);
        sparks.forEach(s => { s.update(); s.draw(); });
 
        ripples = ripples.filter(r => r.life > 0);
        ripples.forEach(r => { r.update(); r.draw(); });
 
        drawLines();
        nodes.forEach(n => { n.update(); n.draw(); });
 
        scrollY = 0;
        requestAnimationFrame(animate);
    }
 
    // ── Events ────────────────────────────────────────────────────────────────
    window.addEventListener('resize', () => { resize(); initNodes(); });
 
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
 
    window.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });
 
    window.addEventListener('click', e => {
        ripples.push(new Ripple(e.clientX, e.clientY));
    });
 
    window.addEventListener('touchmove', e => {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }, { passive: true });
 
    let lastScroll = window.pageYOffset;
    window.addEventListener('scroll', () => {
        const cur  = window.pageYOffset;
        scrollY   += cur - lastScroll;
        lastScroll = cur;
    });
 
    // ── Start ─────────────────────────────────────────────────────────────────
    resize();
    initNodes();
    animate();
 
})();
 