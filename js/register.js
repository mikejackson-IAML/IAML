/**
 * IAML Registration Page
 * Handles multi-step registration with URL pre-fill, dynamic pricing, and payment options
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================

  const PROGRAM_SLUGS = {
    'employee-relations-law': 'Certificate in Employee Relations Law',
    'strategic-employment-law': 'Advanced Certificate in Strategic Employment Law',
    'strategic-hr': 'Certificate in Strategic HR Management',
    'workplace-investigations': 'Certificate in Workplace Investigations',
    'employee-benefits-law': 'Certificate in Employee Benefits Law',
    'advanced-benefits-law': 'Advanced Certificate in Employee Benefits Law'
  };

  const PROGRAM_SLUGS_REVERSE = Object.fromEntries(
    Object.entries(PROGRAM_SLUGS).map(([slug, name]) => [name, slug])
  );

  const FORMAT_SLUGS = {
    'in-person': 'In-Person',
    'virtual': 'Virtual',
    'on-demand': 'On-Demand'
  };

  const FORMAT_SLUGS_REVERSE = {
    'In-Person': 'in-person',
    'Virtual': 'virtual',
    'On-Demand': 'on-demand'
  };

  const ALLOWED_PROGRAMS = [
    'Certificate in Employee Relations Law',
    'Advanced Certificate in Strategic Employment Law',
    'Certificate in Strategic HR Management',
    'Certificate in Workplace Investigations',
    'Certificate in Employee Benefits Law',
    'Advanced Certificate in Employee Benefits Law'
  ];

  const BLOCK_PROGRAM_MAP = {
    'Certificate in Employee Relations Law': {
      code: 'A',
      blocks: ['Block 1', 'Block 2', 'Block 3'],
      days: { 'Block 1': 2, 'Block 2': 2, 'Block 3': 1 },
      ranges: { 'Block 1': [0, 1], 'Block 2': [2, 3], 'Block 3': [4, 4] }
    },
    'Certificate in Employee Benefits Law': {
      code: 'E',
      blocks: ['Block 1', 'Block 2', 'Block 3'],
      days: { 'Block 1': 2, 'Block 2': 1, 'Block 3': 2 },
      ranges: { 'Block 1': [0, 1], 'Block 2': [2, 2], 'Block 3': [3, 4] }
    },
    'Certificate in Strategic HR Management': {
      code: 'B',
      blocks: ['Block 1', 'Block 2'],
      days: { 'Block 1': 2, 'Block 2': 3 },
      ranges: { 'Block 1': [0, 1], 'Block 2': [2, 4] }
    }
  };

  const PRICING = {
    'Certificate in Employee Relations Law': {
      full: 2375,
      blocks: { 'Block 1': 1375, 'Block 2': 1375, 'Block 3': 575 }
    },
    'Certificate in Strategic HR Management': {
      full: 2375,
      blocks: { 'Block 1': 1375, 'Block 2': 1575 }
    },
    'Certificate in Employee Benefits Law': {
      full: 2375,
      blocks: { 'Block 1': 1375, 'Block 2': 575, 'Block 3': 975 }
    },
    'Advanced Certificate in Strategic Employment Law': { full: 1575 },
    'Advanced Certificate in Employee Benefits Law': { full: 1575 },
    'Certificate in Workplace Investigations': { full: 1575 }
  };

  const COUPON_RULES = {
    PP500: {
      amount: 500,
      type: 'Flat',
      programs: [
        'Certificate in Employee Relations Law',
        'Certificate in Strategic HR Management',
        'Certificate in Employee Benefits Law'
      ],
      allowed: (isFull) => isFull === true
    },
    PP300: {
      amount: 300,
      type: 'Flat',
      programs: [],
      allowed: () => true
    },
    PP100: {
      amount: 100,
      type: 'Flat',
      programs: [],
      allowed: (isFull, blocksCount) => !isFull && blocksCount >= 1
    }
  };

  const TABLE_SESSIONS = 'Program Sessions';
  const TABLE_COUPONS = 'tblBaUQKmYuIMsVQm';

  // ============================================
  // STATE
  // ============================================

  const state = {
    // Current step
    currentStep: null,
    steps: [],

    // Selections
    format: '',
    program: '',
    attendanceType: 'Full',
    attendanceBlocks: [],
    sessionId: '',
    sessionRecord: null,

    // Pricing
    basePrice: 0,
    coupon: null,
    couponDiscount: 0,
    amountDue: 0,

    // Derived dates
    derivedStart: null,
    derivedEnd: null,

    // Contact info
    contactFirstName: '',
    contactLastName: '',
    contactEmail: '',
    contactPhone: '',
    contactTitle: '',
    contactCompany: '',

    // Payment
    paymentMethod: '',

    // Billing info (for invoice)
    billingContactName: '',
    billingContactEmail: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingPO: '',
    billingNotes: '',

    // Stripe
    stripe: null,
    cardElement: null,

    // Location from session
    city: '',
    state: ''
  };

  // ============================================
  // DOM REFERENCES
  // ============================================

  const qs = (sel) => document.querySelector(sel);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  function parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      format: params.get('format') || '',
      program: params.get('program') || '',
      session: params.get('session') || '',
      blocks: params.get('blocks') || '',
      confirmed: params.get('confirmed') || ''
    };
  }

  function formatCurrency(n) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n || 0);
  }

  function parseAirtableLocal(s) {
    if (!s) return null;
    const [y, m, d] = String(s).split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }

  function formatYMDLocal(date) {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function formatHumanRange(d1, d2) {
    if (!d1 && !d2) return '';
    const f = (dt, withMonth = true, withYear = true) => {
      const m = MONTHS[dt.getMonth()];
      const d = dt.getDate();
      const y = dt.getFullYear();
      if (withMonth && withYear) return `${m} ${d}, ${y}`;
      if (withMonth && !withYear) return `${m} ${d}`;
      return String(d);
    };
    const sameDay = d1 && d2 && d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    if (sameDay) return f(d1, true, true);
    if (d1 && d2) {
      const sameMonth = d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
      const sameYear = d1.getFullYear() === d2.getFullYear();
      if (sameMonth) return `${MONTHS[d1.getMonth()]} ${d1.getDate()}–${d2.getDate()}, ${d1.getFullYear()}`;
      if (sameYear) return `${f(d1, true, false)} – ${f(d2, true, true)}`;
      return `${f(d1, true, true)} – ${f(d2, true, true)}`;
    }
    return f(d1 || d2, true, true);
  }

  function formatToRegex(format) {
    const f = String(format || '').toLowerCase();
    if (f === 'on-demand' || f === 'on demand') return 'on[\\s-]?demand';
    if (f === 'in-person' || f === 'in person') return 'in[\\s-]?person';
    if (f === 'virtual') return 'virtual';
    return f.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  function programHasBlocks(name) {
    if (state.format === 'On-Demand') return false;
    return !!BLOCK_PROGRAM_MAP[name];
  }

  function computeDerivedDates(sessionRecord, program, isFull, selectedBlocks) {
    const f = sessionRecord?.fields || {};
    const startRaw = f['Session Start Date'];
    const endRaw = f['Session End Date'];
    if (!startRaw) return { start: null, end: null };
    const baseStart = parseAirtableLocal(startRaw);
    const baseEnd = endRaw ? parseAirtableLocal(endRaw) : baseStart;

    if (isFull || !BLOCK_PROGRAM_MAP[program] || !selectedBlocks?.length) {
      return { start: baseStart, end: baseEnd };
    }

    const cfg = BLOCK_PROGRAM_MAP[program];
    const sorted = selectedBlocks.slice().sort((a, b) => {
      const ia = cfg.blocks.indexOf(a);
      const ib = cfg.blocks.indexOf(b);
      return ia - ib;
    });

    let minOffset = Infinity;
    let maxOffset = -Infinity;
    sorted.forEach(blk => {
      const range = cfg.ranges[blk];
      if (range) {
        minOffset = Math.min(minOffset, range[0]);
        maxOffset = Math.max(maxOffset, range[1]);
      }
    });

    if (minOffset === Infinity) return { start: baseStart, end: baseEnd };

    const derivedStart = new Date(baseStart);
    derivedStart.setDate(derivedStart.getDate() + minOffset);
    const derivedEnd = new Date(baseStart);
    derivedEnd.setDate(derivedEnd.getDate() + maxOffset);

    return { start: derivedStart, end: derivedEnd };
  }

  function computeAmountDue(basePrice, program, isFull, selectedBlocks) {
    const pricing = PRICING[program];
    if (!pricing) return basePrice || 0;

    if (isFull || !selectedBlocks?.length) {
      return pricing.full || basePrice || 0;
    }

    if (!pricing.blocks) return pricing.full || basePrice || 0;

    // Sum up block prices
    let total = 0;
    selectedBlocks.forEach(blk => {
      total += pricing.blocks[blk] || 0;
    });

    // Check if buying all blocks costs more than full program
    const fullPrice = pricing.full || 0;
    if (total >= fullPrice && BLOCK_PROGRAM_MAP[program]) {
      // Auto-upgrade to full
      state.attendanceType = 'Full';
      return fullPrice;
    }

    return total;
  }

  // ============================================
  // API FUNCTIONS
  // ============================================

  async function airtableList(tableName, opts = {}) {
    const { filterByFormula, sort = [], maxRecords } = opts;
    const params = new URLSearchParams();
    params.set('table', tableName);
    if (filterByFormula) params.set('filterByFormula', filterByFormula);
    if (maxRecords) params.set('maxRecords', String(maxRecords));
    (Array.isArray(sort) ? sort : []).forEach((s, i) => {
      if (!s) return;
      if (s.field) params.set(`sort[${i}][field]`, s.field);
      if (s.direction) params.set(`sort[${i}][direction]`, s.direction);
    });
    const url = `/api/airtable-programs?${params.toString()}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Airtable error ${res.status}`);
      return res.json();
    } catch (error) {
      console.error('API Error:', error);
      console.error('Tip: For local development, run: vercel dev');
      throw new Error('API endpoint not available. Are you running vercel dev?');
    }
  }

  async function submitToGHL(payload) {
    const webhookUrl = ENV_CONFIG?.GHL_REGISTRATION_WEBHOOK;
    if (!webhookUrl) {
      throw new Error('GHL registration webhook not configured. Add GHL_REGISTRATION_WEBHOOK to js/env-config.local.js');
    }
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('GHL submission failed');
    return res.json();
  }

  // ============================================
  // STEP MANAGEMENT
  // ============================================

  function determineSteps(urlParams) {
    const steps = [];
    const formatSlug = urlParams.format?.toLowerCase();
    const programSlug = urlParams.program?.toLowerCase();
    const sessionId = urlParams.session;
    const blocksParam = urlParams.blocks;

    // Resolve format
    if (formatSlug && FORMAT_SLUGS[formatSlug]) {
      state.format = FORMAT_SLUGS[formatSlug];
    } else {
      steps.push('format');
    }

    // Resolve program
    if (programSlug && PROGRAM_SLUGS[programSlug]) {
      state.program = PROGRAM_SLUGS[programSlug];
    } else if (!state.format) {
      steps.push('program');
    } else {
      steps.push('program');
    }

    // Resolve blocks
    if (blocksParam && state.program && programHasBlocks(state.program)) {
      const blockNums = blocksParam.split(',').map(n => `Block ${n.trim()}`);
      state.attendanceBlocks = blockNums;
      state.attendanceType = blockNums.join(', ');
    } else if (state.program && programHasBlocks(state.program) && state.format !== 'On-Demand') {
      steps.push('blocks');
    }

    // Resolve session
    if (sessionId) {
      state.sessionId = sessionId;
    } else if (state.format !== 'On-Demand') {
      steps.push('session');
    }

    // Always need contact info
    steps.push('contact');

    // Always need payment method
    steps.push('payment');

    return steps;
  }

  function buildStepperUI() {
    const stepperList = qs('#stepperList');
    if (!stepperList) return;

    stepperList.innerHTML = '';

    const stepLabels = {
      format: 'Format',
      program: 'Program',
      blocks: 'Attendance',
      session: 'Session',
      contact: 'Your Info',
      payment: 'Payment'
    };

    state.steps.forEach((step, index) => {
      const li = document.createElement('li');
      li.className = 'stepper-item';
      li.dataset.step = step;
      li.innerHTML = `
        <span class="stepper-number">${index + 1}</span>
        <span class="stepper-label">${stepLabels[step]}</span>
      `;
      stepperList.appendChild(li);
    });

    updateStepperUI();
  }

  function updateStepperUI() {
    const items = qsa('.stepper-item');
    const currentIndex = state.steps.indexOf(state.currentStep);

    items.forEach((item, index) => {
      item.classList.remove('active', 'completed');
      if (index < currentIndex) {
        item.classList.add('completed');
      } else if (index === currentIndex) {
        item.classList.add('active');
      }
    });
  }

  function showStep(stepName) {
    // Hide all steps
    qsa('.register-step').forEach(el => {
      el.classList.add('hidden');
      el.setAttribute('aria-hidden', 'true');
    });

    // Show current step
    const stepEl = qs(`#step-${stepName}`);
    if (stepEl) {
      stepEl.classList.remove('hidden');
      stepEl.setAttribute('aria-hidden', 'false');
    }

    state.currentStep = stepName;
    updateStepperUI();
    updateNavButtons();
    updateSidebar();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Focus management for accessibility
    if (stepEl) {
      const heading = stepEl.querySelector('h2');
      if (heading) heading.focus();
    }
  }

  function updateNavButtons() {
    const backBtn = qs('#backBtn');
    const nextBtn = qs('#nextBtn');
    const submitBtn = qs('#submitBtn');
    const navEl = qs('#registerNav');

    const currentIndex = state.steps.indexOf(state.currentStep);
    const isFirstStep = currentIndex === 0;
    const isLastStep = currentIndex === state.steps.length - 1;
    const isConfirmation = state.currentStep?.startsWith('confirm-');

    // Hide nav on confirmation pages
    if (navEl) {
      navEl.classList.toggle('hidden', isConfirmation);
    }

    if (backBtn) {
      backBtn.classList.toggle('hidden', isFirstStep);
    }

    if (nextBtn && submitBtn) {
      nextBtn.classList.toggle('hidden', isLastStep);
      submitBtn.classList.toggle('hidden', !isLastStep);
    }
  }

  function goToNextStep() {
    const currentIndex = state.steps.indexOf(state.currentStep);
    if (currentIndex < state.steps.length - 1) {
      showStep(state.steps[currentIndex + 1]);
    }
  }

  function goToPreviousStep() {
    const currentIndex = state.steps.indexOf(state.currentStep);
    if (currentIndex > 0) {
      showStep(state.steps[currentIndex - 1]);
    }
  }

  // ============================================
  // SIDEBAR UPDATES
  // ============================================

  function updateSidebar() {
    // Program
    const programValue = qs('#summaryProgramValue');
    if (programValue) {
      programValue.textContent = state.program || '—';
    }

    // Format
    const formatBadge = qs('#summaryFormatBadge');
    if (formatBadge) {
      formatBadge.textContent = state.format || '—';
      formatBadge.className = 'format-badge-small';
      if (state.format) {
        formatBadge.classList.add(`format-${FORMAT_SLUGS_REVERSE[state.format] || 'in-person'}`);
      }
    }

    // Blocks
    const blocksSection = qs('#summaryBlocks');
    const blocksValue = qs('#summaryBlocksValue');
    if (blocksSection && blocksValue) {
      if (state.program && programHasBlocks(state.program)) {
        blocksSection.classList.remove('hidden');
        blocksValue.textContent = state.attendanceType === 'Full' ? 'Full Program' : state.attendanceType;
      } else {
        blocksSection.classList.add('hidden');
      }
    }

    // Session & Location
    const sessionSection = qs('#summarySession');
    const sessionValue = qs('#summarySessionValue');
    const locationSection = qs('#summaryLocation');
    const locationValue = qs('#summaryLocationValue');

    if (state.sessionRecord) {
      const f = state.sessionRecord.fields || {};
      const start = state.derivedStart || (f['Session Start Date'] ? parseAirtableLocal(f['Session Start Date']) : null);
      const end = state.derivedEnd || (f['Session End Date'] ? parseAirtableLocal(f['Session End Date']) : null);

      if (sessionSection && sessionValue) {
        sessionSection.classList.remove('hidden');
        sessionValue.textContent = formatHumanRange(start, end);
      }

      if (locationSection && locationValue) {
        const city = f['City'] || '';
        const st = f['State'] || '';
        if (city || st) {
          locationSection.classList.remove('hidden');
          locationValue.textContent = city && st ? `${city}, ${st}` : (city || st);
        } else if (state.format === 'Virtual') {
          locationSection.classList.remove('hidden');
          locationValue.textContent = 'Virtual Classroom';
        } else {
          locationSection.classList.add('hidden');
        }
      }
    } else if (state.format === 'On-Demand') {
      if (sessionSection) sessionSection.classList.add('hidden');
      if (locationSection && locationValue) {
        locationSection.classList.remove('hidden');
        locationValue.textContent = 'Online (Self-Paced)';
      }
    } else {
      if (sessionSection) sessionSection.classList.add('hidden');
      if (locationSection) locationSection.classList.add('hidden');
    }

    // Pricing
    updatePricing();
  }

  function updatePricing() {
    const isFull = state.attendanceType === 'Full' || !state.attendanceBlocks.length;
    const basePrice = computeAmountDue(0, state.program, isFull, state.attendanceBlocks);
    state.basePrice = basePrice;

    const discount = state.couponDiscount || 0;
    state.amountDue = Math.max(0, basePrice - discount);

    // Update UI
    const baseLabel = qs('#pricingBaseLabel');
    const baseAmount = qs('#pricingBaseAmount');
    const discountRow = qs('#pricingDiscount');
    const discountLabel = qs('#pricingDiscountLabel');
    const discountAmount = qs('#pricingDiscountAmount');
    const totalAmount = qs('#pricingTotal');

    if (baseLabel) {
      baseLabel.textContent = isFull ? 'Program Fee' : 'Block Fee(s)';
    }
    if (baseAmount) {
      baseAmount.textContent = formatCurrency(basePrice);
    }

    if (discountRow && discountAmount) {
      if (discount > 0) {
        discountRow.classList.remove('hidden');
        discountAmount.textContent = `-${formatCurrency(discount)}`;
        if (discountLabel && state.coupon) {
          const code = state.coupon.fields?.['Coupon Code'] || 'Discount';
          discountLabel.textContent = `Coupon (${code})`;
        }
      } else {
        discountRow.classList.add('hidden');
      }
    }

    if (totalAmount) {
      totalAmount.textContent = formatCurrency(state.amountDue);
    }
  }

  // ============================================
  // STEP POPULATION
  // ============================================

  function populateProgramOptions() {
    const container = qs('#programOptions');
    if (!container) return;

    container.innerHTML = '';
    ALLOWED_PROGRAMS.forEach(name => {
      const slug = PROGRAM_SLUGS_REVERSE[name] || name.toLowerCase().replace(/\s+/g, '-');
      const label = document.createElement('label');
      label.className = 'program-option';
      label.innerHTML = `
        <input type="radio" name="program" value="${slug}">
        <div class="program-card">
          <strong>${name}</strong>
        </div>
      `;
      container.appendChild(label);
    });
  }

  function populateBlockOptions() {
    const container = qs('#blockOptions');
    if (!container) return;

    container.innerHTML = '';

    // Full program option
    const fullLabel = document.createElement('label');
    fullLabel.className = 'block-option';
    fullLabel.innerHTML = `
      <input type="radio" name="attendanceType" value="full" checked>
      <div class="block-card">
        <strong>Full Program</strong>
        <span>Attend all sessions</span>
      </div>
    `;
    container.appendChild(fullLabel);

    // Block options
    const cfg = BLOCK_PROGRAM_MAP[state.program];
    if (cfg && cfg.blocks) {
      cfg.blocks.forEach(block => {
        const pricing = PRICING[state.program];
        const blockPrice = pricing?.blocks?.[block] || 0;

        const label = document.createElement('label');
        label.className = 'block-option';
        label.innerHTML = `
          <input type="checkbox" name="attendanceBlocks" value="${block}">
          <div class="block-card">
            <strong>${block}</strong>
            <span>${formatCurrency(blockPrice)}</span>
          </div>
        `;
        container.appendChild(label);
      });
    }
  }

  async function loadSessions() {
    const container = qs('#sessionList');
    const loadingEl = qs('#sessionsLoading');
    const emptyEl = qs('#sessionsEmpty');

    if (!container) return;

    container.innerHTML = '';
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');

    try {
      const patt = formatToRegex(state.format);
      const program = state.program;
      const futureFilter = `OR(IS_AFTER({Session End Date}, TODAY()), IS_SAME({Session End Date}, TODAY()))`;
      const filter = `AND({Program}='${program.replace(/'/g, "\\'")}', REGEX_MATCH(LOWER({Format}), '^${patt}$'), ${futureFilter})`;

      const data = await airtableList(TABLE_SESSIONS, {
        filterByFormula: filter,
        maxRecords: 100,
        sort: [{ field: 'Session Start Date', direction: 'asc' }, { field: 'City', direction: 'asc' }]
      });

      const records = data.records || [];

      if (loadingEl) loadingEl.classList.add('hidden');

      if (records.length === 0) {
        if (emptyEl) emptyEl.classList.remove('hidden');
        return;
      }

      records.forEach(rec => {
        const f = rec.fields || {};
        const city = f['City'] || '';
        const st = f['State'] || '';
        const venue = f['Venue Name (1)'] || '';
        const start = f['Session Start Date'] ? parseAirtableLocal(f['Session Start Date']) : null;
        const end = f['Session End Date'] ? parseAirtableLocal(f['Session End Date']) : null;
        const attachments = f['Hero Image Attachment'];
        const imgUrl = Array.isArray(attachments) && attachments.length ? attachments[0]?.url : '';

        const card = document.createElement('div');
        card.className = 'session-card';
        card.dataset.sessionId = rec.id;
        card.setAttribute('role', 'radio');
        card.setAttribute('tabindex', '0');

        card.innerHTML = `
          <input type="radio" name="session" value="${rec.id}" class="session-radio">
          ${imgUrl ? `<img src="${imgUrl}" alt="" class="session-thumb">` : '<div class="session-thumb-placeholder">📍</div>'}
          <div class="session-info">
            <div class="session-location">${city && st ? `${city}, ${st}` : (city || st || 'Virtual Classroom')}</div>
            <div class="session-dates">${formatHumanRange(start, end)}</div>
            ${venue ? `<div class="session-venue">${venue}</div>` : ''}
          </div>
        `;

        // Selection handler
        const selectSession = () => {
          qsa('.session-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          card.querySelector('input').checked = true;

          state.sessionId = rec.id;
          state.sessionRecord = rec;
          state.city = city;
          state.state = st;

          // Compute derived dates
          const isFull = state.attendanceType === 'Full' || !state.attendanceBlocks.length;
          const derived = computeDerivedDates(rec, state.program, isFull, state.attendanceBlocks);
          state.derivedStart = derived.start;
          state.derivedEnd = derived.end;

          updateSidebar();
        };

        card.addEventListener('click', selectSession);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectSession();
          }
        });

        container.appendChild(card);

        // Auto-select if matches URL param
        if (rec.id === state.sessionId) {
          selectSession();
        }
      });

      // If we have a sessionId from URL but haven't fetched the record yet
      if (state.sessionId && !state.sessionRecord) {
        const match = records.find(r => r.id === state.sessionId);
        if (match) {
          state.sessionRecord = match;
          const f = match.fields || {};
          state.city = f['City'] || '';
          state.state = f['State'] || '';

          const isFull = state.attendanceType === 'Full' || !state.attendanceBlocks.length;
          const derived = computeDerivedDates(match, state.program, isFull, state.attendanceBlocks);
          state.derivedStart = derived.start;
          state.derivedEnd = derived.end;
        }
      }

    } catch (err) {
      console.error('Error loading sessions:', err);
      if (loadingEl) loadingEl.classList.add('hidden');
      if (emptyEl) {
        const isDevelopmentError = err.message.includes('vercel dev') || err.message.includes('API endpoint');
        if (isDevelopmentError) {
          emptyEl.innerHTML = `
            <strong>Unable to load sessions.</strong><br><br>
            <small>For local testing, run: <code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px;">vercel dev</code> from the project root.</small>
          `;
        } else {
          emptyEl.textContent = 'Unable to load sessions. Please try again.';
        }
        emptyEl.classList.remove('hidden');
      }
    }
  }

  // ============================================
  // VALIDATION
  // ============================================

  function validateCurrentStep() {
    const step = state.currentStep;

    switch (step) {
      case 'format':
        if (!state.format) {
          showMessage('Please select a program format.', true);
          return false;
        }
        break;

      case 'program':
        if (!state.program) {
          showMessage('Please select a program.', true);
          return false;
        }
        break;

      case 'blocks':
        // Full program or at least one block
        const fullRadio = qs('input[name="attendanceType"]:checked');
        const blockCheckboxes = qsa('input[name="attendanceBlocks"]:checked');

        if (fullRadio && fullRadio.value === 'full') {
          state.attendanceType = 'Full';
          state.attendanceBlocks = [];
        } else if (blockCheckboxes.length > 0) {
          state.attendanceBlocks = blockCheckboxes.map(cb => cb.value);
          state.attendanceType = state.attendanceBlocks.join(', ');
        } else {
          showMessage('Please select Full Program or at least one block.', true);
          return false;
        }
        break;

      case 'session':
        if (!state.sessionId) {
          showMessage('Please select a session.', true);
          return false;
        }
        break;

      case 'contact':
        const firstName = qs('#firstName')?.value.trim();
        const lastName = qs('#lastName')?.value.trim();
        const phone = qs('#phone')?.value.trim();
        const email = qs('#email')?.value.trim();

        let hasError = false;

        if (!firstName) {
          showFieldError('firstNameError', 'First name is required');
          hasError = true;
        } else {
          clearFieldError('firstNameError');
        }

        if (!lastName) {
          showFieldError('lastNameError', 'Last name is required');
          hasError = true;
        } else {
          clearFieldError('lastNameError');
        }

        if (!phone) {
          showFieldError('phoneError', 'Phone is required');
          hasError = true;
        } else {
          clearFieldError('phoneError');
        }

        if (!email || !email.includes('@')) {
          showFieldError('emailError', 'Valid email is required');
          hasError = true;
        } else {
          clearFieldError('emailError');
        }

        if (hasError) {
          showMessage('Please fill in all required fields.', true);
          return false;
        }

        // Store values
        state.contactFirstName = firstName;
        state.contactLastName = lastName;
        state.contactPhone = phone;
        state.contactEmail = email;
        state.contactTitle = qs('#contactTitle')?.value.trim() || '';
        state.contactCompany = qs('#company')?.value.trim() || '';
        break;

      case 'payment':
        const paymentMethod = qs('input[name="paymentMethod"]:checked')?.value;
        if (!paymentMethod) {
          showMessage('Please select a payment method.', true);
          return false;
        }
        state.paymentMethod = paymentMethod;

        if (paymentMethod === 'invoice') {
          // Validate billing fields
          const billingName = qs('#billingContactName')?.value.trim();
          const billingEmail = qs('#billingContactEmail')?.value.trim();
          const billingAddress = qs('#billingAddress')?.value.trim();
          const billingCity = qs('#billingCity')?.value.trim();
          const billingSt = qs('#billingState')?.value.trim();
          const billingZip = qs('#billingZip')?.value.trim();

          let billingError = false;

          if (!billingName) {
            showFieldError('billingContactNameError', 'Billing contact name is required');
            billingError = true;
          } else {
            clearFieldError('billingContactNameError');
          }

          if (!billingEmail || !billingEmail.includes('@')) {
            showFieldError('billingContactEmailError', 'Valid billing email is required');
            billingError = true;
          } else {
            clearFieldError('billingContactEmailError');
          }

          if (!billingAddress) {
            showFieldError('billingAddressError', 'Billing address is required');
            billingError = true;
          } else {
            clearFieldError('billingAddressError');
          }

          if (!billingCity) {
            showFieldError('billingCityError', 'City is required');
            billingError = true;
          } else {
            clearFieldError('billingCityError');
          }

          if (!billingSt) {
            showFieldError('billingStateError', 'State is required');
            billingError = true;
          } else {
            clearFieldError('billingStateError');
          }

          if (!billingZip) {
            showFieldError('billingZipError', 'ZIP code is required');
            billingError = true;
          } else {
            clearFieldError('billingZipError');
          }

          if (billingError) {
            showMessage('Please fill in all required billing fields.', true);
            return false;
          }

          // Store billing values
          state.billingContactName = billingName;
          state.billingContactEmail = billingEmail;
          state.billingAddress = billingAddress;
          state.billingCity = billingCity;
          state.billingState = billingSt;
          state.billingZip = billingZip;
          state.billingPO = qs('#billingPO')?.value.trim() || '';
          state.billingNotes = qs('#billingNotes')?.value.trim() || '';
        }
        break;
    }

    clearMessage();
    return true;
  }

  function showFieldError(id, message) {
    const el = qs(`#${id}`);
    if (el) {
      el.textContent = message;
      el.classList.add('visible');
    }
  }

  function clearFieldError(id) {
    const el = qs(`#${id}`);
    if (el) {
      el.textContent = '';
      el.classList.remove('visible');
    }
  }

  function showMessage(message, isError = false) {
    const el = qs('#globalMessage');
    if (el) {
      el.textContent = message;
      el.classList.remove('hidden', 'error', 'success');
      el.classList.add(isError ? 'error' : 'success');
    }
  }

  function clearMessage() {
    const el = qs('#globalMessage');
    if (el) {
      el.textContent = '';
      el.classList.add('hidden');
    }
  }

  function showLoading(message = 'Processing...') {
    const overlay = qs('#loadingOverlay');
    const msg = overlay?.querySelector('.loading-message');
    if (overlay) {
      overlay.classList.remove('hidden');
      overlay.setAttribute('aria-hidden', 'false');
    }
    if (msg) msg.textContent = message;
  }

  function hideLoading() {
    const overlay = qs('#loadingOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.setAttribute('aria-hidden', 'true');
    }
  }

  // ============================================
  // COUPON HANDLING
  // ============================================

  async function applyCoupon() {
    const codeInput = qs('#couponCode');
    const message = qs('#couponMessage');
    const btn = qs('#applyCouponBtn');

    if (!codeInput || !message) return;

    const code = codeInput.value.trim().toUpperCase();

    // If already applied, remove it
    if (state.coupon) {
      state.coupon = null;
      state.couponDiscount = 0;
      message.textContent = '';
      message.className = 'coupon-message';
      codeInput.disabled = false;
      if (btn) btn.textContent = 'Apply';
      updatePricing();
      return;
    }

    if (!code) {
      message.textContent = 'Enter a coupon code';
      message.className = 'coupon-message error';
      return;
    }

    if (btn) btn.textContent = 'Applying...';
    if (btn) btn.disabled = true;

    try {
      // Check local rules first
      const isFull = state.attendanceType === 'Full' || !state.attendanceBlocks.length;
      const blocksCount = state.attendanceBlocks.length;
      const rule = COUPON_RULES[code];

      if (rule) {
        // Check program restriction
        if (rule.programs.length > 0 && !rule.programs.includes(state.program)) {
          message.textContent = 'Coupon not valid for this program.';
          message.className = 'coupon-message error';
          return;
        }

        // Check allowed function
        if (!rule.allowed(isFull, blocksCount)) {
          message.textContent = isFull ? 'Coupon valid only for block registrations.' : 'Coupon valid only for full program.';
          message.className = 'coupon-message error';
          return;
        }

        // Apply discount
        const discount = rule.type === 'Percent' ? Math.round(state.basePrice * (rule.amount / 100)) : rule.amount;
        state.coupon = { fields: { 'Coupon Code': code } };
        state.couponDiscount = Math.min(discount, state.basePrice);
        message.textContent = '✓ Coupon applied!';
        message.className = 'coupon-message success';
        codeInput.disabled = true;
        if (btn) btn.textContent = 'Remove';
        updatePricing();
        return;
      }

      // If not in local rules, try Airtable
      const filter = `LOWER({Coupon Code})='${code.toLowerCase().replace(/'/g, "\\'")}'`;
      const data = await airtableList(TABLE_COUPONS, { filterByFormula: filter, maxRecords: 1 });
      const rec = (data.records || [])[0];

      if (!rec) {
        message.textContent = 'Invalid coupon code.';
        message.className = 'coupon-message error';
        return;
      }

      const fields = rec.fields || {};
      const isActive = fields['Active?'] === true || String(fields['Active?']).toLowerCase() === 'true';
      const exp = fields['Expiration Date'] ? new Date(fields['Expiration Date']) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!isActive) {
        message.textContent = 'Coupon is not active.';
        message.className = 'coupon-message error';
        return;
      }

      if (exp && exp < today) {
        message.textContent = 'Coupon has expired.';
        message.className = 'coupon-message error';
        return;
      }

      const amount = Number(fields['Discount Amount'] || 0);
      const dtype = String(fields['Discount Type'] || 'Flat');
      const discount = dtype.toLowerCase() === 'percent' ? Math.round(state.basePrice * (amount / 100)) : amount;

      state.coupon = rec;
      state.couponDiscount = Math.min(discount, state.basePrice);
      message.textContent = '✓ Coupon applied!';
      message.className = 'coupon-message success';
      codeInput.disabled = true;
      if (btn) btn.textContent = 'Remove';
      updatePricing();

    } catch (err) {
      console.error('Coupon error:', err);
      message.textContent = 'Error validating coupon.';
      message.className = 'coupon-message error';
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // ============================================
  // SUBMISSION
  // ============================================

  function buildRegistrationCode() {
    const formatCode = { 'In-Person': 'IP', 'Virtual': 'VI', 'On-Demand': 'OD' }[state.format] || 'XX';
    const programCode = BLOCK_PROGRAM_MAP[state.program]?.code || state.program?.charAt(0)?.toUpperCase() || 'P';
    const isFull = state.attendanceType === 'Full' || !state.attendanceBlocks.length;
    const blockCode = isFull ? 'F' : state.attendanceBlocks.map(b => b.replace(/\D/g, '')).join('');

    const cityCode = (state.city || 'ONL').substring(0, 3).toUpperCase();
    const date = state.derivedStart || new Date();
    const mmyy = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getFullYear()).slice(-2)}`;

    return `${formatCode}-${programCode}${blockCode}-${cityCode}-${mmyy}`;
  }

  async function submitRegistration() {
    showLoading('Submitting registration...');

    try {
      const f = state.sessionRecord?.fields || {};
      const isFull = state.attendanceType === 'Full' || !state.attendanceBlocks.length;
      const registrationCode = buildRegistrationCode();

      const payload = {
        first_name: state.contactFirstName,
        last_name: state.contactLastName,
        title: state.contactTitle,
        company_name: state.contactCompany,
        phone: state.contactPhone,
        email: state.contactEmail,
        selected_program: state.program,
        program_format: state.format,
        selected_location: (f['City'] && f['State']) ? `${f['City']}, ${f['State']}` : (f['City'] || f['State'] || 'Online'),
        program_start_date: state.derivedStart ? formatYMDLocal(state.derivedStart) : (f['Session Start Date'] || ''),
        program_end_date: state.derivedEnd ? formatYMDLocal(state.derivedEnd) : (f['Session End Date'] || ''),
        attendance_type__3_block_programs: isFull ? 'Full' : state.attendanceType,
        coupon_code_used: state.coupon?.fields?.['Coupon Code'] || '',
        discount_amount: state.couponDiscount || 0,
        registration_code: registrationCode,
        amount_due: state.amountDue,
        payment_method: state.paymentMethod,
        payment_status: state.paymentMethod === 'stripe' ? 'paid' : 'pending'
      };

      // Add billing info if invoice
      if (state.paymentMethod === 'invoice') {
        payload.billing_contact_name = state.billingContactName;
        payload.billing_contact_email = state.billingContactEmail;
        payload.billing_address = state.billingAddress;
        payload.billing_city = state.billingCity;
        payload.billing_state = state.billingState;
        payload.billing_zip = state.billingZip;
        payload.billing_po_number = state.billingPO;
        payload.billing_notes = state.billingNotes;
      }

      await submitToGHL(payload);

      hideLoading();

      // Show appropriate confirmation
      if (state.paymentMethod === 'invoice') {
        populateInvoiceConfirmation();
        showStep('confirm-invoice');
      } else {
        populatePaidConfirmation();
        showStep('confirm-paid');
      }

      // Hide sidebar on confirmation
      const sidebar = qs('#registerSidebar');
      if (sidebar) sidebar.classList.add('hidden');

    } catch (err) {
      console.error('Submission error:', err);
      hideLoading();
      showMessage('There was an error submitting your registration. Please try again.', true);
    }
  }

  async function processStripePayment() {
    if (!state.stripe || !state.cardElement) {
      showMessage('Payment system not ready. Please refresh and try again.', true);
      return false;
    }

    showLoading('Processing payment...');

    try {
      // Create PaymentIntent on server
      const intentRes = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(state.amountDue * 100), // Stripe uses cents
          email: state.contactEmail,
          description: `${state.program} - ${state.format}`,
          metadata: {
            program: state.program,
            format: state.format,
            firstName: state.contactFirstName,
            lastName: state.contactLastName
          }
        })
      });

      if (!intentRes.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await intentRes.json();

      // Confirm payment with Stripe
      const { error, paymentIntent } = await state.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: state.cardElement,
          billing_details: {
            name: `${state.contactFirstName} ${state.contactLastName}`,
            email: state.contactEmail,
            phone: state.contactPhone
          }
        }
      });

      if (error) {
        hideLoading();
        const cardErrors = qs('#card-errors');
        if (cardErrors) cardErrors.textContent = error.message;
        showMessage(error.message, true);
        return false;
      }

      if (paymentIntent.status === 'succeeded') {
        return true;
      }

      hideLoading();
      showMessage('Payment was not completed. Please try again.', true);
      return false;

    } catch (err) {
      console.error('Stripe error:', err);
      hideLoading();
      showMessage('Payment processing failed. Please try again.', true);
      return false;
    }
  }

  // ============================================
  // CONFIRMATION PAGE POPULATION
  // ============================================

  function populateInvoiceConfirmation() {
    const name = `${state.contactFirstName} ${state.contactLastName}`;

    qs('#confInvoiceProgram').textContent = state.program;
    qs('#confInvoiceName').textContent = name;
    qs('#confInvoiceEmail').textContent = state.contactEmail;
    qs('#confInvoiceProgramName').textContent = state.program;
    qs('#confInvoicePrice').textContent = formatCurrency(state.amountDue);

    const formatBadge = qs('#confInvoiceFormatBadge');
    if (formatBadge) {
      formatBadge.textContent = state.format.toUpperCase();
    }

    // Dates & Location
    const datesRow = qs('#confInvoiceDatesRow');
    const locationRow = qs('#confInvoiceLocationRow');

    if (state.format === 'On-Demand') {
      if (datesRow) datesRow.style.display = 'none';
      if (locationRow) {
        locationRow.style.display = 'flex';
        qs('#confInvoiceLocation').textContent = 'Online (Self-Paced)';
      }
    } else {
      if (state.derivedStart && state.derivedEnd) {
        qs('#confInvoiceDates').textContent = formatHumanRange(state.derivedStart, state.derivedEnd);
      }
      if (state.city || state.state) {
        qs('#confInvoiceLocation').textContent = state.city && state.state ? `${state.city}, ${state.state}` : (state.city || state.state);
      } else if (state.format === 'Virtual') {
        qs('#confInvoiceLocation').textContent = 'Virtual Classroom';
      }
    }
  }

  function populatePaidConfirmation() {
    const name = `${state.contactFirstName} ${state.contactLastName}`;

    qs('#confPaidProgram').textContent = state.program;
    qs('#confPaidName').textContent = name;
    qs('#confPaidEmail').textContent = state.contactEmail;
    qs('#confPaidProgramName').textContent = state.program;
    qs('#confPaidPrice').textContent = formatCurrency(state.amountDue);

    const formatBadge = qs('#confPaidFormatBadge');
    if (formatBadge) {
      formatBadge.textContent = state.format.toUpperCase();
    }

    // Dates & Location
    const datesRow = qs('#confPaidDatesRow');
    const locationRow = qs('#confPaidLocationRow');

    if (state.format === 'On-Demand') {
      if (datesRow) datesRow.style.display = 'none';
      if (locationRow) {
        locationRow.style.display = 'flex';
        qs('#confPaidLocation').textContent = 'Online (Self-Paced)';
      }
    } else {
      if (state.derivedStart && state.derivedEnd) {
        qs('#confPaidDates').textContent = formatHumanRange(state.derivedStart, state.derivedEnd);
      }
      if (state.city || state.state) {
        qs('#confPaidLocation').textContent = state.city && state.state ? `${state.city}, ${state.state}` : (state.city || state.state);
      } else if (state.format === 'Virtual') {
        qs('#confPaidLocation').textContent = 'Virtual Classroom';
      }
    }
  }

  // ============================================
  // STRIPE INITIALIZATION
  // ============================================

  function initStripe() {
    // Get publishable key from config
    // Add STRIPE_PUBLISHABLE_KEY to your js/env-config.local.js file:
    // window.ENV_CONFIG = { STRIPE_PUBLISHABLE_KEY: 'pk_test_xxx', ... }
    const publishableKey = typeof ENV_CONFIG !== 'undefined' ? ENV_CONFIG.STRIPE_PUBLISHABLE_KEY : null;

    if (!publishableKey) {
      console.warn('Stripe publishable key not configured. Add STRIPE_PUBLISHABLE_KEY to js/env-config.local.js');
      // Show user-friendly message in card element
      const cardEl = qs('#card-element');
      if (cardEl) {
        cardEl.innerHTML = '<p style="color: #dc2626; font-size: 14px;">Payment system not configured. Please contact support.</p>';
      }
      return;
    }

    state.stripe = Stripe(publishableKey);
    const elements = state.stripe.elements();

    state.cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#0f172a',
          fontFamily: 'Inter, system-ui, sans-serif',
          '::placeholder': { color: '#94a3b8' }
        },
        invalid: {
          color: '#dc2626',
          iconColor: '#dc2626'
        }
      }
    });

    const cardEl = qs('#card-element');
    if (cardEl) {
      state.cardElement.mount('#card-element');

      state.cardElement.on('change', (event) => {
        const errors = qs('#card-errors');
        if (errors) {
          errors.textContent = event.error ? event.error.message : '';
        }
      });
    }
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  function handleFormatSelection(e) {
    const value = e.target.value;
    if (value && FORMAT_SLUGS[value]) {
      state.format = FORMAT_SLUGS[value];

      // Re-evaluate steps if program has blocks
      if (state.program) {
        const hasBlocks = programHasBlocks(state.program);
        const blocksIndex = state.steps.indexOf('blocks');

        if (hasBlocks && blocksIndex === -1 && state.format !== 'On-Demand') {
          // Insert blocks step after program
          const programIndex = state.steps.indexOf('program');
          if (programIndex !== -1) {
            state.steps.splice(programIndex + 1, 0, 'blocks');
            buildStepperUI();
          }
        } else if (!hasBlocks && blocksIndex !== -1) {
          state.steps.splice(blocksIndex, 1);
          buildStepperUI();
        }
      }

      updateSidebar();
    }
  }

  function handleProgramSelection(e) {
    const slug = e.target.value;
    if (slug && PROGRAM_SLUGS[slug]) {
      state.program = PROGRAM_SLUGS[slug];

      // Check if we need to add/remove blocks step
      const hasBlocks = programHasBlocks(state.program);
      const blocksIndex = state.steps.indexOf('blocks');
      const programIndex = state.steps.indexOf('program');

      if (hasBlocks && blocksIndex === -1 && state.format !== 'On-Demand') {
        // Insert blocks step after program
        state.steps.splice(programIndex + 1, 0, 'blocks');
        buildStepperUI();
      } else if (!hasBlocks && blocksIndex !== -1) {
        state.steps.splice(blocksIndex, 1);
        buildStepperUI();
      }

      updateSidebar();
    }
  }

  function handleBlockSelection() {
    const fullRadio = qs('input[name="attendanceType"]:checked');
    const blockCheckboxes = qsa('input[name="attendanceBlocks"]:checked');

    if (fullRadio && fullRadio.value === 'full') {
      // Uncheck all block checkboxes
      qsa('input[name="attendanceBlocks"]').forEach(cb => cb.checked = false);
      state.attendanceType = 'Full';
      state.attendanceBlocks = [];
    } else if (blockCheckboxes.length > 0) {
      // Uncheck full radio
      const fullEl = qs('input[name="attendanceType"][value="full"]');
      if (fullEl) fullEl.checked = false;

      state.attendanceBlocks = blockCheckboxes.map(cb => cb.value);
      state.attendanceType = state.attendanceBlocks.join(', ');
    }

    updatePricing();
    updateSidebar();
  }

  function handlePaymentMethodSelection(e) {
    const value = e.target.value;
    state.paymentMethod = value;

    const billingForm = qs('#billingForm');
    const stripeForm = qs('#stripeForm');

    if (billingForm) billingForm.classList.toggle('hidden', value !== 'invoice');
    if (stripeForm) stripeForm.classList.toggle('hidden', value !== 'stripe');

    // Initialize Stripe if not already done
    if (value === 'stripe' && !state.stripe) {
      initStripe();
    }
  }

  async function handleNextClick() {
    if (!validateCurrentStep()) return;

    const currentIndex = state.steps.indexOf(state.currentStep);

    // Special handling based on step
    switch (state.currentStep) {
      case 'program':
        // Populate blocks if needed
        if (state.steps.includes('blocks')) {
          populateBlockOptions();
        }
        break;

      case 'blocks':
        // Recalculate pricing
        updatePricing();
        break;
    }

    // If going to session step, load sessions
    const nextIndex = currentIndex + 1;
    if (nextIndex < state.steps.length && state.steps[nextIndex] === 'session') {
      await loadSessions();
    }

    goToNextStep();
  }

  async function handleSubmitClick() {
    if (!validateCurrentStep()) return;

    if (state.paymentMethod === 'stripe') {
      const success = await processStripePayment();
      if (!success) return;
    }

    await submitRegistration();
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    // Parse URL parameters
    const urlParams = parseURLParams();

    // Handle direct confirmation page access
    if (urlParams.confirmed === 'invoice') {
      showStep('confirm-invoice');
      return;
    }
    if (urlParams.confirmed === 'paid') {
      showStep('confirm-paid');
      return;
    }

    // Determine required steps based on URL params
    state.steps = determineSteps(urlParams);

    // Build stepper UI
    buildStepperUI();

    // Populate program options
    populateProgramOptions();

    // Show first step
    showStep(state.steps[0]);

    // Update sidebar with any pre-filled data
    updateSidebar();

    // If session was pre-filled, fetch the record
    if (state.sessionId && state.program && state.format) {
      loadSessions();
    }

    // Event Listeners
    // Format selection
    qsa('input[name="format"]').forEach(radio => {
      radio.addEventListener('change', handleFormatSelection);
    });

    // Program selection (delegated since options are dynamically added)
    const programContainer = qs('#programOptions');
    if (programContainer) {
      programContainer.addEventListener('change', (e) => {
        if (e.target.name === 'program') {
          handleProgramSelection(e);
        }
      });
    }

    // Block selection (delegated)
    const blockContainer = qs('#blockOptions');
    if (blockContainer) {
      blockContainer.addEventListener('change', handleBlockSelection);
    }

    // Payment method selection
    qsa('input[name="paymentMethod"]').forEach(radio => {
      radio.addEventListener('change', handlePaymentMethodSelection);
    });

    // Coupon
    const applyCouponBtn = qs('#applyCouponBtn');
    if (applyCouponBtn) {
      applyCouponBtn.addEventListener('click', applyCoupon);
    }

    const couponInput = qs('#couponCode');
    if (couponInput) {
      couponInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyCoupon();
        }
      });
    }

    // Navigation
    const backBtn = qs('#backBtn');
    const nextBtn = qs('#nextBtn');
    const submitBtn = qs('#submitBtn');

    if (backBtn) backBtn.addEventListener('click', goToPreviousStep);
    if (nextBtn) nextBtn.addEventListener('click', handleNextClick);
    if (submitBtn) submitBtn.addEventListener('click', handleSubmitClick);

    // Prevent form submission
    const contactForm = qs('#contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => e.preventDefault());
    }
  }

  // Run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
