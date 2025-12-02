# Agent System Blueprint: Complete Architecture

This is the master document that explains how all agents work together. Start here before reading individual agent guides.

---

## Overview: The Agent Ecosystem

You will eventually have **5 specialized agents** working together:

1. **Design Agent** - Creates design specifications
2. **Frontend Agent** - Builds user-facing code
3. **Backend Agent** - Builds server and database code
4. **QA Agent** - Tests everything
5. **DevOps Agent** - Deploys and manages infrastructure

Each agent is autonomous and specialized, but they communicate through:
- **Git** (shared code repository)
- **Documentation** (specifications, API docs, test plans)
- **Clear input/output contracts** (knowing what to expect from other agents)

---

## How Agents Communicate

### Communication Protocol

Agents don't talk to each other directly. Instead:

1. **Agent A** completes their phase
2. **Agent A** commits to git with clear commit message
3. **Agent A** creates/updates documentation
4. **Agent B** reads the documentation
5. **Agent B** reads the git commit
6. **Agent B** understands context and proceeds

### Shared Locations (Documentation)

Create these files in your repository:

```
/IAML/
├── PROJECT_SPEC.md              (Human provides initial requirements)
├── DESIGN_SPEC.md               (Design Agent output)
├── FRONTEND_SPEC.md             (Frontend Agent output)
├── BACKEND_SPEC.md              (Backend Agent output)
├── API_DOCUMENTATION.md         (Backend Agent output)
├── TEST_PLAN.md                 (QA Agent output)
├── GIT_WORKFLOW.md              (This file explains git)
└── agents/                       (Agent instruction documents)
    ├── DESIGN_AGENT_GUIDE.md
    ├── FRONTEND_AGENT_GUIDE.md
    ├── BACKEND_AGENT_GUIDE.md
    ├── QA_AGENT_GUIDE.md
    └── DEVOPS_AGENT_GUIDE.md
```

---

## Git Workflow for Agents

### Branch Structure

Each feature/task gets its own branch:

```
main (production-ready code)
├── feature/user-registration
│   ├── design/user-registration      (Design Agent works here)
│   ├── frontend/user-registration    (Frontend Agent works here)
│   ├── backend/user-registration     (Backend Agent works here)
│   └── test/user-registration        (QA Agent works here)
```

### Commit Message Format

All agents use this format:

```
[AGENT_TYPE] [PHASE] Description

[AGENT_TYPE]: DESIGN, FRONTEND, BACKEND, QA, DEVOPS
[PHASE]: 1-Design, 2-Frontend, 3-Backend, 4-Integration, 5-QA, 6-Fix, 7-Deploy

Example:
[DESIGN] [PHASE-1] User registration form design specification
[FRONTEND] [PHASE-2] Implement registration form UI
[BACKEND] [PHASE-3] Create registration API endpoints
[QA] [PHASE-5] User registration feature test report
[DEVOPS] [PHASE-7] Deploy user registration feature to production
```

### Phase Handoff Example

```
Phase 1: Design Agent
├─ Branch: design/user-registration
├─ Commits: [DESIGN] [PHASE-1] ...
├─ Creates: DESIGN_SPEC.md (updated)
└─ Ready for: Frontend & Backend agents

Phase 2 & 3: Frontend & Backend Agents (parallel)
├─ Branches:
│   ├─ frontend/user-registration
│   └─ backend/user-registration
├─ Commits: [FRONTEND] [PHASE-2] ... and [BACKEND] [PHASE-3] ...
├─ Creates:
│   ├─ Frontend code (HTML, CSS, JS)
│   └─ Backend code (API, Database)
└─ Ready for: Integration

Phase 4: Frontend Agent (with Backend reference)
├─ Branch: frontend/user-registration
├─ Commits: [FRONTEND] [PHASE-4] Integrate registration form with API
├─ Reads: API_DOCUMENTATION.md (created by Backend Agent)
└─ Ready for: QA

Phase 5: QA Agent
├─ Branch: test/user-registration
├─ Commits: [QA] [PHASE-5] User registration test report
├─ Creates: TEST_RESULTS.md
└─ If bugs found: Report for fixing
└─ If approved: Ready for Deploy

Phase 7: DevOps Agent
├─ Branch: main (merges all)
├─ Commits: [DEVOPS] [PHASE-7] Deploy user registration feature
└─ Result: Feature is LIVE
```

---

## How to Prompt an Agent

When you're building an agent in a Code chat, provide it with:

1. **Agent Purpose** - What this agent does
2. **Responsibilities** - Specific tasks
3. **Inputs** - What it receives
4. **Outputs** - What it creates
5. **Dependencies** - What it needs from other agents
6. **Tools & Tech** - What technologies it uses
7. **Process** - Step-by-step workflow
8. **Examples** - Real examples from your project
9. **Quality Standards** - What "done" looks like
10. **Git Workflow** - How to commit

