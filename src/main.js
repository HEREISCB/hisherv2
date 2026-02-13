import './maintenance.js' // Maintenance mode check - runs first
import './style.css'
import './assistant.css'
import { initAssistant } from './assistant.js'

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
const saveData = navigator.connection?.saveData ?? false;
const supportsWebP = (() => {
    try {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').startsWith('data:image/webp');
    } catch {
        return false;
    }
})();

// Initialize AI Assistant
initAssistant();

// ============================================
// 0. IMAGE PERF (RESPONSIVE BACKGROUNDS)
// ============================================
function pickResponsiveUrl(el) {
    const md = el.getAttribute('data-bg-md');
    const lg = el.getAttribute('data-bg-lg');
    const fallback = el.getAttribute('data-bg-fallback');

    if (!supportsWebP) return fallback || null;

    const dpr = window.devicePixelRatio || 1;
    const vw = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
    const approxPixels = vw * dpr;

    if (approxPixels >= 1200 && lg) return lg;
    return md || lg || fallback || null;
}

function ensureBgLoaded(el) {
    if (!el || el.dataset.bgLoaded === '1') return;
    const url = pickResponsiveUrl(el);
    if (!url) return;

    if (el.classList.contains('usp-parallax-container')) {
        el.style.setProperty('--bg-image', `url("${url}")`);
    } else {
        el.style.backgroundImage = `url("${url}")`;
    }

    el.dataset.bgLoaded = '1';
}

// Load only the active hero slide immediately; defer the rest until needed.
const activeHeroSlideEarly = document.querySelector('.carousel-slide.active');
ensureBgLoaded(activeHeroSlideEarly);

// Defer the parallax background until it is near the viewport.
const uspParallax = document.querySelector('.usp-parallax-container');
if (uspParallax) {
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, obs) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    ensureBgLoaded(entry.target);
                    obs.unobserve(entry.target);
                }
            }
        }, { root: null, rootMargin: '300px 0px', threshold: 0.01 });
        io.observe(uspParallax);
    } else {
        ensureBgLoaded(uspParallax);
    }
}

