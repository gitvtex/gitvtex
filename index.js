/**
 * VORTEX Gaming Server - JavaScript Enhancements
 * Optimized for performance and user experience
 */

// ==========================================================================
// Utility Functions
// ==========================================================================

/**
 * Debounce function to limit how often a function can fire
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (func, wait = 100) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// ==========================================================================
// Smooth Scroll Enhancement
// ==========================================================================

/**
 * Initialize smooth scrolling for anchor links
 */
const initSmoothScroll = () => {
  // Only add if not using reduced motion
  if (prefersReducedMotion()) return;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Skip if it's just "#"
      if (href === '#') return;
      
      const targetElement = document.querySelector(href);
      
      if (targetElement) {
        e.preventDefault();
        
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update URL without jumping
        history.pushState(null, null, href);
        
        // Set focus for accessibility
        targetElement.focus({ preventScroll: true });
      }
    });
  });
};

// ==========================================================================
// Video Background Optimization
// ==========================================================================

/**
 * Optimize video playback based on device and connection
 */
const optimizeVideoBackground = () => {
  const video = document.querySelector('.video-background');
  if (!video) return;

  // Pause video if user prefers reduced motion
  if (prefersReducedMotion()) {
    video.pause();
    video.style.display = 'none';
    return;
  }

  // Pause video when page is not visible (performance optimization)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      video.pause();
    } else {
      video.play().catch(() => {
        // Video play failed, likely due to autoplay policy
        console.log('Video autoplay prevented');
      });
    }
  });

  // Handle slow connections - pause video on slow networks
  if ('connection' in navigator) {
    const connection = navigator.connection;
    
    const checkConnection = () => {
      if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        video.pause();
        video.style.display = 'none';
        console.log('Video paused due to slow connection');
      }
    };
    
    checkConnection();
    connection.addEventListener('change', checkConnection);
  }
};

// ==========================================================================
// Intersection Observer for Animations
// ==========================================================================

/**
 * Animate elements when they come into view
 */
const initScrollAnimations = () => {
  if (prefersReducedMotion()) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        // Optional: stop observing after animation
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe feature items
  const featureItems = document.querySelectorAll('.feature-item');
  featureItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(item);
  });

  // Add CSS for animation
  const style = document.createElement('style');
  style.textContent = `
    .animate-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
};

// ==========================================================================
// Keyboard Navigation Enhancement
// ==========================================================================

/**
 * Enhance keyboard navigation and accessibility
 */
const enhanceKeyboardNav = () => {
  // Add visible focus styles for keyboard users only
  let isUsingMouse = false;

  document.addEventListener('mousedown', () => {
    isUsingMouse = true;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      isUsingMouse = false;
    }
  });

  // Add/remove class based on input method
  document.addEventListener('focusin', () => {
    if (!isUsingMouse) {
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('focusout', () => {
    document.body.classList.remove('keyboard-nav');
  });

  // Add CSS for keyboard navigation
  const style = document.createElement('style');
  style.textContent = `
    body:not(.keyboard-nav) *:focus {
      outline: none;
    }
    
    .keyboard-nav *:focus {
      outline: 2px solid var(--color-primary, #ff8400);
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
};

// ==========================================================================
// External Link Security
// ==========================================================================

/**
 * Add security attributes to external links
 */
const secureExternalLinks = () => {
  const links = document.querySelectorAll('a[target="_blank"]');
  
  links.forEach(link => {
    // Add security attributes if not already present
    if (!link.getAttribute('rel')?.includes('noopener')) {
      const currentRel = link.getAttribute('rel') || '';
      link.setAttribute('rel', `${currentRel} noopener noreferrer`.trim());
    }
  });
};

// ==========================================================================
// Performance Monitoring (Optional)
// ==========================================================================

/**
 * Log Core Web Vitals for performance monitoring
 */
const logWebVitals = () => {
  if ('PerformanceObserver' in window) {
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
            console.log('CLS:', clsScore);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.log('Performance monitoring not available');
    }
  }
};

// ==========================================================================
// Lazy Loading Images
// ==========================================================================

/**
 * Implement native lazy loading fallback
 */
const initLazyLoading = () => {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  // Check if browser supports native lazy loading
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading is supported, nothing to do
    return;
  }
  
  // Fallback for browsers that don't support native lazy loading
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
};

// ==========================================================================
// Error Handling
// ==========================================================================

/**
 * Global error handler for better debugging
 */
const initErrorHandling = () => {
  window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
  });
};

// ==========================================================================
// Initialize All Features
// ==========================================================================

/**
 * Main initialization function
 */
const init = () => {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    return;
  }

  console.log('🌪️ VORTEX Gaming Server - Initializing...');

  // Initialize all features
  initSmoothScroll();
  optimizeVideoBackground();
  initScrollAnimations();
  enhanceKeyboardNav();
  secureExternalLinks();
  initLazyLoading();
  initErrorHandling();
  
  // Optional: Enable performance monitoring in development
  // Uncomment the line below to enable Web Vitals logging
  // logWebVitals();

  console.log('✅ VORTEX Gaming Server - Ready!');
};

// Start initialization
init();

// ==========================================================================
// Export functions for testing (optional)
// ==========================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debounce,
    prefersReducedMotion,
    initSmoothScroll,
    optimizeVideoBackground
  };
}