/**
 * KOR Website UX Enhancements
 * Advanced user experience improvements with micro-animations and interactions
 */

'use strict';

/**
 * Initialize UX enhancements when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  initializeUXEnhancements();
});

/**
 * Main UX initialization function
 */
function initializeUXEnhancements() {
  // Initialize all UX modules
  ScrollAnimations.init();
  ButtonEnhancements.init();
  FormEnhancements.init();
  NavigationEnhancements.init();
  ImageEnhancements.init();
  TooltipSystem.init();
  NotificationSystem.init();
  ProgressIndicators.init();
  
  console.log('✨ UX Enhancements initialized');
}

/**
 * Scroll-based animations and interactions
 */
const ScrollAnimations = {
  init() {
    this.setupIntersectionObserver();
    this.setupScrollProgress();
    this.setupParallaxEffects();
    this.setupScrollToTop();
  },

  setupIntersectionObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Add staggered animations for child elements
          const children = entry.target.querySelectorAll('.stagger-child');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('animate-in');
            }, index * 100);
          });
        }
      });
    }, options);

    // Observe elements for animation
    document.querySelectorAll('.fade-in-up, .slide-in, .benefit-point, .point-card').forEach(el => {
      observer.observe(el);
    });
  },

  setupScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;

    const updateProgress = KORUtils.DOM.throttle(() => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
    }, 10);

    window.addEventListener('scroll', updateProgress);
  },

  setupParallaxEffects() {
    if (KORUtils.Device.prefersReducedMotion()) return;

    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    const updateParallax = KORUtils.DOM.throttle(() => {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const rate = scrolled * -0.5;
        element.style.transform = `translateY(${rate}px)`;
      });
    }, 16);

    window.addEventListener('scroll', updateParallax);
  },

  setupScrollToTop() {
    // Create scroll to top button
    const scrollButton = document.createElement('button');
    scrollButton.className = 'scroll-to-top';
    scrollButton.innerHTML = '↑';
    scrollButton.setAttribute('aria-label', 'Scroll to top');
    scrollButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      border: none;
      cursor: pointer;
      z-index: 1000;
      opacity: 0;
      transform: scale(0);
      transition: all 0.3s ease;
      font-size: 18px;
      font-weight: bold;
    `;
    
    document.body.appendChild(scrollButton);

    // Show/hide button based on scroll position
    const toggleScrollButton = KORUtils.DOM.throttle(() => {
      if (window.pageYOffset > 300) {
        scrollButton.style.opacity = '1';
        scrollButton.style.transform = 'scale(1)';
      } else {
        scrollButton.style.opacity = '0';
        scrollButton.style.transform = 'scale(0)';
      }
    }, 100);

    window.addEventListener('scroll', toggleScrollButton);

    // Smooth scroll to top
    scrollButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
};

/**
 * Enhanced button interactions
 */
const ButtonEnhancements = {
  init() {
    this.enhanceButtons();
    this.addRippleEffect();
    this.addHoverSounds();
  },

  enhanceButtons() {
    const buttons = document.querySelectorAll('button, .btn, .link, .mobile-link, .point-link');
    
    buttons.forEach(button => {
      // Add loading state capability
      button.addEventListener('click', (e) => {
        if (button.classList.contains('async-action')) {
          this.showLoadingState(button);
        }
      });

      // Enhanced hover effects
      button.addEventListener('mouseenter', () => {
        if (!KORUtils.Device.prefersReducedMotion()) {
          button.style.transform = 'translateY(-2px)';
        }
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = '';
      });

      // Add focus ring animation
      button.addEventListener('focus', () => {
        button.classList.add('focus-ring-animate');
      });

      button.addEventListener('blur', () => {
        button.classList.remove('focus-ring-animate');
      });
    });
  },

  addRippleEffect() {
    if (KORUtils.Device.prefersReducedMotion()) return;

    const buttons = document.querySelectorAll('.btn, .submit-button, .store-button-link');
    
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });

    // Add ripple animation keyframes
    if (!document.querySelector('#ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  },

  showLoadingState(button) {
    const originalText = button.textContent;
    button.classList.add('btn-loading');
    button.disabled = true;
    
    // Simulate async operation
    setTimeout(() => {
      button.classList.remove('btn-loading');
      button.disabled = false;
      button.textContent = originalText;
    }, 2000);
  },

  addHoverSounds() {
    // Add subtle audio feedback (optional)
    const playHoverSound = () => {
      if (window.AudioContext) {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      }
    };

    // Only add to primary action buttons
    document.querySelectorAll('.submit-button, .store-button-link').forEach(button => {
      button.addEventListener('mouseenter', playHoverSound);
    });
  }
};

/**
 * Enhanced form interactions
 */
const FormEnhancements = {
  init() {
    this.enhanceInputs();
    this.addRealTimeValidation();
    this.addFormProgress();
  },

  enhanceInputs() {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      // Floating label effect
      this.addFloatingLabel(input);
      
      // Input focus animations
      input.addEventListener('focus', () => {
        input.parentNode.classList.add('input-focused');
      });
      
      input.addEventListener('blur', () => {
        input.parentNode.classList.remove('input-focused');
        if (input.value) {
          input.parentNode.classList.add('input-filled');
        } else {
          input.parentNode.classList.remove('input-filled');
        }
      });

      // Character counter for textareas
      if (input.tagName === 'TEXTAREA') {
        this.addCharacterCounter(input);
      }
    });
  },

  addFloatingLabel(input) {
    const label = input.parentNode.querySelector('label');
    if (!label) return;

    if (input.value) {
      label.classList.add('float');
    }

    input.addEventListener('focus', () => {
      label.classList.add('float');
    });

    input.addEventListener('blur', () => {
      if (!input.value) {
        label.classList.remove('float');
      }
    });
  },

  addRealTimeValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea');
      
      inputs.forEach(input => {
        input.addEventListener('input', KORUtils.DOM.debounce(() => {
          this.validateField(input);
        }, 300));
        
        input.addEventListener('blur', () => {
          this.validateField(input);
        });
      });
    });
  },

  validateField(field) {
    const rules = {
      required: field.hasAttribute('required'),
      minLength: field.getAttribute('minlength'),
      maxLength: field.getAttribute('maxlength')
    };

    return KORUtils.Form.validateField(field, rules);
  },

  addCharacterCounter(textarea) {
    const maxLength = textarea.getAttribute('maxlength');
    if (!maxLength) return;

    const counter = document.createElement('div');
    counter.className = 'char-counter';
    counter.textContent = `0 / ${maxLength}`;
    
    textarea.parentNode.appendChild(counter);

    textarea.addEventListener('input', () => {
      const current = textarea.value.length;
      counter.textContent = `${current} / ${maxLength}`;
      
      counter.classList.remove('warning', 'danger');
      if (current > maxLength * 0.8) {
        counter.classList.add('warning');
      }
      if (current > maxLength * 0.95) {
        counter.classList.add('danger');
      }
    });
  },

  addFormProgress() {
    const forms = document.querySelectorAll('form[data-progress]');
    
    forms.forEach(form => {
      const progressBar = document.createElement('div');
      progressBar.className = 'form-progress';
      progressBar.innerHTML = '<div class="form-progress-bar"></div>';
      
      form.insertBefore(progressBar, form.firstChild);
      
      const updateProgress = () => {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        const completed = Array.from(inputs).filter(input => input.value.trim()).length;
        const progress = (completed / inputs.length) * 100;
        
        progressBar.querySelector('.form-progress-bar').style.width = `${progress}%`;
      };
      
      form.addEventListener('input', KORUtils.DOM.debounce(updateProgress, 200));
    });
  }
};

/**
 * Navigation enhancements
 */
const NavigationEnhancements = {
  init() {
    this.enhanceMobileMenu();
    this.addBreadcrumbs();
    this.highlightActiveSection();
  },

  enhanceMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.mobile-nav');
    
    if (!toggle || !menu) return;

    // Animate hamburger icon
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      
      // Add smooth slide animation to menu
      if (menu.classList.contains('active')) {
        KORUtils.Animation.slideDown(menu, 300);
      } else {
        KORUtils.Animation.slideUp(menu, 300);
      }
    });

    // Close menu when clicking on links
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('active');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  },

  addBreadcrumbs() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(segment => segment);
    
    if (segments.length <= 1) return;

    const breadcrumb = document.createElement('nav');
    breadcrumb.className = 'breadcrumb';
    breadcrumb.setAttribute('aria-label', 'Breadcrumb');
    
    let breadcrumbHTML = '<a href="/">Home</a>';
    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += '/' + segment;
      const isLast = index === segments.length - 1;
      const displayName = segment.replace(/-/g, ' ').replace('.html', '');
      
      if (isLast) {
        breadcrumbHTML += ` > <span aria-current="page">${displayName}</span>`;
      } else {
        breadcrumbHTML += ` > <a href="${currentPath}">${displayName}</a>`;
      }
    });
    
    breadcrumb.innerHTML = breadcrumbHTML;
    
    const main = document.querySelector('main');
    if (main) {
      main.insertBefore(breadcrumb, main.firstChild);
    }
  },

  highlightActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    if (sections.length === 0 || navLinks.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${entry.target.id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));
  }
};

/**
 * Image enhancements
 */
const ImageEnhancements = {
  init() {
    this.addLazyLoading();
    this.addImageZoom();
    this.addImagePlaceholders();
  },

  addLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('lazy-loaded');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  },

  addImageZoom() {
    const zoomableImages = document.querySelectorAll('.our_app_example, .app_logo');
    
    zoomableImages.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        this.createImageModal(img);
      });
    });
  },

  createImageModal(img) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      cursor: zoom-out;
    `;
    
    const modalImg = document.createElement('img');
    modalImg.src = img.src;
    modalImg.alt = img.alt;
    modalImg.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      animation: zoomIn 0.3s ease;
    `;
    
    modal.appendChild(modalImg);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close modal
    modal.addEventListener('click', () => {
      document.body.removeChild(modal);
      document.body.style.overflow = '';
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
        document.removeEventListener('keydown', escapeHandler);
      }
    });

    // Add zoom animation
    if (!document.querySelector('#zoom-styles')) {
      const style = document.createElement('style');
      style.id = 'zoom-styles';
      style.textContent = `
        @keyframes zoomIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  },

  addImagePlaceholders() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
      
      img.addEventListener('error', () => {
        img.classList.add('error');
        img.alt = 'Image failed to load';
      });
    });
  }
};

