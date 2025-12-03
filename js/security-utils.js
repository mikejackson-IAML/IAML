// Security Utilities Module
// Provides sanitization and security helper functions
// Used across the application to prevent XSS and injection attacks

(function() {
  'use strict';

  /**
   * HTML Entity Escaping
   * Converts dangerous characters to HTML entities
   * Use this before inserting user input into HTML
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';

    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  /**
   * More comprehensive HTML escaping for attributes
   * Includes additional characters that can break out of attributes
   */
  function escapeHtmlAttribute(str) {
    if (str === null || str === undefined) return '';

    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize text content only (no HTML)
   * Strips all HTML tags and returns plain text
   */
  function sanitizeText(str) {
    if (str === null || str === undefined) return '';

    const div = document.createElement('div');
    div.innerHTML = String(str);
    return div.textContent || div.innerText || '';
  }

  /**
   * Create a text node safely
   * Use this instead of innerHTML when you only need text
   */
  function createTextNode(text) {
    return document.createTextNode(String(text || ''));
  }

  /**
   * Safely set element content as text only
   * Prevents any HTML interpretation
   */
  function setTextContent(element, text) {
    if (!element) return;
    element.textContent = String(text || '');
  }

  /**
   * Create an element with safe text content
   * @param {string} tagName - HTML tag name (e.g., 'div', 'span')
   * @param {string} text - Text content
   * @param {string} className - Optional CSS class
   */
  function createElementWithText(tagName, text, className) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = String(text || '');
    return element;
  }

  /**
   * Validate email format
   * Basic email validation
   */
  function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate phone number
   * Checks for valid US phone number format
   */
  function isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;

    // Remove formatting characters
    const digits = phone.replace(/\D/g, '');

    // Check if it's 10 digits (US format)
    return digits.length === 10;
  }

  /**
   * Sanitize phone number input
   * Removes all non-numeric characters except formatting
   */
  function sanitizePhone(phone) {
    if (!phone || typeof phone !== 'string') return '';

    // Remove everything except digits, spaces, dashes, parentheses
    return phone.replace(/[^\d\s\-()]/g, '');
  }

  /**
   * Format phone number consistently
   * Converts to (XXX) XXX-XXXX format
   */
  function formatPhone(phone) {
    if (!phone) return '';

    const digits = phone.replace(/\D/g, '');

    if (digits.length !== 10) return phone;

    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  /**
   * Sanitize URL to prevent javascript: protocol
   * Only allows http:, https:, and mailto: protocols
   */
  function sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '#';

    const trimmed = url.trim().toLowerCase();

    // Prevent javascript: and data: URLs
    if (trimmed.startsWith('javascript:') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('vbscript:')) {
      return '#';
    }

    // Allow relative URLs, http, https, mailto
    if (trimmed.startsWith('/') ||
        trimmed.startsWith('./') ||
        trimmed.startsWith('../') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('mailto:') ||
        trimmed.startsWith('#')) {
      return url;
    }

    return '#';
  }

  /**
   * Debounce function to prevent rapid repeated calls
   * Useful for rate limiting form submissions
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function to limit execution rate
   * Ensures function is called at most once per time period
   */
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Simple rate limiter for form submissions
   * Prevents submission if called too frequently
   */
  const rateLimiter = (function() {
    const submissions = {};

    return {
      canSubmit: function(formId, limitMs = 3000) {
        const now = Date.now();
        const lastSubmit = submissions[formId] || 0;

        if (now - lastSubmit < limitMs) {
          return false;
        }

        submissions[formId] = now;
        return true;
      },

      reset: function(formId) {
        delete submissions[formId];
      }
    };
  })();

  /**
   * Validate input length
   * Prevents excessively long inputs
   */
  function validateLength(str, min = 0, max = 1000) {
    if (!str || typeof str !== 'string') return false;
    return str.length >= min && str.length <= max;
  }

  /**
   * Strip dangerous characters from input
   * Removes control characters and null bytes
   */
  function stripDangerousChars(str) {
    if (!str || typeof str !== 'string') return '';

    // Remove null bytes, control characters (except newline, tab, carriage return)
    return str.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  }

  /**
   * Create a safe DOM structure from template
   * Alternative to innerHTML that's safer
   */
  function createSafeElement(config) {
    const element = document.createElement(config.tag || 'div');

    // Set safe attributes
    if (config.className) element.className = config.className;
    if (config.id) element.id = config.id;
    if (config.text) element.textContent = config.text;

    // Set safe attributes
    if (config.attributes) {
      Object.keys(config.attributes).forEach(key => {
        if (key === 'href') {
          element.setAttribute(key, sanitizeUrl(config.attributes[key]));
        } else {
          element.setAttribute(key, escapeHtmlAttribute(config.attributes[key]));
        }
      });
    }

    // Append children
    if (config.children) {
      config.children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(createTextNode(child));
        } else if (child instanceof Node) {
          element.appendChild(child);
        }
      });
    }

    return element;
  }

  // Export to global scope
  window.SecurityUtils = {
    escapeHtml,
    escapeHtmlAttribute,
    sanitizeText,
    createTextNode,
    setTextContent,
    createElementWithText,
    isValidEmail,
    isValidPhone,
    sanitizePhone,
    formatPhone,
    sanitizeUrl,
    debounce,
    throttle,
    rateLimiter,
    validateLength,
    stripDangerousChars,
    createSafeElement
  };

  // Make available for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.SecurityUtils;
  }

})();
