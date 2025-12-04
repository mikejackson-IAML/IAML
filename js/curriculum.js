/**
 * Curriculum Section - Tab Navigation and Accordion
 * Handles block switching and competency group expansion
 */

const initCurriculum = () => {
  // Get all tab navigation cards and content blocks
  const navCards = document.querySelectorAll('.curriculum-nav-card');
  const contentBlocks = document.querySelectorAll('.curriculum-block');
  const competencyHeaders = document.querySelectorAll('.competency-header');

  // Initialize tab switching
  if (navCards.length > 0) {
    navCards.forEach(card => {
      card.addEventListener('click', () => {
        handleTabSwitch(card, navCards, contentBlocks);
      });

      // Keyboard support: Enter and Space
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTabSwitch(card, navCards, contentBlocks);
        }
      });
    });

    // Set first tab as focusable
    navCards[0].setAttribute('tabindex', '0');
    navCards.forEach((card, index) => {
      if (index > 0) {
        card.setAttribute('tabindex', '-1');
      }
    });

    // Arrow key navigation between tabs
    navCards.forEach((card) => {
      card.addEventListener('keydown', (e) => {
        let targetCard = null;
        const currentIndex = Array.from(navCards).indexOf(card);

        if (e.key === 'ArrowRight') {
          e.preventDefault();
          targetCard = navCards[Math.min(currentIndex + 1, navCards.length - 1)];
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          targetCard = navCards[Math.max(currentIndex - 1, 0)];
        }

        if (targetCard) {
          targetCard.focus();
          handleTabSwitch(targetCard, navCards, contentBlocks);
        }
      });
    });
  }

  // Initialize accordion
  if (competencyHeaders.length > 0) {
    competencyHeaders.forEach(header => {
      header.addEventListener('click', () => {
        handleAccordionToggle(header);
      });

      // Keyboard support: Enter and Space
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAccordionToggle(header);
        }
      });

      // Set initial aria-expanded state
      const group = header.closest('.competency-group');
      const isActive = group.classList.contains('active');
      header.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });
  }
};

/**
 * Handle tab/block switching
 */
const handleTabSwitch = (clickedCard, allCards, allBlocks) => {
  const targetBlockId = clickedCard.getAttribute('data-target');

  if (!targetBlockId) return;

  // Remove active state from all cards
  allCards.forEach(card => {
    card.classList.remove('active');
    card.setAttribute('tabindex', '-1');
    card.setAttribute('aria-selected', 'false');
  });

  // Add active state to clicked card
  clickedCard.classList.add('active');
  clickedCard.setAttribute('tabindex', '0');
  clickedCard.setAttribute('aria-selected', 'true');

  // Hide all blocks
  allBlocks.forEach(block => {
    block.classList.remove('active');
  });

  // Show target block
  const targetBlock = document.getElementById(targetBlockId);
  if (targetBlock) {
    targetBlock.classList.add('active');

    // Announce change to screen readers
    announceToScreenReader(`${clickedCard.textContent} tab activated`);
  }
};

/**
 * Handle accordion toggle (competency groups)
 */
const handleAccordionToggle = (header) => {
  const group = header.closest('.competency-group');
  if (!group) return;

  const isCurrentlyActive = group.classList.contains('active');

  // Toggle current group
  group.classList.toggle('active');

  // Update aria-expanded
  header.setAttribute('aria-expanded', !isCurrentlyActive);

  // Announce change to screen readers
  const groupTitle = header.querySelector('h3')?.textContent || 'Group';
  const action = isCurrentlyActive ? 'collapsed' : 'expanded';
  announceToScreenReader(`${groupTitle} ${action}`);
};

/**
 * Announce changes to screen readers using aria-live
 */
const announceToScreenReader = (message) => {
  let liveRegion = document.querySelector('[aria-live="polite"]');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
  }

  liveRegion.textContent = message;
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCurriculum);
