import './style.css'
import './assistant.css'
import Lenis from 'lenis'
import { initAssistant } from './assistant.js'

// Initialize AI Assistant
initAssistant();

// ============================================
// 1.3 SMOOTH SCROLLING (LENIS)
// ============================================
const lenis = new Lenis({
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
        window.addEventListener('scroll', () => {
            const scrollPosition = window.pageYOffset;
            const windowHeight = window.innerHeight;

            if (scrollPosition <= windowHeight) {
                const percentageSeen = scrollPosition / windowHeight;
                // 2.2 Guide: --zoom-in-ratio: 1 + (0.002 * percentage)
                // Implemented via JS transform scale
                const scale = 1 + (0.05 * percentageSeen);

                heroSlides.forEach(slide => {
                    if (slide.classList.contains('active')) {
                        slide.style.transform = `scale(${scale})`;
                    }
                });
            }
        });
    }


    // ============================================
    // HERO CAROUSEL - AUTO SLIDE WITH FADE
    // ============================================
    if (heroSlides.length > 0) {
        let currentSlide = 0;
        const slideInterval = 5000;

        setInterval(() => {
            // Reset transform of previous slide for cleaner loop
            heroSlides[currentSlide].style.transform = 'scale(1)';
            heroSlides[currentSlide].classList.remove('active');

            currentSlide = (currentSlide + 1) % heroSlides.length;
            heroSlides[currentSlide].classList.add('active');
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

        // Use scroll position to control horizontal translation
        function handleScroll() {
            const containerRect = scrollContainer.getBoundingClientRect();
            const containerTop = containerRect.top;

            // Calculate how far we've scrolled into the container
            // containerTop starts positive (below viewport), goes to 0 (at top), then negative
            if (containerTop <= 0 && containerTop >= -(maxScrollDistance)) {
                // We're in the "scroll zone" - translate vertical to horizontal
                const scrollProgress = Math.abs(containerTop);
                amenitiesCarousel.style.transform = `translateX(-${scrollProgress}px)`;
            } else if (containerTop > 0) {
                // Before the section - reset to start
                amenitiesCarousel.style.transform = 'translateX(0)';
            } else {
                // After the section - stay at end
                amenitiesCarousel.style.transform = `translateX(-${maxScrollDistance}px)`;
            }
        }

        // Listen to scroll
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Initial call
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

});
