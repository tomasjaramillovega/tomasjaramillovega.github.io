// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize Lenis for buttery smooth scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smooth: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);


    // 2. Stable Curtain Preloader
    const tlPreloader = gsap.timeline({
        onComplete: () => {
            document.body.classList.remove('overflow-hidden');
            document.getElementById('preloader').style.display = 'none';
        }
    });

    tlPreloader.to('.preloader-text', {
        y: "0%",
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.2
    })
    .to('#preloader-bar', {
        width: "100%",
        duration: 1.2,
        ease: "power2.inOut"
    }, "-=0.5")
    .to('#preloader', {
        yPercent: -100, // Slides up safely
        duration: 1,
        ease: "power4.inOut"
    }, "+=0.3")
    .from('.hero-reveal', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out"
    }, "-=0.5");


    // 3. Fluid Particles Canvas (Made more noticeable with higher opacity and larger sizes)
    const canvas = document.getElementById('fluid-canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Increased particle count, speed, and base radius to make them stand out
    const particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 3 + 1 
    }));

    function animateCanvas() {
        ctx.clearRect(0, 0, width, height);
        // Made the fill color more opaque
        ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        requestAnimationFrame(animateCanvas);
    }
    animateCanvas();


    // 4. Custom Cursors & Floating Parallax Background Elements
    const cursorDot = document.getElementById('cursor-dot');
    const cursorSpotlight = document.getElementById('cursor-spotlight');
    const floatingElements = document.querySelectorAll('.floating-el');
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        gsap.to(cursorDot, { x: mouseX, y: mouseY, duration: 0.1 });
        gsap.to(cursorSpotlight, { x: mouseX, y: mouseY, duration: 0.6, ease: "power2.out" });

        const xOffset = (mouseX - window.innerWidth / 2);
        const yOffset = (mouseY - window.innerHeight / 2);

        floatingElements.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-speed'));
            gsap.to(el, {
                x: xOffset * speed,
                y: yOffset * speed,
                duration: 1.5,
                ease: "power2.out"
            });
        });
    });


    // 5. Dual Slide-In & 3D Tilt Card (Driver Specs Section)
    const driverSection = document.getElementById('driver-specs');
    const specsLeft = document.getElementById('specs-left');
    const heroCard = document.getElementById('tilt-card');

    if (driverSection && specsLeft && heroCard) {
        
        gsap.set(specsLeft, { autoAlpha: 0, x: -150 });
        gsap.set(heroCard, { autoAlpha: 0, x: 150, scale: 0.95 });

        const specsTl = gsap.timeline({
            scrollTrigger: {
                trigger: driverSection,
                start: "top 75%", 
                end: "top 25%",   
                scrub: 1          
            }
        });

        specsTl.to([specsLeft, heroCard], {
            autoAlpha: 1,
            x: 0,
            scale: 1, 
            ease: "power2.out"
        });

        heroCard.addEventListener('mousemove', (e) => {
            const rect = heroCard.getBoundingClientRect();
            const x = (e.clientX - rect.left - (rect.width / 2));
            const y = (e.clientY - rect.top - (rect.height / 2));
            const rotateX = (-y / rect.height) * 20;
            const rotateY = (x / rect.width) * 20;

            gsap.to(heroCard, {
                rotateX: rotateX,
                rotateY: rotateY,
                scale: 1.02,
                duration: 0.3,
                ease: "power1.out"
            });
        });

        heroCard.addEventListener('mouseleave', () => {
            gsap.to(heroCard, {
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                duration: 0.6,
                ease: "power2.out"
            });
        });
    }


    // 6. Telemetry Scanner Hover Effect
    const scanner = document.getElementById('telemetry-scanner');
    const scannerMask = document.querySelector('.scanner-mask');

    if (scanner && scannerMask) {

        const BEAM_RADIUS = 340;
        const STOPS = 16;
        const falloff = Array.from({ length: STOPS + 1 }, (_, i) => {
            const t = i / STOPS;
            const alpha = (1 + Math.cos(Math.PI * t)) / 2;
            return `rgba(0,0,0,${alpha.toFixed(4)}) ${(t * 100).toFixed(1)}%`;
        }).join(', ');

        const setMask = (x, y, radius) => {
            const gradient = `radial-gradient(circle ${radius.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, ${falloff})`;
            scannerMask.style.webkitMaskImage = gradient;
            scannerMask.style.maskImage = gradient;
        };

        const state = { x: 0, y: 0, radius: 0 };
        const xTo = gsap.quickTo(state, 'x', { duration: 0.45, ease: 'power3.out' });
        const yTo = gsap.quickTo(state, 'y', { duration: 0.45, ease: 'power3.out' });
        const rTo = gsap.quickTo(state, 'radius', { duration: 0.7, ease: 'power3.out' });

        let active = false;
        let hasPosition = false;
        let localMouseX = 0, localMouseY = 0;
        let last = '';

        gsap.ticker.add(() => {
            if (active) {
                const r = scannerMask.getBoundingClientRect();
                xTo(localMouseX - r.left);
                yTo(localMouseY - r.top);
            }
            const key = state.x.toFixed(1) + state.y.toFixed(1) + state.radius.toFixed(1);
            if (key !== last) {
                last = key;
                setMask(state.x, state.y, state.radius);
            }
        });

        scanner.addEventListener('mouseenter', (e) => {
            localMouseX = e.clientX; localMouseY = e.clientY;
            active = true;
            if (!hasPosition) {
                const r = scannerMask.getBoundingClientRect();
                gsap.set(state, { x: localMouseX - r.left, y: localMouseY - r.top });
                hasPosition = true;
            }
            gsap.to(scannerMask, { opacity: 1, duration: 0.3, overwrite: true });
            rTo(BEAM_RADIUS);
        });

        scanner.addEventListener('mousemove', (e) => {
            localMouseX = e.clientX; localMouseY = e.clientY;
        });

        scanner.addEventListener('mouseleave', () => {
            active = false;
            hasPosition = false;
            rTo(0);
            gsap.to(scannerMask, { opacity: 0, duration: 0.5, delay: 0.2, overwrite: true });
        });
    }


    // 7. Scroll-Driven Text Reveal (Manifesto)
    const manifestoText = document.getElementById('manifesto-text');
    if (manifestoText) {
        const text = manifestoText.innerText;
        manifestoText.innerHTML = "";
        text.split(" ").forEach(word => {
            const span = document.createElement('span');
            span.className = "word-wrap text-zinc-800";
            span.innerHTML = `<span class="word-inner">${word}</span>&nbsp;`;
            manifestoText.appendChild(span);
        });

        const words = manifestoText.querySelectorAll('.word-inner');
        
        gsap.to(words, {
            scrollTrigger: {
                trigger: manifestoText,
                start: "top 80%",
                end: "bottom 60%",
                scrub: 1
            },
            color: "white", 
            stagger: 0.1
        });
    }


    // 8. Projects Section A: Text Splitter & Reveal
    const splitTargets = document.querySelectorAll('.split-text-target');
    
    splitTargets.forEach(target => {
        const text = target.innerText;
        target.innerHTML = '';
        text.split(' ').forEach(word => {
            const wrapper = document.createElement('span');
            wrapper.style.overflow = 'hidden';
            wrapper.style.display = 'inline-block';
            wrapper.style.marginRight = '0.3em';
            const inner = document.createElement('span');
            inner.className = 'split-word'; 
            inner.innerText = word;
            wrapper.appendChild(inner);
            target.appendChild(wrapper);
        });
    });

    gsap.to(".split-word", {
        scrollTrigger: { trigger: "#projects-wrapper", start: "top 80%" },
        y: "0%",
        opacity: 1,
        duration: 1,
        stagger: 0.05,
        ease: "power3.out"
    });


    // 9. Projects Section A: Clean Parallax Transform
    const parallaxContainer = document.querySelector('.parallax-container');
    const parallaxElement = document.querySelector('.parallax-element');

    if (parallaxContainer && parallaxElement) {
        parallaxContainer.addEventListener('mousemove', (e) => {
            const rect = parallaxContainer.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / 15;
            const y = (e.clientY - rect.top - rect.height / 2) / 15;

            gsap.to(parallaxElement, {
                x: x, y: y, rotateY: x / 2, rotateX: -y / 2,
                duration: 0.6, ease: "power2.out"
            });
        });

        parallaxContainer.addEventListener('mouseleave', () => {
            gsap.to(parallaxElement, {
                x: 0, y: 0, rotateX: 0, rotateY: 0,
                duration: 1, ease: "power3.out"
            });
        });
    }


    // 10. Projects Section B: Asymmetric Grid Scroll Reveal
    gsap.utils.toArray('.project-grid-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            y: 80, opacity: 0, duration: 1, ease: "power3.out", delay: i * 0.1 
        });
    });


    // 11. Projects Section C: Horizontal Infinite Track
    const horizontalSection = document.querySelector('.horizontal-trigger-section');
    const horizontalTrack = document.querySelector('.horizontal-track');

    if (horizontalSection && horizontalTrack) {
        function getScrollAmount() {
            let trackWidth = horizontalTrack.scrollWidth;
            return -(trackWidth - window.innerWidth);
        }

        const tween = gsap.to(horizontalTrack, {
            x: getScrollAmount,
            ease: "none"
        });

        ScrollTrigger.create({
            trigger: horizontalSection,
            start: "top top",
            end: () => `+=${getScrollAmount() * -1}`,
            pin: true,
            animation: tween,
            scrub: 1,
            invalidateOnRefresh: true
        });
    }


    // 12. Magnetic Hover Buttons
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - (rect.width / 2);
            const y = e.clientY - rect.top - (rect.height / 2);
            gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power1.out" });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "power2.out" });
        });
    });


    // 13. Contact Section: HABLEMOS Animation
    gsap.from(".h-letter, .h-star", {
        scrollTrigger: {
            trigger: "#contact",
            start: "top 80%"
        },
        y: "100%",
        opacity: 0,
        rotateZ: 5,
        duration: 1,
        stagger: 0.05,
        ease: "power4.out"
    });

    const hablemosContainer = document.getElementById("hablemos-text");
    if (hablemosContainer) {
        hablemosContainer.addEventListener("mouseenter", () => {
            // Wave and color effect for letters
            gsap.to(".h-letter", {
                y: -15,
                color: "#3b82f6",
                stagger: {
                    each: 0.04,
                    yoyo: true,
                    repeat: 1
                },
                duration: 0.25,
                ease: "power2.out"
            });
            // Spin and scale the star
            gsap.to(".h-star", {
                rotate: "+=180",
                scale: 1.2,
                yoyo: true,
                repeat: 1,
                duration: 0.4,
                ease: "back.out(2)"
            });
        });
    }
});