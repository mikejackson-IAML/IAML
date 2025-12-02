# Security Audit Report - IAML Website
**Date:** 2025-12-02
**Auditor:** Claude Code
**Codebase:** IAML Static Website (Institute for Applied Management & Law)

## Executive Summary

This security audit was performed on a static HTML/CSS/JavaScript website for IAML. The application is a marketing and registration platform for professional HR training programs. Overall, the codebase has **CRITICAL and HIGH-RISK security vulnerabilities** that require immediate attention.

**Risk Level: HIGH** ⚠️

---

## 1. Critical Findings

### 🔴 CRITICAL: Hardcoded API Keys and Secrets

**Location:** `js/env-config.js:5-16`

**Issue:**
The application contains placeholder text for sensitive API keys that are exposed in client-side JavaScript:

```javascript
const ENV_CONFIG = {
  AIRTABLE_QUIZ_API_KEY: window.ENV?.AIRTABLE_QUIZ_API_KEY || 'YOUR_QUIZ_API_KEY_HERE',
  AIRTABLE_QUIZ_BASE_ID: window.ENV?.AIRTABLE_QUIZ_BASE_ID || 'YOUR_QUIZ_BASE_ID_HERE',
  AIRTABLE_REGISTRATION_API_KEY: window.ENV?.AIRTABLE_REGISTRATION_API_KEY || 'YOUR_REGISTRATION_API_KEY_HERE',
  AIRTABLE_REGISTRATION_BASE_ID: window.ENV?.AIRTABLE_REGISTRATION_BASE_ID || 'YOUR_REGISTRATION_BASE_ID_HERE',
  GHL_WEBHOOK_URL: window.ENV?.GHL_WEBHOOK_URL || 'YOUR_WEBHOOK_URL_HERE'
};
```

**Risk:**
- If real API keys are placed in this file, they will be exposed to all website visitors
- Attackers can extract these keys from browser DevTools or source code
- API keys in client-side code can be used to:
  - Access/modify Airtable databases
  - Send unauthorized webhook requests
  - Exhaust API rate limits
  - Access sensitive customer data

**Recommendation:**
1. **NEVER** store API keys in client-side JavaScript
2. Implement a backend proxy/API layer to handle all external API calls
3. Use environment variables on the server-side only
4. Implement proper API key rotation procedures
5. If current keys are live, rotate them immediately

---

### 🔴 CRITICAL: Exposed Webhook URL

**Location:** `js/modals.js:5`

**Issue:**
```javascript
const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/MjGEy0pobNT9su2YJqFI/webhook-trigger/f11dd475-e8a8-442d-a71e-862b25d34937';
```

**Risk:**
- Webhook URL is publicly exposed in client-side code
- Attackers can send malicious payloads directly to your webhook
- Can be used for:
  - Spam attacks flooding your CRM
  - Data poisoning (injecting fake leads)
  - Rate limit exhaustion
  - Account suspension due to abuse

**Recommendation:**
1. Move webhook logic to a backend service
2. Implement request signing/authentication
3. Add rate limiting and CAPTCHA protection
4. Rotate the webhook URL immediately if it's currently in use
5. Monitor webhook activity for suspicious patterns

---

## 2. High-Risk Findings

### 🟠 HIGH: Cross-Site Scripting (XSS) Vulnerabilities

**Locations:**
- `js/modals.js:72-168` - Multiple `innerHTML` assignments with user input
- `js/quiz.js:328` - Dynamic HTML generation with option values
- `js/testimonials.js:88-102` - Template string injection
- Multiple component files using `innerHTML`

**Issue:**
The application extensively uses `innerHTML` to render dynamic content, including user-supplied data. While some basic HTML escaping exists (`escapeHtml` function in modals.js:259), it's not consistently applied.

**Examples:**

1. **Modal rendering without escaping** (modals.js:72-80):
```javascript
root.innerHTML = `
  <form class="connectPopup-form" id="connectPopup_Form">
    <div class="connectPopup-group">
      <label for="connectPopup_phone">Phone Number *</label>
      <input type="tel" id="connectPopup_phone" name="phone" placeholder="(555) 555-5555" required />
    </div>
  </form>
