/* ─── Starfield ───────────────────────────────────────────────── */
(function initStarfield() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.id = "starfield";
    Object.assign(canvas.style, {
        position:      "fixed",
        top:           "0",
        left:          "0",
        width:         "100%",
        height:        "100%",
        zIndex:        "-1",
        pointerEvents: "none"
    });
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext("2d");

    /* Seven rainbow colors (RGB) */
    const PALETTE = [
        [255,  55,  80],   /* 0 — red    */
        [255, 138,  35],   /* 1 — orange */
        [255, 228,  45],   /* 2 — yellow */
        [45,  220, 110],   /* 3 — green  */
        [0,   200, 215],   /* 4 — cyan   */
        [55,  115, 255],   /* 5 — blue   */
        [185,  55, 255]    /* 6 — violet */
    ];

    const COUNT = 110;
    let W = 0, H = 0, stars = [];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function lerpColor(phase) {
        const n   = PALETTE.length;
        const idx = Math.floor(phase % n);
        const t   = (phase % n) - idx;
        const c1  = PALETTE[idx];
        const c2  = PALETTE[(idx + 1) % n];
        return [
            Math.round(c1[0] + (c2[0] - c1[0]) * t),
            Math.round(c1[1] + (c2[1] - c1[1]) * t),
            Math.round(c1[2] + (c2[2] - c1[2]) * t)
        ];
    }

    function makeStar() {
        const type = Math.random();
        return {
            x:            Math.random() * W,
            y:            Math.random() * H,
            /* sparkle (30%), cross (20%), dot (50%) */
            type:         type < 0.30 ? "sparkle" : type < 0.50 ? "cross" : "dot",
            size:         Math.random() * 2.2 + 0.6,
            vx:           (Math.random() - 0.5) * 0.28,
            vy:           (Math.random() - 0.5) * 0.28,
            colorPhase:   Math.random() * 7,
            colorSpeed:   Math.random() * 0.006 + 0.002,
            twinkle:      Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.035 + 0.012,
            rotatAngle:   Math.random() * Math.PI,
            rotateSpeed:  (Math.random() - 0.5) * 0.012
        };
    }

    function drawDot(star, r, g, b, alpha) {
        const s   = star.size;
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 4);
        grd.addColorStop(0,   `rgba(255,255,255,${alpha})`);
        grd.addColorStop(0.2, `rgba(${r},${g},${b},${alpha * 0.85})`);
        grd.addColorStop(0.6, `rgba(${r},${g},${b},${alpha * 0.25})`);
        grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(0, 0, s * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
    }

    function drawCross(star, r, g, b, alpha) {
        const s   = star.size * 3;
        const w   = star.size * 0.55;
        /* glow halo */
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 1.6);
        grd.addColorStop(0,   `rgba(${r},${g},${b},${alpha * 0.55})`);
        grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(0, 0, s * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        /* cross arms */
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(-s,  -w, s * 2, w * 2);
        ctx.fillRect(-w,  -s, w * 2, s * 2);
    }

    function drawSparkle(star, r, g, b, alpha) {
        const s = star.size * 3.2;
        /* outer glow */
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 2);
        grd.addColorStop(0,   `rgba(${r},${g},${b},${alpha * 0.6})`);
        grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(0, 0, s * 2, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        /* 4-point diamond star */
        ctx.beginPath();
        ctx.moveTo(0,  -s);
        ctx.lineTo(s * 0.25,  -s * 0.25);
        ctx.lineTo(s,  0);
        ctx.lineTo(s * 0.25,   s * 0.25);
        ctx.lineTo(0,   s);
        ctx.lineTo(-s * 0.25,  s * 0.25);
        ctx.lineTo(-s,  0);
        ctx.lineTo(-s * 0.25, -s * 0.25);
        ctx.closePath();
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.95})`;
        ctx.fill();
        /* bright core */
        ctx.beginPath();
        ctx.arc(0, 0, star.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha + 0.15)})`;
        ctx.fill();
    }

    function tick() {
        ctx.clearRect(0, 0, W, H);

        for (const star of stars) {
            /* update */
            star.x          += star.vx;
            star.y          += star.vy;
            star.colorPhase += star.colorSpeed;
            star.twinkle    += star.twinkleSpeed;
            star.rotatAngle += star.rotateSpeed;

            /* wrap */
            if (star.x < -8)  star.x = W + 8;
            if (star.x > W+8) star.x = -8;
            if (star.y < -8)  star.y = H + 8;
            if (star.y > H+8) star.y = -8;

            /* draw */
            const [r, g, b] = lerpColor(star.colorPhase);
            const alpha = 0.28 + 0.72 * (0.5 + 0.5 * Math.sin(star.twinkle));

            ctx.save();
            ctx.translate(star.x, star.y);
            ctx.rotate(star.rotatAngle);

            if      (star.type === "sparkle") drawSparkle(star, r, g, b, alpha);
            else if (star.type === "cross")   drawCross(star, r, g, b, alpha);
            else                              drawDot(star, r, g, b, alpha);

            ctx.restore();
        }

        requestAnimationFrame(tick);
    }

    resize();
    stars = Array.from({ length: COUNT }, makeStar);
    tick();

    window.addEventListener("resize", resize, { passive: true });
}());
/* ────────────────────────────────────────────────────────────── */