/**
 * Tooltip system
 */
const TooltipSystem = {
  init() {
    this.createTooltips();
  },

  createTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
      element.addEventListener('mouseenter', (e) => {
        this.showTooltip(e.target);
      });
      
      element.addEventListener('mouseleave', (e) => {
        this.hideTooltip(e.target);
      });
    });
  },

  showTooltip(element) {
    const tooltipText = element.getAttribute('data-tooltip');
    if (!tooltipText) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-popup';
    tooltip.textContent = tooltipText;
    tooltip.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      white-space: nowrap;
      z-index: 10000;
      pointer-events: none;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
    
    // Animate in
    requestAnimationFrame(() => {
      tooltip.style.opacity = '1';
      tooltip.style.transform = 'translateY(0)';
    });
    
    element._tooltip = tooltip;
  },

  hideTooltip(element) {
    if (element._tooltip) {
      element._tooltip.remove();
      element._tooltip = null;
    }
  }
};

/**
 * Notification system
 */
const NotificationSystem = {
  init() {
    this.createContainer();
  },

  createContainer() {
    if (document.querySelector('.notification-container')) return;

    const container = document.createElement('div');
    container.className = 'notification-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
    `;
    
    document.body.appendChild(container);
  },

  show(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      background: var(--${type === 'success' ? 'success' : type === 'error' ? 'error' : 'info'}-color);
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateX(100%);
      transition: all 0.3s ease;
      cursor: pointer;
    `;
    
    notification.textContent = message;
    
    const container = document.querySelector('.notification-container');
    container.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });
    
    // Auto remove
    setTimeout(() => {
      this.remove(notification);
    }, duration);
    
    // Click to remove
    notification.addEventListener('click', () => {
      this.remove(notification);
    });
  },

  remove(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
};