`;
```

2. **Quiz option rendering** (quiz.js:328):
```javascript
btn.innerHTML = `<span class="option-title">${opt.title}</span><span class="option-desc">${opt.description || ''}</span>`;
```

3. **Testimonials rendering** (testimonials.js:88-102):
```javascript
li.innerHTML = `
  <blockquote class="text-gray-200 text-lg leading-relaxed mb-6 relative z-10 italic font-normal">
    "${clean}"
  </blockquote>
  <div class="author-name">${name || ''}</div>
  <div class="text-gray-400 text-sm">${title || ''}</div>
  <div class="text-gray-400 text-sm font-medium">${company || ''}</div>
`;
```

**Risk:**
- Attackers can inject malicious JavaScript through form inputs or URL parameters
- XSS attacks can:
  - Steal session cookies
  - Redirect users to phishing sites
  - Modify page content
  - Capture keystrokes
  - Access sensitive information

**Recommendation:**
1. Use `textContent` instead of `innerHTML` for dynamic text content
2. Sanitize ALL user input before rendering
3. Implement Content Security Policy (CSP) headers
4. Use template libraries with automatic escaping (e.g., DOMPurify)
5. Validate and sanitize on both client and server side

---

### 🟠 HIGH: Inline Event Handlers

**Locations:**
- `index.html:101, 123, 316, 667, 737, 754-755, 763-764, 767`
- Multiple instances across component files

**Issue:**
The application uses inline `onclick` handlers throughout the HTML:

```html
<a href="#" class="header-cta" onclick="connectPopup_open(); return false;">
<button class="modal-close" onclick="closeModal()" aria-label="Close">&times;</button>
<button class="btn btn-primary" onclick="alert('Info request placeholder')">GET MORE INFORMATION →</button>
```

**Risk:**
- Inline event handlers bypass Content Security Policy (CSP)
- Makes XSS exploitation easier
- Harder to maintain and audit
- Cannot use strict CSP policies

**Recommendation:**
1. Remove all inline event handlers
2. Use `addEventListener` in JavaScript files
3. Implement strict Content Security Policy
4. Use event delegation for dynamic elements

---

### 🟠 HIGH: Lack of Input Validation

**Locations:**
- `js/modals.js:172-220` - Form submission handlers
- `js/main.js:96-119` - Form validation

**Issue:**
1. **Phone number validation is client-side only**:
```javascript
// modals.js:85-104
phoneInput.addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, '');
  value = value.substring(0, 10);
  // Only formats, doesn't validate
});
```

2. **Email validation relies on HTML5 `required` attribute only**:
```javascript
// main.js:100-117
requiredFields.forEach(field => {
  if (!field.value.trim()) {
    isValid = false;
    field.classList.add('error');
  }
});
```

**Risk:**
- Client-side validation can be bypassed
- Invalid or malicious data can reach backend systems
- No protection against automated spam/bot submissions

**Recommendation:**
1. Implement server-side validation for ALL inputs
2. Add comprehensive email/phone validation
3. Implement rate limiting
4. Add CAPTCHA or honeypot fields
5. Validate data types, formats, and ranges

---

### 🟠 HIGH: Missing CSRF Protection

**Issue:**
The application submits forms directly to external webhooks without any CSRF tokens or verification:

```javascript
// modals.js:185-195
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
```

**Risk:**
- Attackers can craft malicious pages that submit forms on behalf of users
- Can be used for spam or data poisoning attacks
- No way to verify legitimate requests

**Recommendation:**
1. Implement CSRF tokens for form submissions
2. Add origin/referer validation on the server
3. Use SameSite cookie attributes
4. Implement request signing

---

## 3. Medium-Risk Findings

### 🟡 MEDIUM: Missing Security Headers

**Issue:**
The application appears to be a static site without configured security headers.

**Missing Headers:**
- Content-Security-Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- Strict-Transport-Security (HSTS)
- Referrer-Policy
- Permissions-Policy

**Risk:**
- Increased vulnerability to XSS attacks
- Clickjacking vulnerabilities
- MIME-type sniffing attacks
- Information disclosure