(function initNetworkField() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobileViewport = window.matchMedia("(max-width: 640px)").matches;

    if (reduceMotion || !mobileViewport) return;

    const canvas = document.createElement("canvas");
    canvas.id = "networkfield";
    Object.assign(canvas.style, {
        position: "fixed",
        inset: "0",
        width: "100%",
        height: "100%",
        zIndex: "0",
        pointerEvents: "none"
    });
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext("2d");
    const POINT_COUNT = 46;
    const LINK_DISTANCE = 128;
    let width = 0;
    let height = 0;
    let points = [];

    function makePoint() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.32,
            vy: (Math.random() - 0.5) * 0.32,
            radius: Math.random() * 1.6 + 1.1,
            pulse: Math.random() * Math.PI * 2
        };
    }

    function resize() {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(height * ratio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        points = Array.from({ length: POINT_COUNT }, makePoint);
    }

    function tick() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < points.length; i += 1) {
            const point = points[i];
            point.x += point.vx;
            point.y += point.vy;
            point.pulse += 0.026;

            if (point.x < -12) point.x = width + 12;
            if (point.x > width + 12) point.x = -12;
            if (point.y < -12) point.y = height + 12;
            if (point.y > height + 12) point.y = -12;

            for (let j = i + 1; j < points.length; j += 1) {
                const other = points[j];
                const dx = point.x - other.x;
                const dy = point.y - other.y;
                const distance = Math.hypot(dx, dy);

                if (distance < LINK_DISTANCE) {
                    const alpha = (1 - distance / LINK_DISTANCE) * 0.36;
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.strokeStyle = `rgba(145, 190, 255, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        for (const point of points) {
            const glow = 0.45 + Math.sin(point.pulse) * 0.22;
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.radius + glow, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(220, 238, 255, 0.82)";
            ctx.fill();

            const halo = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 18);
            halo.addColorStop(0, "rgba(110, 232, 232, 0.22)");
            halo.addColorStop(1, "rgba(110, 232, 232, 0)");
            ctx.beginPath();
            ctx.arc(point.x, point.y, 18, 0, Math.PI * 2);
            ctx.fillStyle = halo;
            ctx.fill();
        }

        requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener("resize", resize, { passive: true });
}());

const navbar = document.querySelector(".navbar");
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link");
const contactForm = document.getElementById("contactForm");
const scrollTopButton = document.querySelector(".mobile-scroll-top");
const mobileTypedTarget = document.querySelector("[data-mobile-typed]");

const closeMobileNav = () => {
    navMenu?.classList.remove("is-open");
    hamburger?.classList.remove("active");
    hamburger?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("mobile-nav-open");
};

function initMobileTyping() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!mobileTypedTarget || reduceMotion) return;

    const phrases = [
        "Student developer",
        "Frontend detail",
        "Practical builds",
        "Clear collaboration"
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
        const phrase = phrases[phraseIndex];
        mobileTypedTarget.textContent = phrase.slice(0, charIndex);

        if (!deleting && charIndex < phrase.length) {
            charIndex += 1;
            window.setTimeout(tick, 74);
            return;
        }

        if (!deleting) {
            deleting = true;
            window.setTimeout(tick, 1100);
            return;
        }

        if (charIndex > 0) {
            charIndex -= 1;
            window.setTimeout(tick, 42);
            return;
        }

        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        window.setTimeout(tick, 280);
    };

    tick();
}

initMobileTyping();

if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("is-open");
        hamburger.classList.toggle("active", isOpen);
        hamburger.setAttribute("aria-expanded", String(isOpen));
        document.body.classList.toggle("mobile-nav-open", isOpen);
    });
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        closeMobileNav();
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMobileNav();
    }
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");
        const target = targetId ? document.querySelector(targetId) : null;

        if (!target) {
            return;
        }

        event.preventDefault();
        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});

if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const fields = contactForm.querySelectorAll("input, textarea");
        const allFilled = [...fields].every((field) => field.value.trim());

        if (!allFilled) {
            alert("Please fill in all fields.");
            return;
        }

        alert("Thank you for your message. I will get back to you soon.");
        contactForm.reset();
    });
}

const revealTargets = document.querySelectorAll(
    ".about-text, .stat, .skill-category, .timeline-item, .project-card, .contact-item, .contact-form"
);

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px"
        }
    );

    revealTargets.forEach((target, index) => {
        target.classList.add("reveal");
        target.style.transitionDelay = `${Math.min(index * 0.04, 0.22)}s`;
        observer.observe(target);
    });
}

const updateScrolledState = () => {
    if (window.scrollY > 16) {
        navbar?.classList.add("scrolled");
    } else {
        navbar?.classList.remove("scrolled");
    }

    scrollTopButton?.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.55);
};

const updateActiveLink = () => {
    const sections = document.querySelectorAll("section[id]");
    let currentSection = "home";

    sections.forEach((section) => {
        const top = section.offsetTop - 140;
        const bottom = top + section.offsetHeight;

        if (window.scrollY >= top && window.scrollY < bottom) {
            currentSection = section.id;
        }
    });

    navLinks.forEach((link) => {
        const target = link.getAttribute("href")?.slice(1);
        link.classList.toggle("active", target === currentSection);
    });
};

window.addEventListener("scroll", () => {
    updateScrolledState();
    updateActiveLink();
});

scrollTopButton?.addEventListener("click", () => {
    closeMobileNav();
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

window.addEventListener("load", () => {
    updateScrolledState();
    updateActiveLink();
});
