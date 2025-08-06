/**
 * Performance Optimization JavaScript
 * Handles lazy loading, WebP support, resource optimization, and caching
 */

// Performance Analytics
const performanceMetrics = {
    startTime: performance.now(),
    resources: [],
    interactions: [],
    
    // Track Core Web Vitals
    trackCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
            this.logMetric('LCP', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log('FID:', entry.processingStart - entry.startTime);
                this.logMetric('FID', entry.processingStart - entry.startTime);
            });
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            console.log('CLS:', clsValue);
            this.logMetric('CLS', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    },

    logMetric(name, value) {
        // In production, send to analytics service
        console.log(`Performance Metric - ${name}: ${value}`);
    }
};

// WebP Support Detection
const imageOptimization = {
    supportsWebP: false,
    
    async checkWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                this.supportsWebP = webP.height === 2;
                if (this.supportsWebP) {
                    document.documentElement.classList.add('webp');
                }
                resolve(this.supportsWebP);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    },

    getOptimizedImageSrc(originalSrc, size = null) {
        if (!originalSrc) return '';
        
        // For production, implement CDN logic here
        let optimizedSrc = originalSrc;
        
        // Add WebP support if available
        if (this.supportsWebP && !originalSrc.endsWith('.svg')) {
            optimizedSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        }
        
        // Add size parameters for responsive images
        if (size) {
            const separator = optimizedSrc.includes('?') ? '&' : '?';
            optimizedSrc += `${separator}w=${size}`;
        }
        
        return optimizedSrc;
    }
};

// Lazy Loading Implementation
const lazyLoading = {
    imageObserver: null,
    
    init() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver(this.onImageIntersection.bind(this), {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            this.observeImages();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
    },
    
    observeImages() {
        const images = document.querySelectorAll('img[data-src], .lazy-image');
        images.forEach(img => this.imageObserver.observe(img));
    },
    
    onImageIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.imageObserver.unobserve(entry.target);
            }
        });
    },
    
    loadImage(img) {
        // Show loading placeholder
        img.classList.add('loading');
        
        const originalSrc = img.dataset.src || img.src;
        const optimizedSrc = imageOptimization.getOptimizedImageSrc(originalSrc);
        
        // Preload the image
        const imageLoader = new Image();
        imageLoader.onload = () => {
            img.src = optimizedSrc;
            img.classList.remove('loading', 'lazy-image');
            img.classList.add('loaded');
            
            // Remove data-src attribute
            if (img.dataset.src) {
                delete img.dataset.src;
            }
        };
        
        imageLoader.onerror = () => {
            // Fallback to original source
            img.src = originalSrc;
            img.classList.remove('loading', 'lazy-image');
            img.classList.add('error');
        };
        
        imageLoader.src = optimizedSrc;
    },
    
    loadAllImages() {
        const images = document.querySelectorAll('img[data-src], .lazy-image');
        images.forEach(img => this.loadImage(img));
    }
};

// Resource Prioritization
const resourcePrioritization = {
    criticalResources: [
        'styles/styles.css',
        'images/KOR_app_Logo.png',
        'images/wilson_background-min.JPG'
    ],
    
    preloadCriticalResources() {
        this.criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            
            if (resource.endsWith('.css')) {
                link.as = 'style';
            } else if (resource.match(/\.(jpg|jpeg|png|webp)$/i)) {
                link.as = 'image';
            } else if (resource.endsWith('.js')) {
                link.as = 'script';
            }
            
            link.href = resource;
            document.head.appendChild(link);
        });
    },
    
    prefetchNextPageResources() {
        // Prefetch resources for likely next pages
        const nextPageResources = [
            'our_app.html',
            'our_story.html',
            'contact_us.html'
        ];
        
        nextPageResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = resource;
            document.head.appendChild(link);
        });
    }
};

// Font Loading Optimization
const fontOptimization = {
    init() {
        // Use font-display: swap in CSS for better loading performance
        this.preloadFonts();
    },
    
    preloadFonts() {
        const fonts = [
            'https://fonts.googleapis.com/css2?family=League+Gothic&display=swap',
            'https://fonts.googleapis.com/css?family=Lato&display=swap'
        ];
        
        fonts.forEach(fontUrl => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = fontUrl;
            document.head.appendChild(link);
        });
    }
};

// Scroll Performance Optimization
const scrollOptimization = {
    ticking: false,
    
    init() {
        window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
    },
    
    onScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateScrollProgress();
                this.handleScrollEffects();
                this.ticking = false;
            });
            this.ticking = true;
        }
    },
    
    updateScrollProgress() {
        const scrolled = window.pageYOffset;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const progress = (scrolled / maxScroll) * 100;
        
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    },
    
    handleScrollEffects() {
        // Optimize parallax effects
        const parallaxElements = document.querySelectorAll('.parallax_home, .parallax2_home, .parallax_sign_up, .parallax2_sign_up, .parallax_our_story, .parallax2_our_story');
        const scrollTop = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
                const speed = 0.5;
                const yPos = -(scrollTop * speed);
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
            }
        });
    }
};

// Service Worker Registration for Caching
const serviceWorkerCache = {
    async register() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('ServiceWorker registered:', registration);
            } catch (error) {
                console.log('ServiceWorker registration failed:', error);
            }
        }
    }
};

// Image Compression Utility
const imageCompression = {
    compressImage(file, maxWidth = 1920, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
};

// Main Performance Initialization
const performanceInit = {
    async init() {
        // Start performance tracking
        performanceMetrics.trackCoreWebVitals();
        
        // Initialize WebP support
        await imageOptimization.checkWebPSupport();
        
        // Initialize lazy loading
        lazyLoading.init();
        
        // Preload critical resources
        resourcePrioritization.preloadCriticalResources();
        
        // Initialize font optimization
        fontOptimization.init();
        
        // Initialize scroll optimization
        scrollOptimization.init();
        
        // Register service worker
        serviceWorkerCache.register();
        
        // Prefetch next page resources after initial load
        setTimeout(() => {
            resourcePrioritization.prefetchNextPageResources();
        }, 2000);
        
        console.log('Performance optimizations initialized');
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', performanceInit.init);
} else {
    performanceInit.init();
}

// Export for module usage
window.PerformanceOptimization = {
    performanceMetrics,
    imageOptimization,
    lazyLoading,
    resourcePrioritization,
    fontOptimization,
    scrollOptimization,
    serviceWorkerCache,
    imageCompression
};
