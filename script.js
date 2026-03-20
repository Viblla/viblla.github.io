/* ============================================
   AHMED BILAL — PORTFOLIO SCRIPTS
   Indaco-style 3D Bento + Half-Screen Panel
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    const isLowPowerDevice = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
    const performanceMode = prefersReducedMotion || isLowPowerDevice;

    if (performanceMode) {
        document.body.classList.add('performance-mode');
    }

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
    let cursorRaf = null;

    if (cursor && follower && supportsHover && !performanceMode) {
        function animateFollower() {
            followerX += (mouseX - followerX) * 0.18;
            followerY += (mouseY - followerY) * 0.18;
            follower.style.left = followerX - 20 + 'px';
            follower.style.top = followerY - 20 + 'px';

            const dx = Math.abs(mouseX - followerX);
            const dy = Math.abs(mouseY - followerY);
            if (dx > 0.2 || dy > 0.2) {
                cursorRaf = requestAnimationFrame(animateFollower);
            } else {
                cursorRaf = null;
            }
        }

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX - 6 + 'px';
            cursor.style.top = mouseY - 6 + 'px';

            if (!cursorRaf) {
                cursorRaf = requestAnimationFrame(animateFollower);
            }
        }, { passive: true });
    }

    // Cursor hover targets
    const hoverTargets = document.querySelectorAll('a, button, .bento-item, .about-card, .arsenal-category, .timeline-item, .contact-card, .panel-close');
    if (cursor && follower && supportsHover && !performanceMode) {
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
    }

    // === Navigation Scroll Effect ===
    const nav = document.getElementById('nav');

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
    const longformCta = document.getElementById('longform-cta');

    const MAX_SIMULTANEOUS_VIDEOS = performanceMode ? 2 : 4;

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

    // Track visibility so we only play videos currently on screen.
    const visibleBentoItems = new Set();
    let workSectionVisible = false;

    bentoItems.forEach(item => {
        const video = item.querySelector('video');
        if (!video) return;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'metadata';
    });

    let isPanelOpen = false;

    function playAllVisibleVideos() {
        if (!workSectionVisible || isPanelOpen) return;

        const candidates = Array.from(visibleBentoItems)
            .filter(item => !item.classList.contains('filtered-out'))
            .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

        candidates.forEach((item, index) => {
            const video = item.querySelector('video');
            if (!video) return;

            if (index < MAX_SIMULTANEOUS_VIDEOS) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
    }

    function pauseAllVideos() {
        bentoItems.forEach(item => {
            const video = item.querySelector('video');
            if (video) {
                video.pause();
            }
        });
    }

    // Play while section is visible, pause when out of viewport
    const workSection = document.getElementById('work');
    const workObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            workSectionVisible = entry.isIntersecting;
            if (entry.isIntersecting) {
                playAllVisibleVideos();
            } else {
                pauseAllVideos();
            }
        });
    }, { threshold: 0.05 });

    if (workSection) workObserver.observe(workSection);

    // Track individual card visibility inside the work section viewport.
    if (workSection) {
        const bentoVisibilityObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    visibleBentoItems.add(entry.target);
                } else {
                    visibleBentoItems.delete(entry.target);
                    const video = entry.target.querySelector('video');
                    if (video) video.pause();
                }
            });

            playAllVisibleVideos();
        }, {
            root: null,
            threshold: 0.3,
            rootMargin: '40px 0px 40px 0px'
        });

        bentoItems.forEach(item => bentoVisibilityObserver.observe(item));
    }

    // --- Filter ---
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            if (longformCta) {
                longformCta.classList.toggle('active', filter === 'longform');
            }

            if (filter === 'longform') {
                bentoItems.forEach(item => {
                    item.classList.add('filtered-out');
                    const video = item.querySelector('video');
                    if (video) video.pause();
                });
                closePanel();
                return;
            }

            bentoItems.forEach(item => {
                const cat = item.getAttribute('data-category');
                if (filter === 'all' || cat === filter) {
                    item.classList.remove('filtered-out');
                } else {
                    item.classList.add('filtered-out');
                    const video = item.querySelector('video');
                    if (video) video.pause();
                }
            });

            // Keep ambient playback only for currently visible cards.
            playAllVisibleVideos();
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
    const previewMusic = document.getElementById('preview-music');
    const musicToggle = document.getElementById('music-toggle');

    let musicFadeRaf = null;
    const previewMusicTargetVolume = 0.35;
    let websiteMusicStarted = false;
    let userMutedMusic = false;
    const musicStartAtSeconds = 18;

    function fadeMusic(toVolume, duration = 500) {
        if (!previewMusic) return;
        const fromVolume = previewMusic.volume;
        const startTime = performance.now();

        if (musicFadeRaf) {
            cancelAnimationFrame(musicFadeRaf);
            musicFadeRaf = null;
        }

        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            previewMusic.volume = fromVolume + (toVolume - fromVolume) * progress;

            if (progress < 1) {
                musicFadeRaf = requestAnimationFrame(step);
            } else {
                musicFadeRaf = null;
                if (toVolume === 0) {
                    previewMusic.pause();
                }
            }
        }

        musicFadeRaf = requestAnimationFrame(step);
    }

    function syncMusicToggleState() {
        if (!musicToggle) return;
        musicToggle.classList.toggle('is-muted', userMutedMusic);
        musicToggle.setAttribute('aria-pressed', userMutedMusic ? 'true' : 'false');
        musicToggle.setAttribute('title', userMutedMusic ? 'Unmute music' : 'Mute music');
    }

    function setMusicStartTime() {
        if (!previewMusic) return;
        if (!Number.isFinite(previewMusic.duration) || previewMusic.duration <= 0) return;
        if (previewMusic.duration > musicStartAtSeconds) {
            previewMusic.currentTime = musicStartAtSeconds;
        }
    }

    function startWebsiteMusic() {
        if (!previewMusic) return;
        if (websiteMusicStarted) {
            if (!userMutedMusic && previewMusic.paused) {
                previewMusic.play().then(() => {
                    fadeMusic(previewMusicTargetVolume, 450);
                }).catch(() => {});
            }
            return;
        }
        previewMusic.muted = userMutedMusic;
        previewMusic.volume = 0;
        setMusicStartTime();
        const playPromise = previewMusic.play();
        if (playPromise && typeof playPromise.then === 'function') {
            playPromise.then(() => {
                websiteMusicStarted = true;
                if (!userMutedMusic) {
                    fadeMusic(previewMusicTargetVolume, 900);
                }
            }).catch(() => {
                websiteMusicStarted = false;
            });
        } else {
            websiteMusicStarted = true;
            if (!userMutedMusic) {
                fadeMusic(previewMusicTargetVolume, 900);
            }
        }
    }

    function duckWebsiteMusic() {
        if (!previewMusic) return;
        fadeMusic(0, 500);
    }

    function restoreWebsiteMusic() {
        if (!previewMusic) return;
        if (userMutedMusic) return;
        if (previewMusic.paused) {
            previewMusic.play().catch(() => {});
        }
        previewMusic.muted = false;
        fadeMusic(previewMusicTargetVolume, 700);
    }

    function toggleMusicMute() {
        if (!previewMusic) return;

        userMutedMusic = !userMutedMusic;
        syncMusicToggleState();

        if (userMutedMusic) {
            fadeMusic(0, 250);
        } else {
            if (previewMusic.paused) {
                previewMusic.play().then(() => {
                    previewMusic.muted = false;
                    fadeMusic(previewMusicTargetVolume, 450);
                }).catch(() => {
                    startWebsiteMusic();
                });
            } else {
                previewMusic.muted = false;
                fadeMusic(previewMusicTargetVolume, 450);
            }
        }
    }

    // Start website background music as soon as page opens (during loader)
    startWebsiteMusic();

    if (previewMusic) {
        previewMusic.addEventListener('loadedmetadata', setMusicStartTime);
        previewMusic.addEventListener('canplay', () => {
            if (!websiteMusicStarted) {
                startWebsiteMusic();
            }
        });
    }

    if (musicToggle) {
        syncMusicToggleState();
        musicToggle.addEventListener('click', toggleMusicMute);
    }

    function openPanel(item) {
        if (!videoPanel || !panelBackdrop || !panelVideoWrap || !panelInfo) {
            console.error('Panel DOM elements not found', { videoPanel, panelBackdrop, panelVideoWrap, panelInfo });
            return;
        }
        const title = item.getAttribute('data-title');
        const tags = item.getAttribute('data-tags');
        const video = item.querySelector('video');
        const driveLink = item.getAttribute('data-drive-link');

        // Set info
        panelInfo.querySelector('.panel-tags').textContent = tags;
        panelInfo.querySelector('.panel-title').textContent = title;
        const panelDesc = panelInfo.querySelector('.panel-desc');
        if (panelDesc) {
            panelDesc.innerHTML = 'Click to view the full project. Add your video files and they\'ll play right here.';
        }

        // Set video or placeholder
        panelVideoWrap.innerHTML = '';

        if (driveLink && driveLink.trim() !== '') {
            panelVideoWrap.innerHTML = `
                <div class="panel-ph">
                    <span class="ph-play" style="font-size:60px;color:var(--accent);opacity:0.4;">▶</span>
                    <span style="font-size:13px;color:var(--text-muted);letter-spacing:2px;text-transform:uppercase;">Long-form samples on Drive</span>
                </div>
            `;
            if (panelDesc) {
                panelDesc.innerHTML = `Visit my Drive for long-form samples: <a href="${driveLink}" target="_blank" rel="noopener noreferrer">Open Google Drive Folder</a>`;
            }
        } else if (video) {
            const panelVideo = document.createElement('video');
            panelVideo.src = video.src;
            panelVideo.autoplay = true;
            panelVideo.loop = true;
            panelVideo.muted = false; // Unmute in panel for full experience
            panelVideo.playsInline = true;
            panelVideo.controls = true;
            panelVideoWrap.appendChild(panelVideo);
        } else {
            panelVideoWrap.innerHTML = `
                <div class="panel-ph">
                    <span class="ph-play" style="font-size:60px;color:var(--accent);opacity:0.4;">▶</span>
                    <span style="font-size:13px;color:var(--text-muted);letter-spacing:2px;text-transform:uppercase;">Add your video file</span>
                </div>
            `;
        }

        // Open
        isPanelOpen = true;
        videoPanel.classList.add('open');
        panelBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
        pauseAllVideos();
        duckWebsiteMusic();
    }

    function closePanel() {
        if (!videoPanel || !panelBackdrop || !panelVideoWrap) return;
        isPanelOpen = false;
        videoPanel.classList.remove('open');
        panelBackdrop.classList.remove('active');
        document.body.style.overflow = 'auto';

        // Pause panel video
        const pv = panelVideoWrap.querySelector('video');
        if (pv) pv.pause();

        playAllVisibleVideos();
        restoreWebsiteMusic();
    }

    // Click bento item → open panel (delegated to include clicks on video/overlay)
    if (bentoGrid) {
        bentoGrid.addEventListener('click', (event) => {
            const item = event.target.closest('.bento-item');
            if (!item || !bentoGrid.contains(item)) return;
            if (item.classList.contains('filtered-out')) return;
            openPanel(item);
        });
    }

    // Keyboard accessibility for each card.
    bentoItems.forEach((item) => {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `Open preview for ${item.getAttribute('data-title') || 'project'}`);

        item.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            if (item.classList.contains('filtered-out')) return;
            openPanel(item);
        });
    });

    // Close panel
    if (panelClose) {
        panelClose.addEventListener('click', closePanel);
    }
    if (panelBackdrop) {
        panelBackdrop.addEventListener('click', closePanel);
    }

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

    // === Active Nav on Scroll ===
    const heroBgText = document.querySelector('.hero-bg-text');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let scrollRaf = null;

    function updateOnScroll() {
        const scrollY = window.scrollY;

        if (nav) {
            nav.classList.toggle('scrolled', scrollY > 80);
        }

        if (heroBgText && !performanceMode) {
            heroBgText.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.2}px))`;
        }

        let current = '';
        sections.forEach(section => {
            if (scrollY >= section.offsetTop - 120) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === '#' + current) {
                link.style.color = 'var(--accent)';
            }
        });
    }

    function onScroll() {
        if (scrollRaf) return;
        scrollRaf = requestAnimationFrame(() => {
            updateOnScroll();
            scrollRaf = null;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateOnScroll();

});
