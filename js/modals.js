// Modal Systems - Registration, Contact, Popup modals
// Handles all modal functionality across the site

// ===== SECURITY NOTE =====
// CRITICAL: The webhook URL below should be moved to a backend proxy
// Exposing this in client-side code allows anyone to send requests to your webhook
// See SECURITY_AUDIT_REPORT.md for details on implementing a secure backend
// ===== END SECURITY NOTE =====

// ===== CONTACT MODAL (Connect Popup) =====
const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/MjGEy0pobNT9su2YJqFI/webhook-trigger/f11dd475-e8a8-442d-a71e-862b25d34937';
const CONNECT_TIMEOUT_MS = 20000;

let connectTimeoutHandle = null;
let countdownInterval = null;
let lastSubmission = { firstName: '', phone: '' };

// Open/Close Functions
function connectPopup_open() {
  const modal = document.getElementById('connectPopup_Modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderStep('form');
  }
}

function connectPopup_close() {
  const modal = document.getElementById('connectPopup_Modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    clearTimeout(connectTimeoutHandle);
    clearInterval(countdownInterval);
  }
}

function connectPopup_closeOnOverlay(e) {
  if (e.target === e.currentTarget) connectPopup_close();
}

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') connectPopup_close();
});

// Countdown timer function
function startCountdown() {
  clearInterval(countdownInterval);
  let countdownValue = 20;

  countdownInterval = setInterval(() => {
    countdownValue--;

    const numEl = document.getElementById('countdown-number');
    const textEl = document.getElementById('countdown-text');
    const progressEl = document.getElementById('progress-circle');
    
    if (numEl) numEl.textContent = countdownValue;
    if (textEl) textEl.textContent = countdownValue;
    if (progressEl) {
      const offset = 138.23 * (1 - countdownValue / 20);
      progressEl.style.strokeDashoffset = offset;
    }

    if (countdownValue <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
}

// Step Renderer - Now using safe DOM manipulation instead of innerHTML
function renderStep(step, payload = {}) {
  const root = document.getElementById('connectPopup_Content');
  if (!root) return;

  // Clear existing content safely
  while (root.firstChild) {
    root.removeChild(root.firstChild);
  }

  if (step === 'form') {
    // Create intro paragraph
    const intro = document.createElement('p');
    intro.textContent = "We'll connect you with one of our program coordinators who can answer your questions and get you exactly what you need.";
    root.appendChild(intro);

    // Create form
    const form = document.createElement('form');
    form.className = 'connectPopup-form';
    form.id = 'connectPopup_Form';

    // Create form group
    const formGroup = document.createElement('div');
    formGroup.className = 'connectPopup-group';

    // Create label
    const label = document.createElement('label');
    label.setAttribute('for', 'connectPopup_phone');
    label.textContent = 'Phone Number *';
    formGroup.appendChild(label);

    // Create input
    const input = document.createElement('input');
    input.type = 'tel';
    input.id = 'connectPopup_phone';
    input.name = 'phone';
    input.placeholder = '(555) 555-5555';
    input.required = true;
    formGroup.appendChild(input);

    form.appendChild(formGroup);

    // Create submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'connectPopup-submitBtn';
    submitBtn.textContent = 'CONNECT';
    form.appendChild(submitBtn);

    root.appendChild(form);

    // Add event listeners
    form.addEventListener('submit', connectPopup_submit);

    // Phone number formatting with security utils
    input.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      value = value.substring(0, 10);

      let formattedValue = '';
      if (value.length > 0) {
        formattedValue = '(' + value.substring(0, 3);
      }
      if (value.length >= 4) {
        formattedValue += ') ' + value.substring(3, 6);
      }
      if (value.length >= 7) {
        formattedValue += '-' + value.substring(6, 10);
      }

      e.target.value = formattedValue;
    });
  }
  
  if (step === 'connecting') {
    // Create SVG elements safely (SVG requires special handling)
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'connectPopup-thinking';
    thinkingDiv.setAttribute('role', 'status');
    thinkingDiv.setAttribute('aria-live', 'polite');

    const pulseDiv = document.createElement('div');
    pulseDiv.className = 'phone-pulse-with-timer';
    pulseDiv.setAttribute('aria-hidden', 'true');

    // Create countdown SVG (safe to use innerHTML for SVG as no user input)
    const svgNS = 'http://www.w3.org/2000/svg';
    const countdownSvg = document.createElementNS(svgNS, 'svg');
    countdownSvg.setAttribute('class', 'countdown-circle');
    countdownSvg.setAttribute('viewBox', '0 0 50 50');

    const bgCircle = document.createElementNS(svgNS, 'circle');
    bgCircle.setAttribute('class', 'countdown-bg');
    bgCircle.setAttribute('cx', '25');
    bgCircle.setAttribute('cy', '25');
    bgCircle.setAttribute('r', '22');
    bgCircle.setAttribute('fill', 'none');
    bgCircle.setAttribute('stroke', '#28528c');
    bgCircle.setAttribute('stroke-width', '3');
    countdownSvg.appendChild(bgCircle);

    const progressCircle = document.createElementNS(svgNS, 'circle');
    progressCircle.setAttribute('class', 'countdown-progress');
    progressCircle.setAttribute('cx', '25');
    progressCircle.setAttribute('cy', '25');
    progressCircle.setAttribute('r', '22');
    progressCircle.setAttribute('fill', 'none');
    progressCircle.setAttribute('stroke', '#28528c');
    progressCircle.setAttribute('stroke-width', '3');
    progressCircle.setAttribute('stroke-linecap', 'round');
    progressCircle.setAttribute('transform', 'rotate(-90 25 25)');
    progressCircle.id = 'progress-circle';
    countdownSvg.appendChild(progressCircle);

    pulseDiv.appendChild(countdownSvg);

    // Create countdown number
    const countdownNum = document.createElement('div');
    countdownNum.className = 'countdown-number';
    countdownNum.id = 'countdown-number';
    countdownNum.textContent = '20';
    pulseDiv.appendChild(countdownNum);

    // Create phone icon SVG
    const phoneSvg = document.createElementNS(svgNS, 'svg');
    phoneSvg.setAttribute('class', 'phone-icon-small');
    phoneSvg.setAttribute('viewBox', '0 0 24 24');
    const phonePath = document.createElementNS(svgNS, 'path');
    phonePath.setAttribute('d', 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z');
    phoneSvg.appendChild(phonePath);
    pulseDiv.appendChild(phoneSvg);

    thinkingDiv.appendChild(pulseDiv);

    // Create muted text section
    const mutedDiv = document.createElement('div');
    mutedDiv.className = 'muted';

    const strong = document.createElement('strong');
    strong.textContent = 'Connecting you in ';
    const countdownSpan = document.createElement('span');
    countdownSpan.id = 'countdown-text';
    countdownSpan.textContent = '20';
    strong.appendChild(countdownSpan);
    strong.appendChild(document.createTextNode(' seconds...'));
    mutedDiv.appendChild(strong);

    const smallGap = document.createElement('div');
    smallGap.className = 'small-gap';
    smallGap.textContent = "We're matching you with the specialist who can best answer your questions about our programs, services, or any other support you need.";
    mutedDiv.appendChild(smallGap);

    thinkingDiv.appendChild(mutedDiv);
    root.appendChild(thinkingDiv);

    // Create footer message
    const footerP = document.createElement('p');
    footerP.className = 'muted';
    footerP.style.marginTop = '16px';
    footerP.textContent = "If a coordinator picks up, we'll connect you right away. Please keep this window open.";
    root.appendChild(footerP);

    // Start the countdown timer
    startCountdown();
  }
  
  if (step === 'email-fallback') {
    // Create wait text 1
    const waitText1 = document.createElement('div');
    waitText1.id = 'connectPopup_waitText1';
    waitText1.textContent = "We're still trying to connect you...";
    root.appendChild(waitText1);

    // Create wait text 2
    const waitText2 = document.createElement('div');
    waitText2.id = 'connectPopup_waitText2';
    waitText2.style.opacity = '0';
    waitText2.textContent = "Our coordinators are currently helping other professionals with their program decisions, but we don't want to delay your registration process. Let's get your questions answered via email instead.";
    root.appendChild(waitText2);

    // Create form
    const form = document.createElement('form');
    form.className = 'connectPopup-form';
    form.id = 'connectPopup_EmailForm';

    // Email field group
    const emailGroup = document.createElement('div');
    emailGroup.className = 'connectPopup-group';
    const emailLabel = document.createElement('label');
    emailLabel.setAttribute('for', 'connectPopup_email');
    emailLabel.textContent = 'Email *';
    emailGroup.appendChild(emailLabel);
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'connectPopup_email';
    emailInput.name = 'email';
    emailInput.placeholder = 'you@company.com';
    emailInput.required = true;
    emailGroup.appendChild(emailInput);
    form.appendChild(emailGroup);

    // Question field group
    const questionGroup = document.createElement('div');
    questionGroup.className = 'connectPopup-group';
    const questionLabel = document.createElement('label');
    questionLabel.setAttribute('for', 'connectPopup_question');
    questionLabel.textContent = 'Question *';
    questionGroup.appendChild(questionLabel);
    const questionTextarea = document.createElement('textarea');
    questionTextarea.rows = 4;
    questionTextarea.id = 'connectPopup_question';
    questionTextarea.name = 'question';
    questionTextarea.placeholder = 'submit your question';
    questionTextarea.required = true;
    questionGroup.appendChild(questionTextarea);
    form.appendChild(questionGroup);

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'connectPopup-submitBtn';
    submitBtn.textContent = 'GET ANSWERS NOW';
    form.appendChild(submitBtn);

    root.appendChild(form);

    // Fade in wait text 2
    requestAnimationFrame(() => setTimeout(() => {
      waitText2.style.opacity = '1';
    }, 1300));

    // Add form submit listener
    form.addEventListener('submit', connectPopup_submitEmailFallback);
  }

  if (step === 'success') {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = 'Thanks!';
    p.appendChild(strong);
    p.appendChild(document.createTextNode(" We've received your details and a coordinator will reach out shortly."));
    root.appendChild(p);
  }

  if (step === 'error') {
    const p1 = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = 'Hmm, something went wrong.';
    p1.appendChild(strong);
    root.appendChild(p1);

    const p2 = document.createElement('p');
    p2.className = 'muted';
    p2.textContent = payload.message || 'Please try again, or send your details by email below.';
    root.appendChild(p2);

    const retryBtn = document.createElement('button');
    retryBtn.className = 'connectPopup-submitBtn';
    retryBtn.textContent = 'Try Again';
    retryBtn.addEventListener('click', () => renderStep('form'));
    root.appendChild(retryBtn);
  }
}

// Submit: Connect attempt with improved validation and rate limiting
async function connectPopup_submit(e) {
  e.preventDefault();

  // Rate limiting check (3 seconds between submissions)
  if (typeof SecurityUtils !== 'undefined' && !SecurityUtils.rateLimiter.canSubmit('connect-form', 3000)) {
    renderStep('error', { message: 'Please wait a moment before submitting again.' });
    return;
  }

  const formData = new FormData(e.target);
  const firstName = (formData.get('firstName') || '').toString().trim();
  const phone = (formData.get('phone') || '').toString().trim();

  // Enhanced validation
  if (typeof SecurityUtils !== 'undefined') {
    // Validate phone number
    if (!SecurityUtils.isValidPhone(phone)) {
      renderStep('error', { message: 'Please enter a valid 10-digit phone number.' });
      return;
    }

    // Validate length to prevent excessive input
    if (!SecurityUtils.validateLength(phone, 10, 20)) {
      renderStep('error', { message: 'Phone number format is invalid.' });
      return;
    }
  }

  lastSubmission = { firstName, phone };

  renderStep('connecting');

  clearTimeout(connectTimeoutHandle);
  connectTimeoutHandle = setTimeout(() => renderStep('email-fallback'), CONNECT_TIMEOUT_MS);

  try {
    // SECURITY NOTE: This request goes directly to an external webhook
    // In production, this should go through your backend API
    const res = await fetch(GHL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        phone,
        tags: 'contact_button_initiated',
        source: 'Website Contact Form',
        contactType: 'lead'
      })
    });

    if (!res.ok) {
      const result = await safeJson(res);
      throw new Error(result?.message || `Request failed (${res.status})`);
    }

    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submit', {
        event_category: 'Contact',
        event_label: 'Connect Modal Success'
      });
    }
  } catch (err) {
    // Don't log full error details in production
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_error', {
        event_category: 'Contact',
        event_label: 'Connect Modal Error'
      });
    }
    clearTimeout(connectTimeoutHandle);
    renderStep('email-fallback');
  }
}