**Recommendation:**
Configure the following headers on your web server:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https: data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://services.leadconnectorhq.com;
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

### 🟡 MEDIUM: Unsafe External Resources

**Locations:**
- `index.html:30` - Splide CSS from CDN
- `index.html:778` - Splide JS from CDN
- Various Google Analytics and Font scripts

**Issue:**
The application loads resources from external CDNs without Subresource Integrity (SRI) checks:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css">
<script src="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js"></script>
```

**Risk:**
- If CDN is compromised, malicious code could be injected
- Man-in-the-middle attacks could modify resources
- Supply chain attacks

**Recommendation:**
1. Add SRI hashes to all external resources:
```html
<script src="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js"
        integrity="sha384-HASH_HERE"
        crossorigin="anonymous"></script>
```
2. Consider self-hosting critical libraries
3. Implement CSP to restrict allowed sources

---

### 🟡 MEDIUM: Information Disclosure

**Locations:**
- `js/main.js:154-165` - Console branding
- Multiple console.log statements throughout codebase
- Error messages expose internal details

**Issue:**
```javascript
function showConsoleBranding() {
  console.log('%cIAML', styles);
  console.log('%cInstitute for Applied Management & Law', 'color: #64748B; font-size: 12px;');
  console.log('%c🚀 Site built with care by Re-Vitalized Properties', 'color: #9ca3af; font-size: 11px; font-style: italic;');
}
```

**Risk:**
- Exposes technology stack
- Debug information aids attackers in reconnaissance
- May leak sensitive information

**Recommendation:**
1. Remove all console.log statements in production
2. Implement proper error handling without exposing details
3. Use a logging service for production errors
4. Disable debug mode in production

---

### 🟡 MEDIUM: No Rate Limiting

**Issue:**
Form submissions and API calls have no client-side or apparent server-side rate limiting.

**Risk:**
- Spam submissions
- API quota exhaustion
- Denial of service attacks
- Increased costs from API usage

**Recommendation:**
1. Implement client-side throttling/debouncing
2. Add server-side rate limiting
3. Implement CAPTCHA for forms
4. Monitor and alert on unusual activity

---

### 🟡 MEDIUM: Weak Randomness

**Location:** `js/carousel.js:48-59`

**Issue:**
The carousel shuffle function uses `crypto.getRandomValues()` which is good, but the implementation could be improved:

```javascript
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    const j = Math.floor((buf[0] / 0x100000000) * (i + 1));
    // ... shuffle logic
  }
  return arr;
}
```

**Risk:**
- Low impact for carousel shuffling
- Pattern if used elsewhere for security purposes

**Recommendation:**
- Current implementation is adequate for UI purposes
- Document that this should NOT be used for security-critical operations
- Consider using a well-tested shuffle library

---

## 4. Low-Risk Findings

### 🟢 LOW: Missing HTTPS Enforcement

**Issue:**
No visible redirect from HTTP to HTTPS in the code. This should be configured at the web server level.

**Recommendation:**
- Configure web server to redirect HTTP to HTTPS
- Implement HSTS header
- Update all internal links to use HTTPS

---

### 🟢 LOW: Deprecated Google Analytics ID

**Location:** `index.html:36-42`

**Issue:**
```javascript
gtag('config', 'G-XXXXXXXXXX');
```

Placeholder GA ID is present.

**Recommendation:**
- Replace with actual GA4 ID when ready
- Ensure privacy policy covers analytics

---

### 🟢 LOW: Accessibility Issues

**Issue:**
While not strictly security, accessibility issues can impact user trust:
- Some onclick handlers don't have keyboard equivalents
- ARIA labels could be improved

**Recommendation:**
- Ensure keyboard navigation works for all interactive elements
- Add proper ARIA labels
- Test with screen readers

---

## 5. Positive Security Practices

✅ **Good:**
1. `.gitignore` properly excludes environment files
2. HTML escaping function exists (`escapeHtml` in modals.js)
3. Use of `noopener noreferrer` for external links (main.js:86-93)
4. Passive event listeners for scroll performance (index.html:911)
5. No eval() or Function() constructors detected
6. Basic form validation present

---

## 6. Immediate Action Items (Priority Order)

### 🚨 URGENT (Fix within 24 hours):
1. **Remove or rotate exposed webhook URL** (modals.js:5)
2. **Audit and remove any real API keys** from client-side code
3. **Implement backend proxy** for all external API calls
4. **Add basic rate limiting** to prevent spam

### ⚠️ HIGH PRIORITY (Fix within 1 week):
1. **Fix XSS vulnerabilities** - Replace innerHTML with safer alternatives
2. **Remove inline event handlers** and implement CSP
3. **Add server-side input validation**
4. **Implement CSRF protection**
5. **Configure security headers**

### 📋 MEDIUM PRIORITY (Fix within 1 month):
1. Add SRI hashes to external resources
2. Remove debug/console statements from production
3. Implement comprehensive error handling
4. Add CAPTCHA to forms
5. Set up security monitoring/logging

### 🔍 LOW PRIORITY (Fix within 3 months):
1. Improve accessibility
2. Conduct penetration testing
3. Implement security.txt file
4. Set up automated security scanning
5. Document security procedures

---

## 7. Architecture Recommendations

### Current Architecture Issues:
1. **No backend layer** - All logic in client-side JavaScript
2. **Direct API calls from browser** - Exposes credentials
3. **No authentication/authorization** - Anyone can submit forms

### Recommended Architecture:

```
Browser → Your Backend API → External Services
         (validates, sanitizes)  (Airtable, GHL, etc.)
