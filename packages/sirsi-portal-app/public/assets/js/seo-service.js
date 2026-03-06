/**
 * SEO Service
 * Handles meta tags, schema markup, and SEO optimization
 * @version 1.0.0
 */

class SEOService {
    constructor() {
        this.initialized = false;
        this.defaultMeta = {
            title: 'Sirsi Nexus - AI-Powered Cloud Infrastructure Platform',
            description: 'Build, deploy, and scale applications with Sirsi Nexus. Enterprise-grade cloud infrastructure with AI-powered optimization and seamless developer experience.',
            keywords: 'cloud platform, AI infrastructure, serverless, deployment, scaling, developer tools, cloud computing, SaaS, PaaS',
            author: 'Sirsi Nexus',
            image: 'https://sirsi.ai/assets/images/og-image.png',
            url: 'https://sirsi.ai',
            type: 'website',
            siteName: 'Sirsi Nexus',
            twitterCard: 'summary_large_image',
            twitterSite: '@sirsinexus'
        };
    }

    /**
     * Initialize SEO service
     */
    init() {
        if (this.initialized) return;

        // Set up default meta tags
        this.setupMetaTags();

        // Add schema markup
        this.addSchemaMarkup();

        // Set up Open Graph tags
        this.setupOpenGraph();

        // Set up Twitter Card
        this.setupTwitterCard();

        // Add canonical URL
        this.addCanonicalUrl();

        // Set up structured data
        this.setupStructuredData();

        // Monitor for dynamic content changes
        this.observeContentChanges();

        this.initialized = true;
        console.log('SEO service initialized');
    }

    /**
     * Set up basic meta tags
     */
    setupMetaTags() {
        const meta = this.getPageMeta();

        // Title
        document.title = meta.title;

        // Description
        this.setMetaTag('name', 'description', meta.description);

        // Keywords
        this.setMetaTag('name', 'keywords', meta.keywords);

        // Author
        this.setMetaTag('name', 'author', meta.author);

        // Viewport (mobile optimization)
        this.setMetaTag('name', 'viewport', 'width=device-width, initial-scale=1.0');

        // Robots
        this.setMetaTag('name', 'robots', 'index, follow');

        // Language
        this.setMetaTag('http-equiv', 'content-language', 'en-US');

        // Charset
        this.setMetaTag('charset', 'UTF-8');

        // Theme color
        this.setMetaTag('name', 'theme-color', '#7c3aed');

        // Application name
        this.setMetaTag('name', 'application-name', 'Sirsi Nexus');

        // Rating
        this.setMetaTag('name', 'rating', 'general');
    }

    /**
     * Set up Open Graph tags
     */
    setupOpenGraph() {
        const meta = this.getPageMeta();

        this.setMetaTag('property', 'og:title', meta.title);
        this.setMetaTag('property', 'og:description', meta.description);
        this.setMetaTag('property', 'og:type', meta.type);
        this.setMetaTag('property', 'og:url', meta.url);
        this.setMetaTag('property', 'og:image', meta.image);
        this.setMetaTag('property', 'og:site_name', meta.siteName);
        this.setMetaTag('property', 'og:locale', 'en_US');
        
        // Additional Open Graph tags
        this.setMetaTag('property', 'og:image:width', '1200');
        this.setMetaTag('property', 'og:image:height', '630');
        this.setMetaTag('property', 'og:image:alt', meta.title);
    }

    /**
     * Set up Twitter Card
     */
    setupTwitterCard() {
        const meta = this.getPageMeta();

        this.setMetaTag('name', 'twitter:card', meta.twitterCard);
        this.setMetaTag('name', 'twitter:site', meta.twitterSite);
        this.setMetaTag('name', 'twitter:title', meta.title);
        this.setMetaTag('name', 'twitter:description', meta.description);
        this.setMetaTag('name', 'twitter:image', meta.image);
        this.setMetaTag('name', 'twitter:image:alt', meta.title);
    }

