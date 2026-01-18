// Animation utilities for Product Roadmap
document.addEventListener('DOMContentLoaded', () => {
    // Initialize animation library
    AOS.init({
        duration: 800,
        once: true,
        easing: 'ease-out-cubic',
        delay: 100,
        mirror: true
    });

    // Initialize GSAP
    gsap.registerPlugin(ScrollTrigger);

    // Animate roadmap items on scroll
    const animateRoadmapItems = () => {
        gsap.utils.toArray('.roadmap-item').forEach((item, index) => {
            gsap.from(item, {
                duration: 1,
                x: index % 2 === 0 ? -100 : 100,
                opacity: 0,
                scrollTrigger: {
                    trigger: item,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            });
        });
    };

    // Add hover effects to cards
    const addCardHoverEffects = () => {
        const cards = document.querySelectorAll('.sirsi-card, .roadmap-content');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: 0.3,
                    scale: 1.02,
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: 0.3,
                    scale: 1,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    ease: "power2.out"
                });
            });
        });
    };

    // Animate metrics on scroll
    const animateMetrics = () => {
        const metrics = document.querySelectorAll('.sirsi-metric');
        metrics.forEach(metric => {
            const value = metric.getAttribute('value');
            const duration = 2;
            let start = 0;

            // Parse numeric value for animation
            if (value.includes('%')) {
                start = 0;
            } else if (value.includes('$')) {
                start = 0;
            } else if (!isNaN(value)) {
                start = 0;
            }

            gsap.from(metric, {
                scrollTrigger: {
                    trigger: metric,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                },
                textContent: start,
                duration: duration,
                ease: "power1.out",
                snap: { textContent: 1 },
                onUpdate: function() {
                    if (value.includes('%')) {
                        metric.textContent = Math.round(this.targets()[0].textContent) + '%';
                    } else if (value.includes('$')) {
                        metric.textContent = '$' + Math.round(this.targets()[0].textContent);
                    }
                }
            });
        });
    };

    // Keyboard navigation for accessibility
    const setupKeyboardNavigation = () => {
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const modal = document.querySelector('#roadmap-modal'); // If you have a modal

        document.addEventListener('keydown', (e) => {
            // ESC key to close modal
            if (e.key === 'Escape' && modal?.classList.contains('active')) {
                modal.classList.remove('active');
            }

            // Arrow key navigation for roadmap items
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const items = document.querySelectorAll('.roadmap-item');
                const activeItem = document.activeElement.closest('.roadmap-item');
                const currentIndex = Array.from(items).indexOf(activeItem);

                if (currentIndex !== -1) {
                    let nextIndex;
                    if (e.key === 'ArrowRight') {
                        nextIndex = (currentIndex + 1) % items.length;
                    } else {
                        nextIndex = (currentIndex - 1 + items.length) % items.length;
                    }
                    items[nextIndex].querySelector(focusableElements)?.focus();
                }
            }
        });
    };

    // Initialize all animations
    const initAnimations = () => {
        animateRoadmapItems();
        addCardHoverEffects();
        animateMetrics();
        setupKeyboardNavigation();
    };

    // Run animations
    initAnimations();

    // Re-run animations on dynamic content updates
    document.addEventListener('contentChanged', initAnimations);
});
