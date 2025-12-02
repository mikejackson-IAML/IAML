# Structured Development Workflow: The Correct Order

This document outlines the exact sequence and dependencies for building software features, designed for both human teams and specialized AI agents.

---

## Overview: The Three Critical Principles

### 1. **Sequential Dependencies**
Some tasks **must** be done in order because later tasks depend on earlier ones.

### 2. **Parallel Work**
Some tasks can happen **simultaneously** because they don't depend on each other.

### 3. **Integration Points**
Some tasks **must wait** for multiple other tasks to finish before they can proceed.

---

## Phase 0: Requirements & Planning (MUST BE FIRST)

**Status:** Gatekeeper - Nothing starts until this is done
**Owner:** Product Manager / Project Lead
**Time to Complete:** Minutes to hours depending on complexity

### What Happens Here
1. Define what needs to be built
2. Write user stories or requirements
3. Identify success criteria
4. Understand business goals

### Outputs Required
- Written requirements document
- User stories with acceptance criteria
- Mockups or wireframes (rough)
- List of data needed

### Example
```
REQUIREMENT: Build a course registration form

User Story:
"As a prospective student, I want to register for a course
so that I can secure my spot and receive confirmation."

Acceptance Criteria:
- Form collects name, email, phone, course selection
- Form validates all required fields
- System prevents duplicate registrations
- Confirmation email is sent on success
- User sees success message
```

### ⚠️ DEPENDENCY CHECK
**NOTHING can start until this phase is complete.**

---

## Phase 1: Design (HAPPENS AFTER Phase 0)

**Status:** Dependent on Phase 0
**Owner:** Design Agent / UI/UX Designer
**Time to Complete:** Hours to days depending on complexity
**CAN START:** Once Phase 0 is complete

### What Happens Here
1. Read the requirements
2. Create visual design
3. Define colors, fonts, spacing
4. Create responsive layouts (mobile, tablet, desktop)
5. Define interactive states (hover, active, disabled, error, loading, success)
6. Document design system

### Process
```
Phase 0 Requirements
        ↓
Design Agent reads requirements
        ↓
Design Agent creates design specs:
  - Layout sketches
  - Color palette
  - Typography
  - Component specs
  - Mobile/tablet/desktop layouts
  - Interactive states
        ↓
Design Specifications Document Created
```

### Outputs Required
- Design specifications document
- Component library / design system
- CSS variables (colors, fonts, spacing)
- Visual guidelines for all states
- Responsive design breakpoints

### Example Design Spec for Registration Form
```
REGISTRATION FORM DESIGN SPEC

Layout:
- Mobile (< 768px): Single column, full width
- Tablet (768px - 1024px): Single column, 80% width, centered
- Desktop (> 1024px): Single column, 500px width, centered

Typography:
- Form Label: Lato, 14px, #333, font-weight: 600
- Input Text: Lato, 16px, #666, font-weight: 400
- Helper Text: Lato, 12px, #999, font-weight: 400
- Error Text: Lato, 12px, #e41e26, font-weight: 400

Colors:
- Background: #ffffff
- Input Border (default): #cccccc
- Input Border (focus): #3b5998
- Input Border (error): #e41e26
- Button Background: #3b5998
- Button Background (hover): #2d4373
- Button Background (disabled): #cccccc
- Success Message: #28a745
- Error Message: #e41e26

Input States:
- Default: Border #ccc, background white
- Focus: Border #3b5998, background white, shadow
- Error: Border #e41e26, background #ffe6e6
- Disabled: Border #ccc, background #f5f5f5, opacity 0.5
- Loading: Button shows spinner, disabled

Button States:
- Default: Blue background, white text
- Hover: Darker blue background
- Active/Clicked: Even darker blue, slight inset
- Disabled: Gray background
- Loading: Shows spinner, disabled

Success State:
- Show success message: "Registration submitted successfully!"
- Message color: #28a745
- Icon: Checkmark
- Auto-dismiss after 5 seconds

Error State:
- Show error message with details
- Message color: #e41e26
- Icon: Alert triangle
- Input field with error highlights in red
```

### ⚠️ DEPENDENCY CHECK
**Phase 1 cannot start until Phase 0 is done.**
**Phase 2 (Frontend) cannot start until Phase 1 is done.**

---

## Phase 2: Frontend Development (HAPPENS AFTER Phase 1)

**Status:** Dependent on Phase 1
**Owner:** Frontend Agent / Frontend Developer
**Time to Complete:** Hours to days
**CAN START:** Once Phase 1 (Design) is complete

### What Happens Here
1. Read design specifications
2. Create HTML structure
3. Write CSS styling (following design spec exactly)
4. Add JavaScript functionality
5. Ensure accessibility
6. Test responsiveness on different devices