    /**
     * Add canonical URL
     */
    addCanonicalUrl() {
        const url = this.getCanonicalUrl();
        
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement('link');
            link.rel = 'canonical';
            document.head.appendChild(link);
        }
        link.href = url;
    }

    /**
     * Add schema markup
     */
    addSchemaMarkup() {
        const schemas = [];

        // Organization schema
        schemas.push(this.getOrganizationSchema());

        // Website schema
        schemas.push(this.getWebsiteSchema());

        // Breadcrumb schema
        const breadcrumb = this.getBreadcrumbSchema();
        if (breadcrumb) schemas.push(breadcrumb);

        // Product schema (for pricing page)
        if (this.isPage('pricing')) {
            schemas.push(this.getProductSchema());
        }

        // FAQ schema (for FAQ page)
        if (this.isPage('faq')) {
            schemas.push(this.getFAQSchema());
        }

        // Article schema (for blog posts)
        if (this.isPage('blog')) {
            schemas.push(this.getArticleSchema());
        }

        // Add schemas to page
        schemas.forEach(schema => {
            if (schema) {
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.textContent = JSON.stringify(schema);
                document.head.appendChild(script);
            }
        });
    }

    /**
     * Get organization schema
     */
    getOrganizationSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Sirsi Nexus",
            "url": "https://sirsi.ai",
            "logo": "https://sirsi.ai/assets/images/logo.png",
            "description": "AI-Powered Cloud Infrastructure Platform",
            "founder": {
                "@type": "Person",
                "name": "Sirsi Team"
            },
            "foundingDate": "2024",
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-XXX-XXX-XXXX",
                "contactType": "customer support",
                "email": "support@sirsi.ai",
                "availableLanguage": ["English"]
            },
            "sameAs": [
                "https://twitter.com/sirsinexus",
                "https://linkedin.com/company/sirsinexus",
                "https://github.com/SirsiMaster"
            ],
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
            }
        };
    }

    /**
     * Get website schema
     */
    getWebsiteSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Sirsi Nexus",
            "url": "https://sirsi.ai",
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://sirsi.ai/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
            }
        };
    }

    /**
     * Get breadcrumb schema
     */
    getBreadcrumbSchema() {
        const breadcrumbs = this.getBreadcrumbs();
        if (!breadcrumbs || breadcrumbs.length === 0) return null;

        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.name,
                "item": item.url
            }))
        };
    }

    /**
     * Get product schema
     */
    getProductSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Sirsi Nexus Platform",
            "description": "Enterprise-grade cloud infrastructure platform",
            "brand": {
                "@type": "Brand",
                "name": "Sirsi Nexus"
            },
            "offers": [
                {
                    "@type": "Offer",
                    "name": "Free Plan",
                    "price": "0",
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock"
                },
                {
                    "@type": "Offer",
                    "name": "Starter Plan",
                    "price": "29",
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock"
                },
                {
                    "@type": "Offer",
                    "name": "Professional Plan",
                    "price": "99",
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock"
                }
            ],
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "127"
            }
        };
    }

    /**
     * Get FAQ schema
     */
    getFAQSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "What is Sirsi Nexus?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Sirsi Nexus is an AI-powered cloud infrastructure platform that helps developers build, deploy, and scale applications efficiently."
                    }
                },
                {
                    "@type": "Question",
                    "name": "How much does Sirsi Nexus cost?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Sirsi Nexus offers a free tier for getting started, with paid plans starting at $29/month for additional features and resources."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Is there a free trial?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, all paid plans come with a 14-day free trial. No credit card required to start."
                    }
                }
            ]
        };
    }

    /**
     * Get article schema
     */
    getArticleSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": document.title,
            "description": this.getMetaContent('description'),
            "author": {
                "@type": "Person",
                "name": "Sirsi Team"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Sirsi Nexus",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://sirsi.ai/assets/images/logo.png"
                }
            },
            "datePublished": new Date().toISOString(),
            "dateModified": new Date().toISOString(),
            "image": this.getMetaContent('og:image')
        };
    }

    /**
     * Set up structured data for specific pages
     */
    setupStructuredData() {
        // Add more specific structured data based on page type
        const pathname = window.location.pathname;

        if (pathname.includes('contact')) {
            this.addContactStructuredData();
        } else if (pathname.includes('about')) {
            this.addAboutStructuredData();
        } else if (pathname.includes('services') || pathname.includes('solutions')) {
            this.addServiceStructuredData();
        }
    }

    /**
     * Add contact structured data
     */
    addContactStructuredData() {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "mainEntity": {
                "@type": "Organization",
                "name": "Sirsi Nexus",
                "url": "https://sirsi.ai",
                "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+1-XXX-XXX-XXXX",
                    "contactType": "customer support",
                    "email": "support@sirsi.ai"
                }
            }
        });
        document.head.appendChild(script);
    }

    /**
     * Add about structured data
     */
    addAboutStructuredData() {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "mainEntity": {
                "@type": "Organization",
                "name": "Sirsi Nexus",
                "description": "Sirsi Nexus is revolutionizing cloud infrastructure with AI-powered optimization."
            }
        });
        document.head.appendChild(script);
    }

    /**
     * Add service structured data
     */
    addServiceStructuredData() {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Cloud Infrastructure Platform",
            "provider": {
                "@type": "Organization",
                "name": "Sirsi Nexus"
            },
            "areaServed": {
                "@type": "Country",
                "name": "Worldwide"
            },
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Cloud Services",
                "itemListElement": [
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "Cloud Hosting"
                        }
                    },
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "AI Optimization"
                        }
                    },
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "Auto Scaling"
                        }
                    }
                ]
            }
        });
        document.head.appendChild(script);
    }

    /**
     * Get page-specific meta information
     */
    getPageMeta() {
        const pathname = window.location.pathname;
        const pageMeta = { ...this.defaultMeta };

        // Customize based on page
        if (pathname.includes('pricing')) {
            pageMeta.title = 'Pricing - Sirsi Nexus';
            pageMeta.description = 'Simple, transparent pricing for Sirsi Nexus. Start free, scale as you grow.';
        } else if (pathname.includes('docs')) {
            pageMeta.title = 'Documentation - Sirsi Nexus';
            pageMeta.description = 'Complete documentation for Sirsi Nexus platform. Get started guides, API references, and tutorials.';
        } else if (pathname.includes('blog')) {
            pageMeta.title = 'Blog - Sirsi Nexus';
            pageMeta.description = 'Latest updates, tutorials, and insights from the Sirsi Nexus team.';
        } else if (pathname.includes('about')) {
            pageMeta.title = 'About Us - Sirsi Nexus';
            pageMeta.description = 'Learn about Sirsi Nexus, our mission to revolutionize cloud infrastructure with AI.';
        }

        pageMeta.url = window.location.href;

        return pageMeta;
    }

    /**
     * Get breadcrumbs for current page
     */
    getBreadcrumbs() {
        const pathname = window.location.pathname;
        const parts = pathname.split('/').filter(p => p);
        
        if (parts.length === 0) return null;

        const breadcrumbs = [
            { name: 'Home', url: 'https://sirsi.ai' }
        ];

        let currentPath = '';
        parts.forEach((part, index) => {
            currentPath += '/' + part;
            const name = part.replace('.html', '')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            
            breadcrumbs.push({
                name: name,
                url: 'https://sirsi.ai' + currentPath
            });
        });

        return breadcrumbs;
    }

    /**
     * Get canonical URL
     */
    getCanonicalUrl() {
        const url = new URL(window.location.href);
        // Remove query parameters for canonical URL
        url.search = '';
        // Remove hash
        url.hash = '';
        return url.href;
    }

    /**
     * Set meta tag
     */
    setMetaTag(attribute, key, value) {
        let meta = document.querySelector(`meta[${attribute}="${key}"]`);
        
        if (!meta) {
            meta = document.createElement('meta');
            if (attribute === 'charset') {
                meta.charset = value;
            } else {
                meta.setAttribute(attribute, key);
                meta.content = value;
            }
            document.head.appendChild(meta);
        } else {
            if (attribute !== 'charset') {
                meta.content = value;
            }
        }
    }

    /**
     * Get meta content
     */
    getMetaContent(name) {
        const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        return meta ? meta.content : '';
    }

    /**
     * Check if current page matches
     */
    isPage(pageName) {
        return window.location.pathname.includes(pageName);
    }

    /**
     * Update page meta dynamically
     */
    updatePageMeta(options) {
        if (options.title) {
            document.title = options.title;
            this.setMetaTag('property', 'og:title', options.title);
            this.setMetaTag('name', 'twitter:title', options.title);
        }

        if (options.description) {
            this.setMetaTag('name', 'description', options.description);
            this.setMetaTag('property', 'og:description', options.description);
            this.setMetaTag('name', 'twitter:description', options.description);
        }

        if (options.image) {
            this.setMetaTag('property', 'og:image', options.image);
            this.setMetaTag('name', 'twitter:image', options.image);
        }

        if (options.url) {
            this.setMetaTag('property', 'og:url', options.url);
            this.addCanonicalUrl();
        }
    }

    /**
     * Observe content changes for SPA
     */
    observeContentChanges() {
        // For single-page applications, update SEO when route changes
        const observer = new MutationObserver(() => {
            this.updatePageMeta(this.getPageMeta());
        });

        observer.observe(document.querySelector('title'), {
            childList: true,
            characterData: true,
            subtree: true
        });
    }

    /**
     * Generate meta tags for blog post
     */
    generateBlogPostMeta(post) {
        this.updatePageMeta({
            title: `${post.title} - Sirsi Nexus Blog`,
            description: post.excerpt || post.content.substring(0, 160),
            image: post.featuredImage || this.defaultMeta.image,
            url: `https://sirsi.ai/blog/${post.slug}`
        });

        // Add article schema
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "author": {
                "@type": "Person",
                "name": post.author || "Sirsi Team"
            },
            "datePublished": post.publishedDate,
            "dateModified": post.modifiedDate || post.publishedDate,
            "image": post.featuredImage,
            "publisher": {
                "@type": "Organization",
                "name": "Sirsi Nexus",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://sirsi.ai/assets/images/logo.png"
                }
            }
        });
        document.head.appendChild(script);
    }

    /**
     * Preload critical resources
     */
    preloadResources() {
        // Preload fonts
        this.preloadResource('/assets/fonts/inter.woff2', 'font');
        
        // Preload critical CSS
        this.preloadResource('/assets/css/critical.css', 'style');
        
        // Preload hero image
        this.preloadResource('/assets/images/hero-bg.webp', 'image');
    }

    /**
     * Preload a resource
     */
    preloadResource(href, as) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        
        if (as === 'font') {
            link.crossOrigin = 'anonymous';
        }
        
        document.head.appendChild(link);
    }
}

// Create global instance
window.seoService = new SEOService();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.seoService.init();
    });
} else {
    window.seoService.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOService;
}
