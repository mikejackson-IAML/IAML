// Support Continuum - Scroll-synced vertical timeline
// Handles active state management, progress line animation, and panel detection

/**
 * SupportContinuum Class
 * Manages the interactive timeline navigation and scroll-based panel activation
 */
class SupportContinuum {
  constructor() {
    // DOM elements
    this.section = document.getElementById('support-continuum');
    this.timelineNav = document.querySelector('.support-timeline-nav');
    this.timelineItems = document.querySelectorAll('.timeline-item');
    this.progressLine = document.querySelector('.timeline-progress');
    this.panels = document.querySelectorAll('.support-panel');

    // State
    this.activePhase = 1;
    this.isScrollingFromClick = false;
    this.scrollTimeout = null;

    // Check if elements exist
    if (!this.section || !this.timelineNav) {
      console.warn('[SupportContinuum] Required elements not found');
      return;
    }

    // Debug: Log initialization
    console.log('[SupportContinuum] Initializing...', {
      section: !!this.section,
      timelineNav: !!this.timelineNav,
      timelineItems: this.timelineItems.length,
      panels: this.panels.length
    });

    // Initialize
    this.init();
  }

  /**
   * Initialize the component
   */
  init() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Show all content immediately
      this.timelineItems.forEach(item => {
        const subtitle = item.querySelector('.timeline-subtitle');
        if (subtitle) {
          subtitle.style.maxHeight = 'none';
          subtitle.style.opacity = '1';
        }
      });
      this.panels.forEach(panel => {
        panel.style.opacity = '1';
        panel.style.transform = 'scale(1)';
      });
      return;
    }

    // Set up event listeners
    this.setupClickHandlers();
    this.setupScrollObserver();
    this.setupKeyboardNavigation();

    // Initialize first phase
    console.log('[SupportContinuum] Setup complete, activating phase 1');
    this.updateActivePhase(1, false);
  }

  /**
   * Set up click handlers for timeline items
   */
  setupClickHandlers() {
    this.timelineItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const phase = parseInt(item.getAttribute('data-phase'));
        this.handleTimelineClick(phase);
      });
    });
  }

  /**
   * Handle timeline item click - scroll to corresponding panel
   */
  handleTimelineClick(phase) {
    this.isScrollingFromClick = true;

    const targetPanel = document.querySelector(`.support-panel[data-phase="${phase}"]`);
    if (!targetPanel) return;

    // Calculate scroll position (centered in viewport)
    const panelRect = targetPanel.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetPosition = scrollTop + panelRect.top - (window.innerHeight / 2) + (panelRect.height / 2);

    // Smooth scroll to panel
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    // Update active state
    this.updateActivePhase(phase, true);

    // Reset click flag after animation completes
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isScrollingFromClick = false;
    }, 1000);
  }

  /**
   * Set up IntersectionObserver for panels
   */
  setupScrollObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px', // Trigger when panel is centered
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      // Only process if not scrolling from click
      if (this.isScrollingFromClick) return;

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const phase = parseInt(entry.target.getAttribute('data-phase'));
          console.log('[SupportContinuum] Panel', phase, 'intersecting');
          this.updateActivePhase(phase, true);
        }
      });
    }, observerOptions);

    // Observe all panels
    console.log('[SupportContinuum] Observing', this.panels.length, 'panels with options:', observerOptions);
    this.panels.forEach(panel => observer.observe(panel));

    // Also track scroll for progress line
    window.addEventListener('scroll', () => this.updateProgressLine(), { passive: true });
  }

  /**
   * Update active phase state
   * @param {number} phase - Phase number (1-5)
   * @param {boolean} animate - Whether to animate transitions
   */
  updateActivePhase(phase, animate = true) {
    if (this.activePhase === phase) return;

    console.log('[SupportContinuum] Updating active phase to:', phase);
    this.activePhase = phase;

    // Update timeline items
    this.timelineItems.forEach(item => {
      const itemPhase = parseInt(item.getAttribute('data-phase'));
      const isActive = itemPhase === phase;

      // Update classes
      item.classList.toggle('active', isActive);

      // Update ARIA
      item.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    // Update panels
    this.panels.forEach(panel => {
      const panelPhase = parseInt(panel.getAttribute('data-phase'));
      panel.classList.toggle('active', panelPhase === phase);
    });

    // Update progress line
    this.updateProgressLine();
  }

  /**
   * Update progress line height based on active item position
   */
  updateProgressLine() {
    if (!this.progressLine || !this.timelineNav) return;

    const navRect = this.timelineNav.getBoundingClientRect();
    const firstItem = this.timelineItems[0];
    const activeItem = document.querySelector('.timeline-item.active');

    if (!firstItem || !activeItem) return;

    // Calculate progress based on active item position
    const firstBullet = firstItem.querySelector('.timeline-bullet');
    const activeBullet = activeItem.querySelector('.timeline-bullet');

    if (!firstBullet || !activeBullet) return;

    const firstBulletRect = firstBullet.getBoundingClientRect();
    const activeBulletRect = activeBullet.getBoundingClientRect();

    // Calculate relative positions within the nav container
    const startY = firstBulletRect.top - navRect.top + (firstBulletRect.height / 2);
    const currentY = activeBulletRect.top - navRect.top + (activeBulletRect.height / 2);
    const progressHeight = currentY - startY;

    // Update progress line height
    this.progressLine.style.height = `${Math.max(0, progressHeight)}px`;
  }

  /**
   * Set up keyboard navigation
   */
  setupKeyboardNavigation() {
    this.timelineItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        let targetIndex = null;

        switch (e.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            e.preventDefault();
            targetIndex = Math.min(index + 1, this.timelineItems.length - 1);
            break;
          case 'ArrowUp':
          case 'ArrowLeft':
            e.preventDefault();
            targetIndex = Math.max(index - 1, 0);
            break;
          case 'Home':
            e.preventDefault();
            targetIndex = 0;
            break;
          case 'End':
            e.preventDefault();
            targetIndex = this.timelineItems.length - 1;
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            const phase = parseInt(item.getAttribute('data-phase'));
            this.handleTimelineClick(phase);
            return;
        }

        if (targetIndex !== null) {
          this.timelineItems[targetIndex].focus();
        }
      });
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new SupportContinuum();
});

// Export for external use if needed
if (typeof window !== 'undefined') {
  window.SupportContinuum = SupportContinuum;
}
