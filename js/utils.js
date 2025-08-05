/**
 * KOR Website Utilities
 * Organized JavaScript utilities for better code maintainability
 */

'use strict';

/**
 * DOM Utilities
 */
const DOMUtils = {
  /**
   * Get element by ID
   * @param {string} id - Element ID
   * @returns {HTMLElement|null}
   */
  getElementById: id => document.getElementById(id),

  /**
   * Get elements by class name
   * @param {string} className - Class name
   * @returns {HTMLCollection}
   */
  getElementsByClassName: className =>
    document.getElementsByClassName(className),

  /**
   * Query selector
   * @param {string} selector - CSS selector
   * @returns {HTMLElement|null}
   */
  querySelector: selector => document.querySelector(selector),

  /**
   * Query selector all
   * @param {string} selector - CSS selector
   * @returns {NodeList}
   */
  querySelectorAll: selector => document.querySelectorAll(selector),

  /**
   * Add event listener with error handling
   * @param {HTMLElement} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  addEventListener: (element, event, handler, options = {}) => {
    if (!element || typeof handler !== 'function') {
      return;
    }

    try {
      element.addEventListener(event, handler, options);
    } catch (error) {
      console.error('Error adding event listener:', error);
    }
  },

  /**
   * Remove event listener
   * @param {HTMLElement} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   */
  removeEventListener: (element, event, handler) => {
    if (!element || typeof handler !== 'function') {
      return;
    }

    try {
      element.removeEventListener(event, handler);
    } catch (error) {
      console.error('Error removing event listener:', error);
    }
  },

  /**
   * Check if element is visible in viewport
   * @param {HTMLElement} element - Element to check
   * @returns {boolean}
   */
  isInViewport: element => {
    if (!element) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function}
   */
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function}
   */
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
};

/**
 * Form Validation Utilities
 */
const FormUtils = {
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean}
   */
  isValidEmail: email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number
   * @param {string} phone - Phone number to validate
   * @returns {boolean}
   */
  isValidPhone: phone => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  /**
   * Validate required field
   * @param {string} value - Value to validate
   * @returns {boolean}
   */
  isRequired: value => {
    return value && value.trim().length > 0;
  },

  /**
   * Validate minimum length
   * @param {string} value - Value to validate
   * @param {number} minLength - Minimum length
   * @returns {boolean}
   */
  hasMinLength: (value, minLength) => {
    return value && value.trim().length >= minLength;
  },

  /**
   * Validate maximum length
   * @param {string} value - Value to validate
   * @param {number} maxLength - Maximum length
   * @returns {boolean}
   */
  hasMaxLength: (value, maxLength) => {
    return !value || value.trim().length <= maxLength;
  },

  /**
   * Show form error
   * @param {HTMLElement} field - Form field
   * @param {string} message - Error message
   */
  showError: (field, message) => {
    if (!field) {
      return;
    }

    // Remove existing error states
    FormUtils.clearError(field);

    // Add error class
    field.classList.add('error');

    // Create or update error message
    let errorMsg = field.parentNode.querySelector('.error-message');
    if (!errorMsg) {
      errorMsg = document.createElement('div');
      errorMsg.className = 'error-message';
      field.parentNode.appendChild(errorMsg);
    }

    errorMsg.textContent = message;
    errorMsg.classList.add('show');
  },

  /**
   * Clear form error
   * @param {HTMLElement} field - Form field
   */
  clearError: field => {
    if (!field) {
      return;
    }

    field.classList.remove('error');
    field.classList.add('success');

    const errorMsg = field.parentNode.querySelector('.error-message');
    if (errorMsg) {
      errorMsg.classList.remove('show');
    }

    // Show success indicator
    let successIndicator = field.parentNode.querySelector('.success-indicator');
    if (!successIndicator) {
      successIndicator = document.createElement('span');
      successIndicator.className = 'success-indicator';
      successIndicator.innerHTML = '✓';
      field.parentNode.appendChild(successIndicator);
    }
    successIndicator.classList.add('show');
  },

  /**
   * Validate form field
   * @param {HTMLElement} field - Form field to validate
   * @param {Object} rules - Validation rules
   * @returns {boolean}
   */
  validateField: (field, rules = {}) => {
    if (!field) {
      return false;
    }

    const value = field.value;
    const fieldType = field.type;

    // Required validation
    if (rules.required && !FormUtils.isRequired(value)) {
      FormUtils.showError(field, 'This field is required');
      return false;
    }

    // Email validation
    if (fieldType === 'email' && value && !FormUtils.isValidEmail(value)) {
      FormUtils.showError(field, 'Please enter a valid email address');
      return false;
    }

    // Phone validation
    if (fieldType === 'tel' && value && !FormUtils.isValidPhone(value)) {
      FormUtils.showError(field, 'Please enter a valid phone number');
      return false;
    }

    // Length validations
    if (rules.minLength && !FormUtils.hasMinLength(value, rules.minLength)) {
      FormUtils.showError(
        field,
        `Minimum ${rules.minLength} characters required`
      );
      return false;
    }

    if (rules.maxLength && !FormUtils.hasMaxLength(value, rules.maxLength)) {
      FormUtils.showError(
        field,
        `Maximum ${rules.maxLength} characters allowed`
      );
      return false;
    }

    // If we get here, field is valid
    FormUtils.clearError(field);
    return true;
  }
};