// Submit: Email fallback with improved validation
async function connectPopup_submitEmailFallback(e) {
  e.preventDefault();

  // Rate limiting check
  if (typeof SecurityUtils !== 'undefined' && !SecurityUtils.rateLimiter.canSubmit('email-fallback-form', 5000)) {
    renderStep('error', { message: 'Please wait a moment before submitting again.' });
    return;
  }

  const fd = new FormData(e.target);
  const email = (fd.get('email') || '').toString().trim();
  const question = (fd.get('question') || '').toString().trim();

  // Enhanced validation
  if (typeof SecurityUtils !== 'undefined') {
    // Validate email
    if (!SecurityUtils.isValidEmail(email)) {
      renderStep('error', { message: 'Please enter a valid email address.' });
      return;
    }

    // Validate lengths
    if (!SecurityUtils.validateLength(email, 5, 254)) {
      renderStep('error', { message: 'Email address is invalid.' });
      return;
    }

    if (!SecurityUtils.validateLength(question, 10, 2000)) {
      renderStep('error', { message: 'Question must be between 10 and 2000 characters.' });
      return;
    }

    // Strip dangerous characters
    const cleanQuestion = SecurityUtils.stripDangerousChars(question);
    if (cleanQuestion !== question) {
      renderStep('error', { message: 'Question contains invalid characters.' });
      return;
    }
  }

  const btn = e.target.querySelector('.connectPopup-submitBtn');
  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    // SECURITY NOTE: This request goes directly to an external webhook
    // In production, this should go through your backend API
    const res = await fetch(GHL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: lastSubmission.firstName,
        phone: lastSubmission.phone,
        email,
        question,
        tags: 'contact_button_email_fallback',
        source: 'Website Contact Form',
        contactType: 'lead'
      })
    });

    if (!res.ok) {
      const result = await safeJson(res);
      throw new Error(result?.message || `Request failed (${res.status})`);
    }

    renderStep('success', { firstName: lastSubmission.firstName });
  } catch (err) {
    // Don't expose error details
    renderStep('error', { message: "We couldn't send your message just now. Please try again." });
  }
}

