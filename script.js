/* ============================================
   AHMED BILAL — PORTFOLIO SCRIPTS
   Indaco-style 3D Bento + Half-Screen Panel
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // === Loader ===
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = 'auto';
        animateHero();
    }, 1500);

    // === Custom Cursor ===
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX - 6 + 'px';
        cursor.style.top = mouseY - 6 + 'px';
    });

    function animateFollower() {
        followerX += (mouseX - followerX) * 0.12;
        followerY += (mouseY - followerY) * 0.12;
        follower.style.left = followerX - 20 + 'px';
        follower.style.top = followerY - 20 + 'px';
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Cursor hover targets
    const hoverTargets = document.querySelectorAll('a, button, .bento-item, .about-card, .arsenal-category, .timeline-item, .contact-card, .panel-close');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            follower.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            follower.classList.remove('hover');
        });
    });

    // === Navigation Scroll Effect ===
    const nav = document.getElementById('nav');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // === Mobile Menu ===
    const hamburger = document.getElementById('nav-hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : 'auto';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('open');
            document.body.style.overflow = 'auto';
        });
    });

    // === Hero Animation ===
    function animateHero() {
        const reveals = document.querySelectorAll('.hero .reveal-up');
        reveals.forEach((el, i) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, i * 150);
        });
        setTimeout(animateCounters, 600);
    }

    // === Counter Animation ===
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const start = performance.now();

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                counter.textContent = Math.round(eased * target);
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        });
    }

    // === Scroll Reveal ===
    const revealElements = document.querySelectorAll('.reveal-up:not(.hero .reveal-up)');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // === Arsenal Skill Bars ===
    const skillBars = document.querySelectorAll('.item-fill');

    const barObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                entry.target.style.width = width + '%';
                barObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => barObserver.observe(bar));

    // ============================================
    // BENTO GRID — Autoplay, Hover, Filter, Click
    // ============================================

    const bentoItems = document.querySelectorAll('.bento-item');
    const filterBtns = document.querySelectorAll('.wf-btn');
    const bentoGrid = document.getElementById('bento-grid');

    // --- Auto-detect video aspect ratio and assign grid size ---
    bentoItems.forEach(item => {
        const video = item.querySelector('video');
        if (video) {
            video.addEventListener('loadedmetadata', () => {
                const ratio = video.videoWidth / video.videoHeight;
                // Remove any existing size classes
                item.classList.remove('bento-wide', 'bento-tall');
                if (ratio >= 1.4) {
                    // Landscape — span 2 columns
                    item.classList.add('bento-wide');
                } else if (ratio <= 0.75) {
                    // Portrait / vertical — span 2 rows
                    item.classList.add('bento-tall');
                }
                // Otherwise ~square, stays 1×1
            });
        }
    });

    // --- Autoplay all videos in background ---
    function autoplayAllVideos() {
        bentoItems.forEach(item => {
            const video = item.querySelector('video');
            if (video) {
                video.muted = true;
                video.loop = true;
                video.playsInline = true;
                video.play().catch(() => {});
            }
        });
    }

    // Autoplay when section becomes visible
    const workSection = document.getElementById('work');
    const workObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                autoplayAllVideos();
                workObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    if (workSection) workObserver.observe(workSection);

    // --- Filter ---
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            bentoItems.forEach(item => {
                const cat = item.getAttribute('data-category');
                if (filter === 'all' || cat === filter) {
                    item.classList.remove('filtered-out');
                } else {
                    item.classList.add('filtered-out');
                }
            });
        });
    });

    // ============================================
    // HALF-SCREEN VIDEO PANEL
    // ============================================

    const videoPanel = document.getElementById('video-panel');
    const panelBackdrop = document.getElementById('panel-backdrop');
    const panelClose = document.getElementById('panel-close');
    const panelVideoWrap = document.getElementById('panel-video-wrap');
    const panelInfo = document.getElementById('panel-info');

    function openPanel(item) {
        const title = item.getAttribute('data-title');
        const tags = item.getAttribute('data-tags');
        const video = item.querySelector('video');

        // Set info
        panelInfo.querySelector('.panel-tags').textContent = tags;
        panelInfo.querySelector('.panel-title').textContent = title;

        // Set video or placeholder
        panelVideoWrap.innerHTML = '';

        if (video) {
            const panelVideo = document.createElement('video');
            panelVideo.src = video.src;
            panelVideo.autoplay = true;
            panelVideo.loop = true;
            panelVideo.muted = false; // Unmute in panel for full experience
            panelVideo.playsInline = true;
            panelVideo.controls = true;
            panelVideo.style.width = '100%';
            panelVideo.style.height = '100%';
            panelVideo.style.objectFit = 'contain';
            panelVideoWrap.appendChild(panelVideo);

            // Set panel wrapper aspect ratio to match video
            panelVideo.addEventListener('loadedmetadata', () => {
                const ratio = panelVideo.videoWidth / panelVideo.videoHeight;
                panelVideoWrap.style.aspectRatio = ratio.toString();
            });
        } else {
            panelVideoWrap.innerHTML = `
                <div class="panel-ph">
                    <span class="ph-play" style="font-size:60px;color:var(--accent);opacity:0.4;">▶</span>
                    <span style="font-size:13px;color:var(--text-muted);letter-spacing:2px;text-transform:uppercase;">Add your video file</span>
                </div>
            `;
        }

        // Open
        videoPanel.classList.add('open');
        panelBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePanel() {
        videoPanel.classList.remove('open');
        panelBackdrop.classList.remove('active');
        document.body.style.overflow = 'auto';

        // Pause panel video
        const pv = panelVideoWrap.querySelector('video');
        if (pv) pv.pause();
    }

    // Click bento item → open panel
    bentoItems.forEach(item => {
        item.addEventListener('click', () => openPanel(item));
    });

    // Close panel
    panelClose.addEventListener('click', closePanel);
    panelBackdrop.addEventListener('click', closePanel);

    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePanel();
    });

    // === Smooth Scroll ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // === Parallax Background Text ===
    const heroBgText = document.querySelector('.hero-bg-text');
    if (heroBgText) {
        window.addEventListener('scroll', () => {
            heroBgText.style.transform = `translate(-50%, calc(-50% + ${window.scrollY * 0.3}px))`;
        });
    }

    // === Active Nav on Scroll ===
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 120) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === '#' + current) {
                link.style.color = 'var(--accent)';
            }
        });
    });

});