/**
 * Animation Utilities
 */
const AnimationUtils = {
  /**
   * Fade in element
   * @param {HTMLElement} element - Element to fade in
   * @param {number} duration - Animation duration in ms
   */
  fadeIn: (element, duration = 300) => {
    if (!element) {
      return;
    }

    element.style.opacity = '0';
    element.style.display = 'block';

    const startTime = performance.now();

    const animate = currentTime => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      element.style.opacity = progress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  },

  /**
   * Fade out element
   * @param {HTMLElement} element - Element to fade out
   * @param {number} duration - Animation duration in ms
   */
  fadeOut: (element, duration = 300) => {
    if (!element) {
      return;
    }

    const startTime = performance.now();
    const startOpacity = parseFloat(getComputedStyle(element).opacity);

    const animate = currentTime => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      element.style.opacity = startOpacity * (1 - progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
      }
    };

    requestAnimationFrame(animate);
  },

  /**
   * Slide down element
   * @param {HTMLElement} element - Element to slide down
   * @param {number} duration - Animation duration in ms
   */
  slideDown: (element, duration = 300) => {
    if (!element) {
      return;
    }

    element.style.height = '0';
    element.style.overflow = 'hidden';
    element.style.display = 'block';

    const targetHeight = element.scrollHeight;
    const startTime = performance.now();

    const animate = currentTime => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      element.style.height = targetHeight * progress + 'px';

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.height = '';
        element.style.overflow = '';
      }
    };

    requestAnimationFrame(animate);
  },

  /**
   * Slide up element
   * @param {HTMLElement} element - Element to slide up
   * @param {number} duration - Animation duration in ms
   */
  slideUp: (element, duration = 300) => {
    if (!element) {
      return;
    }

    const startHeight = element.offsetHeight;
    const startTime = performance.now();

    element.style.overflow = 'hidden';

    const animate = currentTime => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      element.style.height = startHeight * (1 - progress) + 'px';

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
        element.style.height = '';
        element.style.overflow = '';
      }
    };

    requestAnimationFrame(animate);
  }
};

/**
 * Storage Utilities
 */
const StorageUtils = {
  /**
   * Set localStorage item
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   */
  setLocal: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  },

  /**
   * Get localStorage item
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*}
   */
  getLocal: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error getting localStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Remove localStorage item
   * @param {string} key - Storage key
   */
  removeLocal: key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing localStorage:', error);
    }
  },

  /**
   * Set sessionStorage item
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   */
  setSession: (key, value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting sessionStorage:', error);
    }
  },

  /**
   * Get sessionStorage item
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*}
   */
  getSession: (key, defaultValue = null) => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error getting sessionStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Remove sessionStorage item
   * @param {string} key - Storage key
   */
  removeSession: key => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing sessionStorage:', error);
    }
  }
};

/**
 * Network Utilities
 */
const NetworkUtils = {
  /**
   * Make HTTP request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise}
   */
  request: async(url, options = {}) => {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const requestOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('Network request failed:', error);
      throw error;
    }
  },

  /**
   * GET request
   * @param {string} url - Request URL
   * @param {Object} headers - Request headers
   * @returns {Promise}
   */
  get: (url, headers = {}) => {
    return NetworkUtils.request(url, { method: 'GET', headers });
  },

  /**
   * POST request
   * @param {string} url - Request URL
   * @param {*} data - Request data
   * @param {Object} headers - Request headers
   * @returns {Promise}
   */
  post: (url, data, headers = {}) => {
    return NetworkUtils.request(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
  }
};

/**
 * Device Detection Utilities
 */
const DeviceUtils = {
  /**
   * Check if device is mobile
   * @returns {boolean}
   */
  isMobile: () => {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  /**
   * Check if device is tablet
   * @returns {boolean}
   */
  isTablet: () => {
    return (
      /iPad|Android/i.test(navigator.userAgent) &&
      window.innerWidth >= 768 &&
      window.innerWidth <= 1024
    );
  },

  /**
   * Check if device is desktop
   * @returns {boolean}
   */
  isDesktop: () => {
    return !DeviceUtils.isMobile() && !DeviceUtils.isTablet();
  },

  /**
   * Get screen size category
   * @returns {string}
   */
  getScreenSize: () => {
    const width = window.innerWidth;

    if (width <= 480) {
      return 'mobile-small';
    }
    if (width <= 768) {
      return 'mobile-large';
    }
    if (width <= 1024) {
      return 'tablet';
    }
    if (width <= 1280) {
      return 'desktop-small';
    }
    return 'desktop-large';
  },

  /**
   * Check if user prefers reduced motion
   * @returns {boolean}
   */
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Check if user prefers dark mode
   * @returns {boolean}
   */
  prefersDarkMode: () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
};

/**
 * Export utilities for global use
 */
window.KORUtils = {
  DOM: DOMUtils,
  Form: FormUtils,
  Animation: AnimationUtils,
  Storage: StorageUtils,
  Network: NetworkUtils,
  Device: DeviceUtils
};

// Also export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.KORUtils;
}
