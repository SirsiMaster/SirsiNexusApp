// SirsiNexus Shared JavaScript Functionality

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initAccessibility();
    initCharts();
    initMetrics();
    initNavigation();
    setupLazyLoading();
});

// Dark Mode Management
const initDarkMode = () => {
    const darkMode = localStorage.getItem('darkMode') === 'true' || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    document.documentElement.classList.toggle('dark', darkMode);

    // Dark mode toggle button
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', isDark);
            
            // Update charts if they exist
            updateChartsTheme(isDark);
        });
    }

    // Watch system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('darkMode')) {
            document.documentElement.classList.toggle('dark', e.matches);
            updateChartsTheme(e.matches);
        }
    });
};

// Accessibility Enhancements
const initAccessibility = () => {
    // Skip to main content
    const skipLink = document.querySelector('.skip-to-main');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const main = document.querySelector('main');
            if (main) {
                main.setAttribute('tabindex', '-1');
                main.focus();
            }
        });
    }

    // Keyboard navigation
    const handleTabbing = (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('using-keyboard');
        }
    };

    const handleMouseClick = () => {
        document.body.classList.remove('using-keyboard');
    };

    document.addEventListener('keydown', handleTabbing);
    document.addEventListener('mousedown', handleMouseClick);

    // Enhanced focus management
    document.querySelectorAll('button, a, input, select, textarea, [tabindex]').forEach(el => {
        if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) {
            const text = el.textContent.trim();
            if (text) el.setAttribute('aria-label', text);
        }
    });
};

// Chart Management
const initCharts = () => {
    const charts = document.querySelectorAll('.sirsi-chart');
    if (!charts.length) return;

    // Default chart configuration
    const defaultConfig = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index'
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    family: "'Inter', sans-serif",
                    size: 14,
                    weight: 600
                },
                bodyFont: {
                    family: "'Inter', sans-serif",
                    size: 13
                },
                padding: 12,
                cornerRadius: 4,
                displayColors: true
            }
        }
    };

    // Initialize each chart
    charts.forEach(chartEl => {
        const ctx = chartEl.getContext('2d');
        const data = JSON.parse(chartEl.dataset.chartData || '{}');
        const type = chartEl.dataset.chartType || 'line';
        
        new Chart(ctx, {
            type,
            data,
            options: {
                ...defaultConfig,
                ...JSON.parse(chartEl.dataset.chartOptions || '{}')
            }
        });
    });
};

// Update charts theme
const updateChartsTheme = (isDark) => {
    Chart.instances.forEach(chart => {
        const newOptions = {
            scales: {
                x: { grid: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' } },
                y: { grid: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' } }
            },
            plugins: {
                legend: {
                    labels: {
                        color: isDark ? '#e5e7eb' : '#374151'
                    }
                }
            }
        };
        
        chart.options = Chart.helpers.merge(chart.options, newOptions);
        chart.update('none');
    });
};

// Metrics Animation
const initMetrics = () => {
    const metrics = document.querySelectorAll('.sirsi-metric-value');
    
    const animateValue = (element, start, end, duration) => {
        const startTimestamp = performance.now();
        const format = element.dataset.format || 'number';
        
        const step = (timestamp) => {
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = start + (end - start) * progress;
            
            switch (format) {
                case 'currency':
                    element.textContent = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    }).format(current);
                    break;
                case 'percent':
                    element.textContent = `${Math.round(current)}%`;
                    break;
                default:
                    element.textContent = Math.round(current);
            }
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        
        requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const value = parseFloat(el.dataset.value);
                animateValue(el, 0, value, 1000);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.1 });

    metrics.forEach(metric => observer.observe(metric));
};

// Navigation Management
const initNavigation = () => {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('show');
            menuToggle.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
    }

    // Active link highlighting
    const currentPath = window.location.pathname;
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                target.focus({ preventScroll: true });
            }
        });
    });
};

// Lazy Loading
const setupLazyLoading = () => {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const lazyIframes = document.querySelectorAll('iframe[loading="lazy"]');

    const lazyLoadCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                if (element.dataset.src) {
                    element.src = element.dataset.src;
                    delete element.dataset.src;
                }
                observer.unobserve(element);
            }
        });
    };

    const imageObserver = new IntersectionObserver(lazyLoadCallback, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    lazyImages.forEach(img => imageObserver.observe(img));
    lazyIframes.forEach(iframe => imageObserver.observe(iframe));

    // Preload on hover for important elements
    document.querySelectorAll('[data-preload-hover]').forEach(el => {
        el.addEventListener('mouseover', () => {
            const preloadUrl = el.dataset.preloadHover;
            if (preloadUrl && !el.dataset.preloaded) {
                const preloadLink = document.createElement('link');
                preloadLink.rel = 'preload';
                preloadLink.as = el.tagName.toLowerCase() === 'img' ? 'image' : 'fetch';
                preloadLink.href = preloadUrl;
                document.head.appendChild(preloadLink);
                el.dataset.preloaded = 'true';
            }
        }, { once: true });
    });
};
