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

    // NEW: Setup section boundary detection (hide panels when section out of view)
    // This ensures fixed panels only show when support continuum section is visible
    this.setupPanelVisibility();

    // NEW: Setup sticky behavior via JavaScript (fallback for CSS position: sticky)
    this.setupStickyBehavior();

    // NEW: Position panels to align with first timeline title
    this.alignPanelsWithTimeline();

    // Initialize first phase
    console.log('[SupportContinuum] Setup complete, activating phase 1');
    this.updateActivePhase(1, false);
    this.updateProgressLine(0); // Initialize with 0 progress
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
    const panelsContainer = document.querySelector('.support-panels-container');
    if (!section || !panelsContainer) return;

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

      // Update progress line with smooth scroll progress
      this.updateProgressLine(scrollProgress);
    }, { passive: true });
  }

  /**
   * Show/hide panels based on section visibility
   * Ensures fixed panels only appear when support continuum section is in view
   */
  setupPanelVisibility() {
    if (!this.section) return;

    const panelsContainer = document.querySelector('.support-panels-container');
    if (!panelsContainer) return;

    // Single source of truth for panel visibility
    const checkPanelVisibility = () => {
      const sectionRect = this.section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Show panels ONLY when section is in viewport and actively being viewed
      // Must be in viewport: section top is above viewport bottom, section bottom is below viewport top
      const sectionInViewport = sectionRect.top < viewportHeight && sectionRect.bottom > 0;
      // Must be actively viewing: scrolled into position (top ≤ 100px) and section still has significant content below viewport (bottom > 20%)
      const isActivelyViewing = sectionRect.top <= 100 && sectionRect.bottom > viewportHeight * 0.2;
      // Hide panels when Phase 5 is reached and user has scrolled past 70% of viewport with section content
      const isPhase5AndPastEnd = this.activePhase === 5 && sectionRect.bottom < viewportHeight * 0.7;
      const shouldShow = sectionInViewport && isActivelyViewing && !isPhase5AndPastEnd;

      if (shouldShow) {
        if (!panelsContainer.classList.contains('panels-visible')) {
          panelsContainer.classList.add('panels-visible');
          console.log('[SupportContinuum] ✅ Panels shown - section in active view', {
            sectionTop: sectionRect.top.toFixed(2),
            sectionBottom: sectionRect.bottom.toFixed(2),
            sectionInViewport,
            isActivelyViewing,
            activePhase: this.activePhase,
            isPhase5AndPastEnd
          });
        }
      } else {
        if (panelsContainer.classList.contains('panels-visible')) {
          panelsContainer.classList.remove('panels-visible');
          console.log('[SupportContinuum] ❌ Panels hidden - section not in active view', {
            sectionTop: sectionRect.top.toFixed(2),
            sectionBottom: sectionRect.bottom.toFixed(2),
            sectionInViewport,
            isActivelyViewing,
            activePhase: this.activePhase,
            isPhase5AndPastEnd
          });
        }
      }
    };

    // Check visibility on scroll
    window.addEventListener('scroll', checkPanelVisibility, { passive: true });

    // Initial check on page load
    checkPanelVisibility();
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
  }

  /**
   * Update progress line height based on smooth scroll progress
   * @param {number} scrollProgress - Scroll progress through section (0 to 1)
   */
  updateProgressLine(scrollProgress = 0) {
    if (!this.progressLine || !this.timelineNav) return;
    if (this.timelineItems.length === 0) return;

    const navRect = this.timelineNav.getBoundingClientRect();
    const firstBullet = this.timelineItems[0].querySelector('.timeline-bullet');
    if (!firstBullet) return;

    // Calculate fractional phase (0.0 to 5.0)
    const fractionalPhase = Math.max(0, Math.min(5, scrollProgress * 5));

    // Determine which two bullets we're between
    const currentPhaseIndex = Math.floor(fractionalPhase);
    const nextPhaseIndex = Math.min(currentPhaseIndex + 1, 4);

    // Calculate fraction between these two bullets (0 to 1)
    const fraction = fractionalPhase - currentPhaseIndex;

    // Get bullet positions
    const currentBullet = this.timelineItems[currentPhaseIndex]?.querySelector('.timeline-bullet');
    const nextBullet = this.timelineItems[nextPhaseIndex]?.querySelector('.timeline-bullet');

    if (!currentBullet || !nextBullet) {
      // Fallback: extend to last available bullet
      const lastBullet = this.timelineItems[this.timelineItems.length - 1]?.querySelector('.timeline-bullet');
      if (!lastBullet) return;

      const lastBulletRect = lastBullet.getBoundingClientRect();
      const startY = firstBullet.getBoundingClientRect().top - navRect.top + (firstBullet.offsetHeight / 2);
      const endY = lastBulletRect.top - navRect.top + (lastBulletRect.height / 2);

      this.progressLine.style.height = `${Math.max(0, endY - startY)}px`;
      return;
    }

    // Calculate positions
    const currentBulletRect = currentBullet.getBoundingClientRect();
    const nextBulletRect = nextBullet.getBoundingClientRect();

    const startY = firstBullet.getBoundingClientRect().top - navRect.top + (firstBullet.offsetHeight / 2);
    const currentY = currentBulletRect.top - navRect.top + (currentBulletRect.height / 2);
    const nextY = nextBulletRect.top - navRect.top + (nextBulletRect.height / 2);

    // Interpolate between current and next bullet based on fraction
    const distanceBetweenBullets = nextY - currentY;
    const interpolatedY = currentY + (fraction * distanceBetweenBullets);

    // Calculate final progress line height from start to interpolated position
    const progressHeight = interpolatedY - startY;

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
    const stickyTop = 120; // Match CSS top: 120px
    let isFixed = false;

    const updatePosition = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const sectionBottom = this.section.offsetTop + this.section.offsetHeight;
      const shouldBeFixed = scrollTop >= (sectionTop - stickyTop) && scrollTop < (sectionBottom - stickyTop);

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
   * Align image panels with the first timeline title text
   * Calculates the position based on timeline nav sticky position and title offset
   */
  alignPanelsWithTimeline() {
    if (!this.section || this.panels.length === 0) return;

    // Find the first timeline title element
    const firstTimelineItem = this.timelineItems[0];
    if (!firstTimelineItem) return;

    const firstTitle = firstTimelineItem.querySelector('.timeline-title');
    if (!firstTitle) return;

    const calculateAlignment = () => {
      // Timeline nav is sticky at top: 120px
      const stickyTop = 120;

      // Get nav's current position and height
      const navRect = this.timelineNav.getBoundingClientRect();
      const navHeight = this.timelineNav.offsetHeight;

      // Find the title to align with (not the bullet)
      const firstTitle = firstTimelineItem.querySelector('.timeline-title');
      if (!firstTitle) return;

      const titleRect = firstTitle.getBoundingClientRect();

      // Calculate title's offset WITHIN the timeline nav container
      const titleOffsetInNav = titleRect.top - navRect.top;

      // Final panel position = sticky position + title offset within nav
      const panelTopValue = Math.round(stickyTop + titleOffsetInNav);

      console.log('[SupportContinuum] Aligning panels:', {
        stickyTop,
        navTop: navRect.top,
        navHeight,
        titleTop: titleRect.top,
        titleOffsetInNav,
        panelTopValue
      });

      // Apply top position and height to all panels
      this.panels.forEach(panel => {
        panel.style.top = `${panelTopValue}px`;
        panel.style.height = `${navHeight}px`;
      });
    };

    // Delay initial calculation until layout is fully rendered
    // This ensures CSS sticky positioning is applied and bullets are at their final positions
    requestAnimationFrame(() => {
      setTimeout(() => {
        calculateAlignment();
      }, 100);
    });

    // Recalculate on window resize
    window.addEventListener('resize', calculateAlignment, { passive: true });
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