---

## Agent Capability Levels

Each agent should understand these levels:

### Level 1: Information Gathering
- Read files
- Understand existing code
- Analyze project structure
- Ask clarifying questions

### Level 2: Analysis & Planning
- Review requirements
- Identify dependencies
- Plan implementation
- Document decisions

### Level 3: Code Generation
- Write code
- Create specifications
- Build components
- Follow patterns

### Level 4: Quality Assurance
- Verify work is complete
- Check against standards
- Test functionality
- Document issues

### Level 5: Automation & Tools
- Use git commands
- Run tests/linters
- Deploy code
- Monitor systems

---

## Workflow Example: Building a Feature from Start to Finish

### Scenario: "Add course waitlist functionality to IAML"

#### Step 1: Human Creates Requirements (Phase 0)

```
You create: PROJECT_SPEC.md

FEATURE: Course Waitlist

USER STORY:
"As a prospective student, if a course is full,
I want to join a waitlist so I can be notified
when a spot becomes available."

REQUIREMENTS:
1. Show "Join Waitlist" button when course is full
2. Allow user to join waitlist on registration page
3. Send email when spot becomes available
4. Limit waitlist to 20 people per course
5. First-come, first-served ordering
```

#### Step 2: Design Agent Creates Specs (Phase 1)

```
You message Design Agent:

"Using the project spec I created, design the
course waitlist feature. Include:
- How the waitlist button looks vs regular register button
- Waitlist form/modal design
- Confirmation message
- Follow existing IAML design system"

Design Agent:
├─ Reads PROJECT_SPEC.md
├─ Studies existing design in css/ and components/
├─ Creates DESIGN_SPEC.md with:
│  ├─ Visual mockup descriptions
│  ├─ Color/typography choices
│  ├─ Button states (default, hover, full, in-waitlist)
│  ├─ Modal design for joining waitlist
│  └─ Responsive design notes
├─ Commits: [DESIGN] [PHASE-1] Course waitlist design specification
└─ Ready for: Frontend & Backend agents
```

#### Step 3: Frontend & Backend Agents Work (Phase 2 & 3)

```
Frontend Agent:
├─ Reads: PROJECT_SPEC.md + DESIGN_SPEC.md
├─ Reads: Existing HTML structure in components/
├─ Creates:
│  ├─ Waitlist form HTML
│  ├─ "Join Waitlist" button CSS
│  ├─ Modal for waitlist confirmation
│  └─ JavaScript for form interaction
├─ Commits: [FRONTEND] [PHASE-2] Implement course waitlist UI
└─ Waits for: Backend API spec to proceed with integration

Backend Agent:
├─ Reads: PROJECT_SPEC.md + API_DOCUMENTATION.md
├─ Designs:
│  ├─ Database table: waitlists (id, courseId, userId, position, createdAt)
│  ├─ API endpoint: POST /api/waitlist/join
│  ├─ API endpoint: GET /api/waitlist/position
│  ├─ Email trigger when spot opens
│  └─ Error handling for duplicates
├─ Commits: [BACKEND] [PHASE-3] Create waitlist API endpoints
├─ Creates: Updated API_DOCUMENTATION.md
└─ Ready for: Frontend integration
```

#### Step 4: Frontend Integrates (Phase 4)

```
Frontend Agent:
├─ Reads: API_DOCUMENTATION.md (updated by Backend Agent)
├─ Adds JavaScript:
│  ├─ Form submission → POST /api/waitlist/join
│  ├─ Handle success response (show position in waitlist)
│  ├─ Handle errors (already in waitlist, course not full, etc.)
│  └─ Fetch current position: GET /api/waitlist/position
├─ Commits: [FRONTEND] [PHASE-4] Integrate waitlist form with backend API
└─ Ready for: QA testing
```

#### Step 5: QA Tests Everything (Phase 5)

```
QA Agent:
├─ Reads: PROJECT_SPEC.md, API_DOCUMENTATION.md
├─ Creates test plan for:
│  ├─ Join waitlist when course full
│  ├─ Can't join if not full
│  ├─ Can't join twice (duplicate check)
│  ├─ Position displayed correctly
│  ├─ Email notification sent
│  ├─ Form works on mobile/tablet/desktop
│  ├─ Form works on all browsers
│  └─ Error handling
├─ Tests each scenario
├─ Creates: TEST_PLAN.md with results
├─ If bugs found:
│  └─ Reports: [QA] [PHASE-5] Waitlist feature - bugs found
│  └─ Agents fix bugs, return to Phase 5
├─ If no bugs:
│  └─ Approves: [QA] [PHASE-5] Waitlist feature approved for production
└─ Ready for: DevOps deployment
```