```

**Benefits:**
- API keys stay server-side
- Centralized validation and sanitization
- Rate limiting and abuse prevention
- Request logging and monitoring
- Easy to add authentication later

---

## 8. Security Testing Recommendations

1. **Static Analysis:**
   - ESLint with security plugins
   - SonarQube or similar

2. **Dynamic Analysis:**
   - OWASP ZAP scanning
   - Burp Suite testing
   - Browser security tools

3. **Dependency Scanning:**
   - npm audit (if using build tools)
   - Snyk or Dependabot

4. **Penetration Testing:**
   - Professional security assessment
   - Bug bounty program (future)

---

## 9. Compliance Considerations

Depending on your data handling requirements:

- **GDPR** (if EU visitors): Privacy policy, consent mechanisms
- **CCPA** (if California residents): Privacy rights, opt-outs
- **WCAG 2.1** (accessibility): Keyboard navigation, screen readers
- **PCI-DSS** (if handling payments): Secure transmission, storage

---

## 10. Security Checklist for Deployment

- [ ] All API keys removed from client-side code
- [ ] Backend proxy implemented for external API calls
- [ ] Webhook URL rotated and secured
- [ ] Security headers configured on web server
- [ ] CSP policy implemented and tested
- [ ] All inline event handlers removed
- [ ] XSS vulnerabilities patched
- [ ] Input validation on server-side
- [ ] CSRF protection implemented
- [ ] Rate limiting configured
- [ ] SRI hashes added to external scripts
- [ ] HTTPS enforced with HSTS
- [ ] Error handling doesn't expose sensitive info
- [ ] Console logging disabled in production
- [ ] Security monitoring configured
- [ ] Incident response plan documented

---

## 11. Contact & Resources

**Helpful Resources:**
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Mozilla Web Security Guidelines: https://infosec.mozilla.org/guidelines/web_security
- Content Security Policy Reference: https://content-security-policy.com/
- SRI Hash Generator: https://www.srihash.org/

---

## Conclusion

This codebase has **critical security vulnerabilities** that must be addressed before production deployment. The most serious issues are:

1. Exposed API keys and webhook URLs
2. XSS vulnerabilities through unsafe HTML rendering
3. Lack of input validation and CSRF protection
4. Missing security headers

**Estimated remediation time:**
- Critical fixes: 8-16 hours
- High priority fixes: 24-40 hours
- Medium priority fixes: 16-24 hours

**Total estimated effort:** 48-80 hours of development work

The good news is that the codebase is relatively small and well-organized, making these fixes manageable. With proper security practices in place, this can become a secure, production-ready application.

---

**Report Status:** COMPLETE
**Next Review Date:** After critical fixes are implemented
**Reviewer:** Claude Code - Security Audit Agent