// Helper - Safe JSON parsing

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// ===== RECOMMENDATION MODAL (Quiz Results) =====
function closeModal() {
  const modal = document.getElementById('recommendationModal');
  if (modal) modal.style.display = 'none';
  
  // Reset quiz if function exists
  if (typeof resetQuiz === 'function') {
    setTimeout(() => resetQuiz(), 400);
  }
}

// ===== FIRST VISIT POPUP MODAL =====
function initFirstVisitPopup() {
  const popup = document.getElementById('firstVisitPopup');
  if (!popup) return;
  
  // Check if user has seen popup before
  const hasSeenPopup = localStorage.getItem('iaml_popup_seen');
  
  if (!hasSeenPopup) {
    // Show popup after 3 seconds
    setTimeout(() => {
      popup.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }, 3000);
  }
}

function closeFirstVisitPopup() {
  const popup = document.getElementById('firstVisitPopup');
  if (popup) {
    popup.style.display = 'none';
    document.body.style.overflow = 'auto';
    localStorage.setItem('iaml_popup_seen', 'true');
  }
}

// Close on overlay click
document.addEventListener('click', (e) => {
  const popup = document.getElementById('firstVisitPopup');
  if (popup && e.target === popup) {
    closeFirstVisitPopup();
  }
});

// ===== CTA BUTTON WIRING =====
document.addEventListener('DOMContentLoaded', function() {
  // Wire up contact modal button
  const openContactBtn = document.getElementById('openContactModal');
  if (openContactBtn) {
    openContactBtn.addEventListener('click', function() {
      if (typeof connectPopup_open === 'function') {
        connectPopup_open();
      } else {
        const event = new CustomEvent('openContactModal');
        document.dispatchEvent(event);
      }
    });
  }
  
  // Initialize first visit popup
  initFirstVisitPopup();
});

// Make functions globally available
if (typeof window !== 'undefined') {
  window.connectPopup_open = connectPopup_open;
  window.connectPopup_close = connectPopup_close;
  window.connectPopup_closeOnOverlay = connectPopup_closeOnOverlay;
  window.renderStep = renderStep;
  window.closeModal = closeModal;
  window.closeFirstVisitPopup = closeFirstVisitPopup;
}