/**
 * Progress indicators
 */
const ProgressIndicators = {
  init() {
    this.setupPageLoadProgress();
    this.setupAsyncActionProgress();
  },

  setupPageLoadProgress() {
    // Show loading progress for large pages
    window.addEventListener('load', () => {
      const loader = document.querySelector('.page-loader');
      if (loader) {
        KORUtils.Animation.fadeOut(loader, 500);
      }
    });
  },

  setupAsyncActionProgress() {
    // Add progress indicators to forms
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        const submitButton = form.querySelector('[type="submit"]');
        if (submitButton && !submitButton.classList.contains('no-progress')) {
          this.showButtonProgress(submitButton);
        }
      });
    });
  },

  showButtonProgress(button) {
    const originalText = button.textContent;
    button.classList.add('btn-loading');
    button.disabled = true;
    
    // Add spinner
    const spinner = document.createElement('span');
    spinner.className = 'btn-spinner';
    button.appendChild(spinner);
    
    // This would be removed when the actual form submission completes
    setTimeout(() => {
      button.classList.remove('btn-loading');
      button.disabled = false;
      button.textContent = originalText;
      if (spinner.parentNode) {
        spinner.parentNode.removeChild(spinner);
      }
    }, 2000);
  }
};

// Export for global use
window.UXEnhancements = {
  ScrollAnimations,
  ButtonEnhancements,
  FormEnhancements,
  NavigationEnhancements,
  ImageEnhancements,
  TooltipSystem,
  NotificationSystem,
  ProgressIndicators
};
