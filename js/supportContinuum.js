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

    // NEW: Phase completion tracking
    this.viewedPhases = new Set([1]); // Start with phase 1 as viewed
    this.allPhasesViewed = false;
    this.ctaSection = document.getElementById('iaml-cta');
    this.ctaOverlay = null;

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
      // NEW: Skip lock overlay for reduced motion
      this.allPhasesViewed = true;
      return;
    }

    // NEW: Create CTA lock overlay
    this.createCtaOverlay();

    // Set up event listeners
    this.setupClickHandlers();
    this.setupScrollObserver();
    this.setupKeyboardNavigation();

    // NEW: Setup section boundary detection (hide panels when section out of view)
    // DISABLED: This was causing panels to be hidden due to !important override
    // The sticky positioning naturally handles section visibility
    // this.setupSectionBoundaries();

    // NEW: Setup sticky behavior via JavaScript (fallback for CSS position: sticky)
    this.setupStickyBehavior();

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
   * Set up scroll-based phase detection for sticky section
   */
  setupScrollObserver() {
    const section = this.section;
    if (!section) return;

    window.addEventListener('scroll', () => {
      if (this.isScrollingFromClick) return;

      const sectionRect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;

      // Calculate how far we've scrolled through the section (0 to 1)
      // When section.top = 0, we're at the start (progress = 0)
      // When section.top = -sectionHeight, we've scrolled through (progress = 1)
      const scrollProgress = Math.max(0, Math.min(1, -sectionRect.top / sectionHeight));

      // Map scroll progress to phases (0-1 → phases 1-5)
      const phase = Math.min(5, Math.max(1, Math.ceil(scrollProgress * 5)));

      console.log('[SupportContinuum] Scroll progress:', scrollProgress.toFixed(2), '-> Phase:', phase);
      this.updateActivePhase(phase, true);

      // Control panel visibility based on section viewport position
      const sectionTop = sectionRect.top;
      const sectionBottom = sectionRect.bottom;
      const isInView = sectionTop < window.innerHeight && sectionBottom > 0;

      if (isInView) {
        section.classList.add('section-active');
      } else {
        section.classList.remove('section-active');
      }

      // Update progress line
      this.updateProgressLine();
    }, { passive: true });
  }

  /**
   * Hide panels when section scrolls completely out of view
   */
  setupSectionBoundaries() {
    if (!this.section) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Section in view - panels can be visible
          this.section.classList.remove('section-out-of-view');
        } else {
          // Section out of view - force hide all panels
          this.section.classList.add('section-out-of-view');
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0
    });

    observer.observe(this.section);
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

    // NEW: Track this phase as viewed
    this.viewedPhases.add(phase);
    console.log('[SupportContinuum] Viewed phases:', Array.from(this.viewedPhases));

    // NEW: Check if all phases viewed
    if (this.viewedPhases.size === 5 && !this.allPhasesViewed) {
      this.allPhasesViewed = true;
      this.unlockNextSection();
    }

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

    // NEW: Update overlay progress
    this.updateProgressIndicator();

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

  /**
   * Setup sticky behavior via JavaScript
   * Handles cases where CSS position: sticky doesn't work reliably
   */
  setupStickyBehavior() {
    if (window.innerWidth < 768) return; // Skip on mobile
    if (!this.timelineNav) return;

    const sectionTop = this.section.offsetTop;
    const navHeight = this.timelineNav.offsetHeight;
    const stickyTop = 120; // Match CSS top: 120px
    let isFixed = false;

    const updatePosition = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const sectionBottom = this.section.offsetTop + this.section.offsetHeight;
      const shouldBeFixed = scrollTop >= (sectionTop - stickyTop) && scrollTop < (sectionBottom - navHeight - stickyTop);

      if (shouldBeFixed && !isFixed) {
        // Switch to fixed
        const navRect = this.timelineNav.getBoundingClientRect();
        this.timelineNav.style.position = 'fixed';
        this.timelineNav.style.top = `${stickyTop}px`;
        this.timelineNav.style.left = `${navRect.left}px`;
        this.timelineNav.style.width = '400px';
        this.timelineNav.style.zIndex = '10';

        isFixed = true;
        console.log('[SupportContinuum] Timeline nav switched to FIXED');
      } else if (!shouldBeFixed && isFixed) {
        // Switch back to relative
        this.timelineNav.style.position = 'relative';
        this.timelineNav.style.top = 'auto';
        this.timelineNav.style.left = 'auto';
        this.timelineNav.style.width = 'auto';

        isFixed = false;
        console.log('[SupportContinuum] Timeline nav switched to RELATIVE');
      }
    };

    // Listen for scroll events
    window.addEventListener('scroll', updatePosition, { passive: true });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth < 768) {
        // Reset on mobile
        this.timelineNav.style.position = 'relative';
        this.timelineNav.style.top = 'auto';
        this.timelineNav.style.width = 'auto';
        isFixed = false;
      } else {
        updatePosition();
      }
    }, { passive: true });

    // Initial call
    updatePosition();
  }

  /**
   * Create overlay on CTA section
   */
  createCtaOverlay() {
    if (!this.ctaSection || this.ctaOverlay) return;

    this.ctaOverlay = document.createElement('div');
    this.ctaOverlay.className = 'cta-lock-overlay';
    this.ctaOverlay.setAttribute('role', 'status');
    this.ctaOverlay.setAttribute('aria-live', 'polite');
    this.ctaOverlay.innerHTML = `
      <div class="lock-content">
        <div class="lock-icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <p class="lock-message">
          <strong>Explore all 5 support phases to continue</strong><br>
          <span class="lock-progress">1 of 5 phases explored</span>
        </p>
        <button class="btn-skip-lock" aria-label="Skip to CTA section">
          Skip to Register
        </button>
      </div>
    `;

    this.ctaSection.style.position = 'relative';
    this.ctaSection.appendChild(this.ctaOverlay);

    // Handle skip button
    const skipBtn = this.ctaOverlay.querySelector('.btn-skip-lock');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        if (typeof gtag === 'function') {
          gtag('event', 'support_continuum_skipped', {
            phases_viewed: this.viewedPhases.size
          });
        }
        this.allPhasesViewed = true;
        this.unlockNextSection();
      });
    }
  }

  /**
   * Unlock CTA section after all phases viewed
   */
  unlockNextSection() {
    console.log('[SupportContinuum] All phases viewed! Unlocking CTA.');

    if (this.ctaOverlay) {
      this.ctaOverlay.classList.add('unlocking');
      setTimeout(() => {
        this.ctaOverlay.remove();
        this.ctaOverlay = null;
      }, 600);
    }

    if (this.section) {
      this.section.classList.add('all-phases-viewed');
    }

    // Analytics event
    if (typeof gtag === 'function') {
      gtag('event', 'support_continuum_completed', {
        event_category: 'Engagement',
        phases_viewed: this.viewedPhases.size
      });
    }

    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('supportContinuumComplete', {
      detail: { viewedPhases: Array.from(this.viewedPhases) }
    }));
  }

  /**
   * Update progress text in overlay
   */
  updateProgressIndicator() {
    if (!this.ctaOverlay) return;

    const progressText = this.ctaOverlay.querySelector('.lock-progress');
    if (progressText) {
      progressText.textContent = `${this.viewedPhases.size} of 5 phases explored`;
    }
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