#### Step 6: DevOps Deploys (Phase 7)

```
DevOps Agent:
├─ Merges all branches to main
├─ Pulls latest code
├─ Runs any database migrations
├─ Deploys to production server
├─ Verifies:
│  ├─ Website loads
│  ├─ Full course shows waitlist button
│  ├─ Waitlist form works
│  └─ No errors in server logs
├─ Commits: [DEVOPS] [PHASE-7] Deploy course waitlist feature
└─ Feature is LIVE ✓
```

---

## Agent Responsibility Matrix

Who does what:

| Task | Design | Frontend | Backend | QA | DevOps |
|------|--------|----------|---------|----|----|
| Read requirements | ✓ | ✓ | ✓ | ✓ | - |
| Create design specs | ✓ | - | - | - | - |
| Build HTML/CSS | - | ✓ | - | - | - |
| Write JavaScript | - | ✓ | - | - | - |
| Design database | - | - | ✓ | - | - |
| Build API endpoints | - | - | ✓ | - | - |
| Connect frontend to backend | - | ✓ | - | - | - |
| Test functionality | - | - | - | ✓ | - |
| Test responsiveness | - | - | - | ✓ | - |
| Test browsers | - | - | - | ✓ | - |
| Deploy to production | - | - | - | - | ✓ |
| Monitor production | - | - | - | - | ✓ |
| Handle production issues | - | - | - | - | ✓ |

---

## Data Flow Between Agents

```
Human Input (Requirement)
    ↓
DESIGN AGENT creates: Design Specification
    ↓
    ├─→ FRONTEND AGENT reads design spec
    │   └─→ Creates: Frontend Code + Documentation
    │
    └─→ BACKEND AGENT reads requirements
        └─→ Creates: Backend Code + API Documentation

    Then both agents:
    ├─→ FRONTEND reads API Documentation
    │   └─→ Integrates frontend with backend APIs
    │
    └─→ BACKEND reviews Frontend Integration
        └─→ Adjusts if needed

All code → QA AGENT
    ├─→ Creates: Test Plan
    ├─→ Tests everything
    └─→ Approves or reports bugs

Approved code → DEVOPS AGENT
    ├─→ Merges all branches
    ├─→ Deploys to production
    └─→ Monitors system
```

---

## What NOT to Do

### Anti-Patterns to Avoid

❌ **Don't:** Have Frontend Agent build database
✓ **Do:** Have Backend Agent build database

❌ **Don't:** Have Backend Agent write CSS
✓ **Do:** Have Frontend Agent write CSS

❌ **Don't:** Skip Design phase and jump to coding
✓ **Do:** Always design first

❌ **Don't:** Have Frontend integrate with Backend before Backend is ready
✓ **Do:** Wait for Backend API documentation first

❌ **Don't:** Deploy without QA approval
✓ **Do:** Always get QA approval before deployment

❌ **Don't:** Have agents commit without clear messages
✓ **Do:** Use structured commit messages with agent type and phase

❌ **Don't:** Skip testing on mobile/tablets
✓ **Do:** Always test responsive design

❌ **Don't:** Hardcode API URLs in frontend
✓ **Do:** Use configuration files and environment variables

---

## Success Criteria for the Agent System

Your agent system is working well when:

1. ✓ Design Agent creates clear specifications that Frontend Agent can follow exactly
2. ✓ Frontend and Backend Agents work simultaneously without conflicts
3. ✓ Frontend Agent can integrate with Backend without API surprises
4. ✓ QA Agent finds bugs before users see them
5. ✓ Deployments happen smoothly without issues
6. ✓ Features go from requirement to production in predictable time
7. ✓ No miscommunication between agents (all docs are clear)
8. ✓ Git history is clean and easy to follow
9. ✓ Agents don't redo work (clear handoffs)
10. ✓ Issues are caught at the right phase (bugs caught by QA, not users)

---

## Next Steps

Read the individual agent guides in order:

1. **DESIGN_AGENT_GUIDE.md** - How the Design Agent works
2. **FRONTEND_AGENT_GUIDE.md** - How the Frontend Agent works
3. **BACKEND_AGENT_GUIDE.md** - How the Backend Agent works
4. **QA_AGENT_GUIDE.md** - How the QA Agent works
5. **DEVOPS_AGENT_GUIDE.md** - How the DevOps Agent works

Then use these guides to prompt the agents in separate Code chats.

---

## Key Takeaway

The agent system works because:

- **Clear handoffs** - Each agent knows what the previous agent did
- **Documented specs** - No guessing, all decisions are written down
- **Git integration** - All code changes are tracked and reversible
- **Parallel work** - Frontend and Backend don't wait for each other
- **Quality gates** - QA approves before production deployment
- **Specialization** - Each agent is expert in their domain

This is professional software development automation. Let's build it.