// ============================================
// 1.3 SMOOTH SCROLLING (LENIS)
// ============================================
let lenis = null;
const enableLenis = !prefersReducedMotion && !saveData && (window.innerWidth >= 769);
if (enableLenis) {
    const { default: Lenis } = await import('lenis');
    lenis = new Lenis({
        duration: 1.2,        // Controls the smoothness/glide feel
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
        smoothWheel: true,
        touchMultiplier: 1.2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 2.2 JS-BASED SCROLL TRIGGERS (REVEAL ON SCROLL)
    // ============================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('scroll-trigger--offscreen');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initialize generic scroll triggers from guide
    document.querySelectorAll('.scroll-trigger').forEach(el => {
        el.classList.add('scroll-trigger--offscreen');
        observer.observe(el);
    });

    // Apply to existing elements automatically for 'Reveal' effect
    document.querySelectorAll('.section-title, .section-subtitle, .usp-card, .included-card, .amenity-slide').forEach(el => {
        el.classList.add('scroll-trigger', 'scroll-trigger--offscreen');
        observer.observe(el);
    });


    // ============================================
    // ZOOM ON SCROLL (PARALLAX EFFECT) - GUIDE 2.2
    // ============================================
    const heroSection = document.querySelector('.hero');
    const heroSlides = document.querySelectorAll('.carousel-slide');

    if (heroSection && heroSlides.length > 0) {
        const enableHeroZoom = !prefersReducedMotion && !saveData && (window.innerWidth >= 769);
        if (enableHeroZoom) {
            let heroZoomTicking = false;
            window.addEventListener('scroll', () => {
                if (heroZoomTicking) return;
                heroZoomTicking = true;

                requestAnimationFrame(() => {
                    const scrollPosition = window.pageYOffset;
                    const windowHeight = window.innerHeight;

                    if (scrollPosition <= windowHeight) {
                        const percentageSeen = scrollPosition / windowHeight;
                        const scale = 1 + (0.05 * percentageSeen);
                        const activeSlide = document.querySelector('.carousel-slide.active');
                        if (activeSlide) activeSlide.style.transform = `scale(${scale})`;
                    }

                    heroZoomTicking = false;
                });
            }, { passive: true });
        }
    }


    // ============================================
    // HERO CAROUSEL - AUTO SLIDE WITH FADE
    // ============================================
    if (heroSlides.length > 0) {
        let currentSlide = 0;
        const slideInterval = 5000;

        // Prefetch the next slide so transitions don't reveal an empty background.
        ensureBgLoaded(heroSlides[(currentSlide + 1) % heroSlides.length]);

        setInterval(() => {
            // Reset transform of previous slide for cleaner loop
            heroSlides[currentSlide].style.transform = 'scale(1)';
            heroSlides[currentSlide].classList.remove('active');

            currentSlide = (currentSlide + 1) % heroSlides.length;
            heroSlides[currentSlide].classList.add('active');

            // Load the slide background only when it becomes active.
            ensureBgLoaded(heroSlides[currentSlide]);
            ensureBgLoaded(heroSlides[(currentSlide + 1) % heroSlides.length]);
        }, slideInterval);
    }


    // ============================================
    // MOBILE NAVIGATION
    // ============================================
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const bars = mobileToggle.querySelectorAll('.bar');

            if (navLinks.classList.contains('active')) {
                bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });

        // Close on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const bars = mobileToggle.querySelectorAll('.bar');
                bars.forEach(bar => {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                });
            });
        });
    }


    // ============================================
    // SPACE TABS (HIS / HER / TOGETHER)
    // ============================================
    const spaceTabs = document.querySelectorAll('.space-tab');
    const spaceContents = document.querySelectorAll('.space-content');

    spaceTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            spaceTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            spaceContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${targetTab}-content`) {
                    content.classList.add('active');
                }
            });
        });
    });


    // ============================================
    // FAQ ACCORDION
    // ============================================
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });


    // ============================================
    // AMENITIES CAROUSEL - PINNED HORIZONTAL SCROLL
    // ============================================
    const scrollContainer = document.getElementById('amenities-scroll-container');
    const amenitiesCarousel = document.getElementById('amenities-carousel');
    const amenitiesWrapper = document.getElementById('amenities-scroll-section');

    if (scrollContainer && amenitiesCarousel && amenitiesWrapper) {
        // Calculate the extra scroll height needed
        function setupScrollContainer() {
            const carouselWidth = amenitiesCarousel.scrollWidth;
            const viewportWidth = window.innerWidth;
            const scrollDistance = carouselWidth - viewportWidth;

            // Set container height = viewport height + scroll distance needed
            // This creates the "room" for vertical scrolling that translates to horizontal
            const containerHeight = window.innerHeight + scrollDistance;
            scrollContainer.style.height = `${containerHeight}px`;

            return scrollDistance;
        }

        let maxScrollDistance = setupScrollContainer();

        // Recalculate on resize
        window.addEventListener('resize', () => {
            maxScrollDistance = setupScrollContainer();
        });

        // Use scroll position to control horizontal translation (throttled to rAF).
        let amenitiesTicking = false;
        function handleScroll() {
            if (amenitiesTicking) return;
            amenitiesTicking = true;

            requestAnimationFrame(() => {
                const containerRect = scrollContainer.getBoundingClientRect();
                const containerTop = containerRect.top;

                if (containerTop <= 0 && containerTop >= -(maxScrollDistance)) {
                    const scrollProgress = Math.abs(containerTop);
                    amenitiesCarousel.style.transform = `translateX(-${scrollProgress}px)`;
                } else if (containerTop > 0) {
                    amenitiesCarousel.style.transform = 'translateX(0)';
                } else {
                    amenitiesCarousel.style.transform = `translateX(-${maxScrollDistance}px)`;
                }

                amenitiesTicking = false;
            });
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    // ============================================
    // SMOOTH SCROLL (ANCHOR LINKS)
    // ============================================
    function smoothScrollTo(target, duration) {
        const start = window.pageYOffset;
        const distance = target - start;
        let startTime = null;

        function ease(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easeProgress = ease(progress);

            window.scrollTo(0, start + distance * easeProgress);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;

                smoothScrollTo(offsetPosition, 1000);
            }
        });
    });


    // ============================================
    // INQUIRY MODAL
    // ============================================
    const inquiryModal = document.getElementById('inquiry-modal');
    const openModalBtn = document.getElementById('open-inquiry-modal');
    const closeModalBtn = document.getElementById('close-inquiry-modal');
    const inquiryForm = document.getElementById('inquiry-form');

    if (inquiryModal && openModalBtn && closeModalBtn) {
        // Open modal
        openModalBtn.addEventListener('click', () => {
            inquiryModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Close modal
        closeModalBtn.addEventListener('click', () => {
            inquiryModal.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close on overlay click
        inquiryModal.addEventListener('click', (e) => {
            if (e.target === inquiryModal) {
                inquiryModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && inquiryModal.classList.contains('active')) {
                inquiryModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Form submission
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(inquiryForm);
            const data = Object.fromEntries(formData);

            // For now, show success message (can be connected to backend later)
            const submitBtn = inquiryForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Simulate sending (replace with actual API call)
            setTimeout(() => {
                submitBtn.textContent = 'Inquiry Sent!';
                submitBtn.style.background = '#25D366';

                // Reset form
                setTimeout(() => {
                    inquiryForm.reset();
                    inquiryModal.classList.remove('active');
                    document.body.style.overflow = '';
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 1500);
            }, 1000);

            console.log('Inquiry submitted:', data);
        });
    }

});