### Process
```
Phase 1 Design Specifications
        ↓
Frontend Agent reads design specs
        ↓
Frontend Agent creates:
  - index.html (structure)
  - style.css (styling from design spec)
  - form.js (interactions & validation)
        ↓
Frontend code ready for testing
```

### Outputs Required
- HTML file with form structure
- CSS file with styling (matching design spec exactly)
- JavaScript file with:
  - Form validation
  - Interactive states (hover, focus, error)
  - Success/error message display
  - Submit handling (will connect to backend later)

### Example Frontend Code Structure
```html
<!-- index.html -->
<form id="registrationForm" class="registration-form">
  <div class="form-group">
    <label for="name">Full Name</label>
    <input
      type="text"
      id="name"
      name="name"
      required
      class="form-input"
    >
    <span class="error-message" id="nameError"></span>
  </div>

  <div class="form-group">
    <label for="email">Email Address</label>
    <input
      type="email"
      id="email"
      name="email"
      required
      class="form-input"
    >
    <span class="error-message" id="emailError"></span>
  </div>

  <button type="submit" class="btn btn-primary" id="submitBtn">
    Register
  </button>

  <div class="success-message" id="successMessage" style="display:none;">
    Registration submitted successfully!
  </div>
</form>
```

### ⚠️ DEPENDENCY CHECK
**Phase 2 cannot start until Phase 1 is done.**
**Phase 2 and Phase 3 CAN happen in parallel (they don't depend on each other).**

---

## Phase 3: Backend Development (HAPPENS AFTER Phase 0)

**Status:** Dependent on Phase 0 (Requirements)
**Owner:** Backend Agent / Backend Developer
**Time to Complete:** Hours to days
**CAN START:** Once Phase 0 (Requirements) is complete
**PARALLEL WITH:** Phase 2 (Frontend)

### What Happens Here
1. Read the requirements
2. Design database schema
3. Create API endpoints
4. Write business logic
5. Add data validation
6. Add error handling
7. Implement security measures
8. Add email functionality (if needed)

### Process
```
Phase 0 Requirements
        ↓
Backend Agent reads requirements
        ↓
Backend Agent creates:
  - Database schema
  - API endpoints
  - Server logic
  - Validation
  - Error handling
        ↓
Backend APIs ready for integration
```

### Outputs Required
- API endpoint specification (what URLs, what data they accept, what they return)
- Database schema (table structure)
- Validation logic
- Error handling
- Email templates (if applicable)

### Example Backend API Spec
```
REGISTRATION API ENDPOINT

POST /api/register

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-0123",
  "courseId": "course-101"
}

Success Response (200):
{
  "success": true,
  "message": "Registration successful",
  "registrationId": "reg-12345",
  "confirmationEmail": "john@example.com"
}

Error Response (400):
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email already registered",
    "name": "Name is required"
  }
}

Error Response (409 - Conflict):
{
  "success": false,
  "message": "User already registered for this course"
}

Database Schema:
Table: registrations
- id (primary key)
- name (string, required)
- email (string, required, unique per course)
- phone (string, required)
- courseId (string, required)
- createdAt (timestamp)
- status (pending, confirmed, cancelled)
```

### ⚠️ DEPENDENCY CHECK
**Phase 3 cannot start until Phase 0 is done.**
**Phase 3 and Phase 2 CAN happen in parallel.**
**Phase 4 (Integration) cannot start until BOTH Phase 2 and Phase 3 are done.**

---

## Phase 4: Integration (HAPPENS AFTER Phase 2 AND Phase 3)

**Status:** Dependent on Phase 2 AND Phase 3
**Owner:** Frontend Agent (with Backend Agent consultation)
**Time to Complete:** Hours
**CAN START:** Only when BOTH Phase 2 and Phase 3 are complete

### What Happens Here
1. Frontend connects to backend APIs
2. Handle API responses
3. Handle API errors
4. Show appropriate messages to user
5. Test the full flow end-to-end

### Process
```
Phase 2 (Frontend)    Phase 3 (Backend)
        ↓                     ↓
        └──────────┬──────────┘
                   ↓
          Integration Happens
                   ↓
        Frontend calls Backend API
        Backend processes request
        Frontend receives response
        Frontend updates UI
                   ↓
        Integration Complete
```

### What Gets Added
```javascript
// form.js - Add API integration

const form = document.getElementById('registrationForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get form data
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    courseId: document.getElementById('course').value
  };

  // Show loading state
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    // Call backend API
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      // Success!
      showSuccessMessage();
      form.reset();
    } else {
      // Show errors
      showErrorMessages(result.errors);
    }
  } catch (error) {
    // Network error
    showErrorMessage('Network error. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Register';
  }
});
```

### ⚠️ DEPENDENCY CHECK
**Phase 4 CANNOT start until BOTH Phase 2 and Phase 3 are complete.**

---

## Phase 5: Testing / QA (HAPPENS AFTER Phase 4)

**Status:** Dependent on Phase 4
**Owner:** QA Agent / QA Engineer
**Time to Complete:** Hours to days
**CAN START:** Only when Phase 4 (Integration) is complete

### What Happens Here
1. Test all features
2. Test on multiple browsers
3. Test on multiple devices
4. Test error scenarios
5. Test edge cases
6. Document any bugs found

### Process
```
Phase 4 Integration Complete
        ↓
QA Agent creates test plan
        ↓
QA Agent tests:
  - Functionality
  - Browsers (Chrome, Firefox, Safari, Edge)
  - Devices (mobile, tablet, desktop)
  - Error scenarios
  - Edge cases
        ↓
QA Agent reports bugs (if any)
        ↓
If bugs found: Go back to Phase 2 or 3
If no bugs found: Approve for deployment
```

### Test Cases for Registration Form
```
TEST CASE 1: Successful Registration
- Fill all fields correctly
- Click Register
- Verify success message appears
- Verify confirmation email sent
- Verify form clears
- PASS / FAIL

TEST CASE 2: Missing Required Field
- Leave name field empty
- Click Register
- Verify error message for name field
- Verify form not submitted
- PASS / FAIL

TEST CASE 3: Invalid Email
- Enter "notanemail" in email field
- Click Register
- Verify error message for email field
- PASS / FAIL

TEST CASE 4: Duplicate Email
- Submit with email already registered
- Verify error message
- Verify appropriate error from backend
- PASS / FAIL

TEST CASE 5: Mobile Responsiveness
- View form on iPhone (375px)
- Verify layout is single column
- Verify inputs are tappable (44px minimum)
- Verify text readable
- PASS / FAIL

TEST CASE 6: Network Error
- Simulate network failure
- Submit form
- Verify error message shown
- Verify form still usable for retry
- PASS / FAIL

TEST CASE 7: Browser Compatibility
- Test on Chrome, Firefox, Safari, Edge
- Verify form appears correctly on all
- Verify functionality works on all
- PASS / FAIL
```

### Outputs Required
- Test report
- Bug list (if any)
- Approval for deployment (if no critical bugs)

### ⚠️ DEPENDENCY CHECK
**Phase 5 cannot start until Phase 4 is complete.**
**If bugs found in Phase 5, go back to Phase 2 or 3 to fix them, then retest.**

---

## Phase 6: Bug Fixes (HAPPENS AFTER Phase 5 - ONLY IF NEEDED)

**Status:** Conditional - Only if QA finds bugs
**Owner:** Frontend Agent or Backend Agent (depending on bug)
**Time to Complete:** Varies
**CAN START:** Only after Phase 5 (QA) finds bugs

### What Happens Here
1. Developer reads bug report from QA
2. Identifies which phase caused the bug (usually Phase 2 or 3)
3. Fixes the code
4. Commits fix to git
5. Returns to Phase 5 for retesting

### Process
```
Phase 5 QA finds bugs
        ↓
QA creates detailed bug report
        ↓
Developer reads bug report
        ↓
If bug is frontend:
  - Fix in Phase 2 (Frontend code)
  - Commit changes

If bug is backend:
  - Fix in Phase 3 (Backend code)
  - Commit changes
        ↓
Go back to Phase 4 or 5
  (Integration or retest)
```

### Example Bug Report
```
BUG REPORT
ID: BUG-001
Severity: High
Description: Form validation doesn't prevent submission on Enter key

Steps to Reproduce:
1. Load registration form
2. Fill name field: "John"
3. Press Enter key (instead of clicking Register button)
4. Form submits without validating email field

Expected: Form should not submit, email validation error should show
Actual: Form submits with empty email field

Browser: Chrome 120.0
Device: Desktop

Fix location: Phase 2 (Frontend) - JavaScript validation
```

### ⚠️ DEPENDENCY CHECK
**Phase 6 only happens if Phase 5 finds bugs.**
**After fixes, return to Phase 5 for retesting.**
**Don't proceed to Phase 7 until Phase 5 QA approves.**

---

## Phase 7: Deployment (HAPPENS AFTER Phase 5 APPROVAL)

**Status:** Dependent on Phase 5 approval
**Owner:** DevOps Agent / DevOps Engineer
**Time to Complete:** Minutes to hours
**CAN START:** Only after Phase 5 QA approves (no critical bugs)

### What Happens Here
1. Pull latest code from git
2. Deploy to production server
3. Verify deployment successful
4. Monitor for errors
5. Roll back if critical issues found

### Process
```
Phase 5 QA Approves
        ↓
DevOps Agent pulls code from git
        ↓
DevOps Agent deploys to server:
  - Copies code to server
  - Runs any build steps
  - Updates database (if needed)
  - Restarts services
        ↓
DevOps Agent verifies:
  - Website loads
  - Forms work
  - No error messages in logs
        ↓
Site is LIVE to users!
```

### ⚠️ DEPENDENCY CHECK
**Phase 7 cannot start until Phase 5 approval.**
**Phase 7 is the last phase in the workflow.**

---

## Complete Workflow Diagram

```
PHASE 0: Requirements & Planning
(Gatekeeper - Nothing starts without this)
         ↓
    ┌────┴────┐
    ↓         ↓
PHASE 1:   PHASE 1:
Design     Design
    ↓
    └────┬────┐
         ↓    ↓
    PHASE 2: PHASE 3:
    Frontend Backend
    (Can run in parallel)
         ↓    ↓
         └────┬────┘
              ↓
         PHASE 4:
         Integration
              ↓
         PHASE 5:
         QA Testing
              ↓
         Bugs found?
         ↙        ↘
        YES       NO
        ↓          ↓
    PHASE 6:  PHASE 7:
    Bug Fixes  Deployment
    (return      ↓
     to 4 or 5)  ✓ COMPLETE
```

---

## For Agent-Based Development: The Routine

When you have agents working on this, here's the exact routine:

### Daily Routine Example

**Morning - Requirements:**
```
Human provides: "Build course registration form"
Requirements written and documented
✓ Phase 0 complete
```

**1st Hour - Design:**
```
Design Agent:
  - Reads requirements
  - Creates design specs
  - Documents colors, fonts, spacing
  - Defines all input states
✓ Phase 1 complete
```

**2nd Hour - Parallel Work (Frontend & Backend):**
```
Frontend Agent:
  - Reads design specs
  - Builds HTML structure
  - Writes CSS styling
  - Adds JavaScript validation
  ✓ Phase 2 complete

Backend Agent (simultaneously):
  - Reads requirements
  - Designs database
  - Builds API endpoints
  - Adds validation & error handling
  ✓ Phase 3 complete
```

**3rd Hour - Integration:**
```
Frontend Agent:
  - Reads Backend Agent's API spec
  - Connects form to API
  - Handles responses
  - Tests manually
  ✓ Phase 4 complete
```

**4th Hour - QA:**
```
QA Agent:
  - Tests on 5 browsers
  - Tests on 3 device sizes
  - Tests error scenarios
  - Documents results
  ✓ Phase 5 complete (if no bugs)
```

**5th Hour - Deployment:**
```
DevOps Agent:
  - Pulls code
  - Deploys to production
  - Verifies working
  - Monitors system
  ✓ Phase 7 complete - LIVE!
```

**Total Time:** ~5 hours for a full feature, start to finish

---

## Key Rules for Success

### Rule 1: Don't Skip Phases
Every feature must go through all phases in order. Skipping design and going straight to code causes problems.

### Rule 2: Parallel Where Possible
Frontend and Backend can happen simultaneously (they don't depend on each other). Use this to speed up development.

### Rule 3: Never Merge Phases
Don't have the Frontend Agent do Backend work, or vice versa. Keep responsibilities separated.

### Rule 4: One Thing at a Time
Each agent works on one phase for one feature before moving to the next.

### Rule 5: Commit After Each Phase
Each agent commits their work to git after completing their phase. This keeps the code organized and trackable.

### Rule 6: Document Everything
Each agent documents what they did so the next agent understands the context.

### Rule 7: Block When Dependent
If a phase depends on another, the agent must wait. Don't try to proceed until the dependency is satisfied.

---

## Example: Building Multiple Features in Parallel

You can have multiple features flowing through different phases simultaneously:

```
MONDAY MORNING:
- Feature A: Requirements written
- Feature B: (waiting for requirements)

MONDAY 10 AM:
- Feature A: Design Agent working
- Feature B: Requirements written

MONDAY 1 PM:
- Feature A: Frontend & Backend agents working
- Feature B: Design Agent working
- Feature C: Requirements written

MONDAY 4 PM:
- Feature A: QA Agent testing
- Feature B: Frontend & Backend agents working
- Feature C: Design Agent working
- Feature D: Requirements written

TUESDAY MORNING:
- Feature A: Deployed! (if no bugs)
- Feature B: QA Agent testing
- Feature C: Frontend & Backend agents working
- Feature D: Design Agent working
- Feature E: Requirements written
```

This way, you can have many features in progress at once, all in the correct order.

---

## Summary: The Golden Rule

**Requirements** → **Design** → **Frontend** + **Backend** (parallel) → **Integration** → **QA** → **Deploy**

This order ensures:
- ✓ Frontend builds the right thing (based on design)
- ✓ Backend builds the right thing (based on requirements)
- ✓ Frontend and Backend can work simultaneously
- ✓ Integration brings them together correctly
- ✓ QA catches bugs before users see them
- ✓ Deployment to users only happens after approval

Don't deviate from this order. It's proven to work for software teams worldwide.
