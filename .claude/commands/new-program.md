# New Program Page Generator (SEO-Enhanced)

Generate a new IAML program page with integrated SEO research and optimization.

## Prerequisites

Before running this command, ensure MCP credentials are configured:
- **DataForSEO**: For keyword research and competition analysis
- **Google Search Console**: For existing rankings data
- **Lighthouse**: For post-generation SEO audit (no credentials needed)

Run `/setup-mcp` if credentials are not set. SEO research can be skipped if credentials are unavailable.

## Your Task

You are generating a new program page for IAML with SEO optimization. This command handles:
1. **Data collection** - Gather program information
2. **SEO research** - Use MCP servers to research keywords and competition
3. **Page generation** - Create optimized HTML with enhanced meta tags
4. **SEO validation** - Run Lighthouse audit to verify SEO quality

---

## PHASE 1: Check for Existing Data

First, check if `programs/data/[program-slug].json` exists:
- **If exists**: Read it and ask "I found existing data for this program. Should I use it, or do you want to update it?"
- **If not exists**: Proceed to Phase 2 (Data Collection)

---

## PHASE 2: Interactive Data Collection

Guide the user through data entry step by step. For each section, wait for user input before proceeding.

### Step 2.1: Basic Program Info
Ask for all at once:
```
Let's set up your program page. Please provide:

1. **Program Name** (as it appears in Airtable):
2. **Program Slug** (URL-friendly, e.g., "strategic-hr-management"):
3. **Registration URL** (external registration link):
4. **Enrollment Fee** (number only, e.g., 2375):
5. **Duration** (e.g., "4½ days", "3 days"):
6. **Delivery Options** (comma-separated: In Person, Virtual, On Demand):
```

### Step 2.2: SEO & Meta
```
Now let's set up SEO:

1. **Page Title** (e.g., "Certificate in Strategic HR Management - IAML"):
2. **Meta Description** (150-160 chars for SEO):
3. **Keywords** (comma-separated):
4. **OG Image URL** (or press Enter to use default):
```

### Step 2.3: Hero Content
```
Hero section content:

1. **Hero Title** (can include <br> for line breaks):
2. **Hero Description** (main value proposition, 2-3 sentences):
```

### Step 2.4: Content Section (next to testimonials)
```
Content section (appears next to testimonials):

1. **Headline** (e.g., "Build Employment Law Expertise That Protects and Advances"):
2. **Description** (include program duration with emphasis):
3. **Key Benefits** (paste as bullet points, I'll format them):
```

### Step 2.5: Testimonials
```
Testimonials - paste in any format:

Accepted formats:
- "Quote text" - Name, Title, Company
- Quote | Name | Title | Company
- Or just paste a spreadsheet export

Paste your testimonials (or type "skip" to add later):
```

### Step 2.6: Curriculum
```
Curriculum structure - How many blocks? (1-3):
```

Then for each block:
```
Block [N] details:
1. **Label** (e.g., "Block I"):
2. **Title** (e.g., "Comprehensive Labor Relations"):
3. **Description** (1-2 sentences):
4. **Price** (individual block price):

Now list competency groups for Block [N].
For each group, provide:
- Group title and description
- Skills with levels (Foundation/Advanced/Expert) and descriptions

Paste or type your competency groups:
```

### Step 2.7: Faculty
```
Faculty/Instructors (1-12):

For each instructor, provide:
- Name (with credentials, e.g., "Ray Deeny, Esq.")
- Title and Organization
- Bio (3-4 sentences)
- Photo URL (Google Cloud Storage)
- Full bio link (optional)

Paste your faculty list:
```

### Step 2.8: FAQ
```
FAQ section (8-12 questions):

Paste your Q&A pairs in any format:
- Question? Answer text here.
- Or: Q: Question | A: Answer

Paste your FAQs:
```

### Step 2.9: Benefits Section
```
Benefits customization:

1. **Credit Count** (e.g., "35.75 SHRM/HRCI/CLE"):
2. **Update Period** (default: "12 months"):
3. **Alumni Discount** (default: "$300-$500"):
```

---

## PHASE 2.5: SEO Research & Suggestions (MCP-Powered)

This phase uses MCP servers to research keywords, analyze competition, and suggest optimized metadata. All suggestions are presented for user approval before applying.

### Step 2.5.1: Check MCP Availability

Before starting research, verify MCP server availability:

```
=== SEO Research Setup ===

Checking MCP server availability...

[✓] DataForSEO - Available (keyword research, SERP analysis)
[✓] Google Search Console - Available (existing rankings)
[✓] Lighthouse - Available (post-generation audit)

>>> Proceed with SEO research? [Y/n/skip]
```

If a server is unavailable:
```
[✗] DataForSEO - Not configured
    Run /setup-mcp to configure, or continue without keyword research.

>>> [C]onfigure now / [S]kip SEO research / [P]roceed without this server
```

### Step 2.5.2: DataForSEO Keyword Research

Query DataForSEO with program-related keywords:

**Keywords to research:**
- Program name (e.g., "Certificate in Employee Relations Law")
- Program name + "training" / "course" / "certification"
- Topic keywords (e.g., "employee relations", "HR law")
- Competitor terms (e.g., "SHRM certification", "HR training program")

**Present results to user:**
```
=== Keyword Research Results (DataForSEO) ===

Primary Keyword Analysis:
┌─────────────────────────────────────────┬────────┬─────────────┬───────┐
│ Keyword                                 │ Volume │ Competition │ CPC   │
├─────────────────────────────────────────┼────────┼─────────────┼───────┤
│ employee relations law training         │ 720    │ Medium      │ $8.50 │
│ employee relations certification        │ 590    │ Low         │ $6.20 │
│ HR law training program                 │ 480    │ Medium      │ $7.80 │
│ employment law course for HR            │ 320    │ Low         │ $5.40 │
└─────────────────────────────────────────┴────────┴─────────────┴───────┘

Related Keywords (for meta keywords):
- employee relations, HR certification, employment law training
- workplace compliance, SHRM certification, HRCI credits
- labor relations, HR professional development

Questions People Ask (for FAQ optimization):
- "What is employee relations law?"
- "How do I get certified in employee relations?"
- "What does an employee relations specialist do?"
- "Is HR certification worth it?"

>>> Save keyword data to program JSON? [Y/n]
```

### Step 2.5.3: Google Search Console Analysis

Check existing rankings for the IAML domain:

```
=== Existing Rankings (Google Search Console) ===

Site: iaml.com (Last 90 days)

Current rankings for related terms:
┌─────────────────────────────────────┬──────────┬─────────────┬───────┐
│ Query                               │ Position │ Impressions │ CTR   │
├─────────────────────────────────────┼──────────┼─────────────┼───────┤
│ hr training courses                 │ 12       │ 1,200       │ 2.3%  │
│ employment law certificate          │ 18       │ 890         │ 1.8%  │
│ hr certification programs           │ 24       │ 650         │ 1.2%  │
└─────────────────────────────────────┴──────────┴─────────────┴───────┘

Opportunity Analysis:
- "employee relations certification" - No current ranking (high opportunity)
- "employment law training" - Position 18 (can improve with new content)

>>> Continue to competition analysis? [Y/n]
```

### Step 2.5.4: Competition SERP Analysis

Analyze top-ranking pages for primary keywords:

```
=== Competition Analysis (DataForSEO SERP) ===

Top 5 results for "employee relations law training":

1. shrm.org/learning/employee-relations
   Title: "Employee Relations Certificate | SHRM" (45 chars)
   Description: "Develop expertise in employee relations..." (155 chars)
   Schema: Course, EducationalOrganization

2. cornellcollege.edu/hr/employee-relations
   Title: "Employee Relations Law Certificate Program" (48 chars)
   Description: "Cornell's online employee relations..." (148 chars)
   Schema: Course

3. hr.com/employee-relations-training
   Title: "Employee Relations Training | HR.com" (40 chars)
   Description: "Master employee relations with..." (152 chars)
   Schema: Course, Offer

Common Patterns:
- Title length: 40-50 characters
- Include "Certificate" or "Training" in title
- Description mentions outcomes + credentials
- All use Course schema

>>> Continue to SEO suggestions? [Y/n]
```

### Step 2.5.5: Present SEO Suggestions for Approval

Based on all research, present consolidated suggestions:

```
=== SEO Optimization Suggestions ===

Based on keyword research and competition analysis, here are my recommendations:

PAGE TITLE:
  Your input:    "Certificate in Employee Relations Law - IAML"
  Suggested:     "Certificate in Employee Relations Law | IAML Training"
  Reason:        Adding "Training" matches search intent (720 searches/mo).
                 Format matches top competitors.

>>> Accept title suggestion? [Y/n/customize]

META DESCRIPTION:
  Your input:    "Master employee relations strategies with practicing attorneys."
  Suggested:     "Master employee relations law in 4.5 days. Earn SHRM/HRCI/CLE
                 credits. Taught by practicing attorneys. Real cases, practical
                 solutions. Certificate program."
  Reason:        Includes high-value keywords (certification, credits) and
                 specific outcomes. 158 characters (optimal).

>>> Accept description suggestion? [Y/n/customize]

META KEYWORDS:
  Suggested:     employee relations law, HR certification, employment law training,
                 workplace compliance, SHRM certification, HRCI credits,
                 labor relations training, HR professional development
  Source:        DataForSEO keyword research + related terms

>>> Accept keywords? [Y/n/customize]

SCHEMA.ORG DATA:
  Type:          Course
  Level:         intermediate
  Duration:      P4DT4H (4.5 days in ISO 8601)
  Skills:        ["Employee Relations", "Employment Law", "Workplace Compliance",
                 "Labor Relations", "HR Legal Compliance"]

>>> Accept schema data? [Y/n/customize]

CANONICAL URL:
  https://iaml.com/programs/employee-relations-law

>>> Accept? [Y/enter]
```

After user approves each suggestion, store in the program data for Phase 3.

---

## PHASE 3: Generate JSON Data File

After collecting all data, create `programs/data/[program-slug].json` with the structured data.

Show the user: "Data saved to programs/data/[slug].json"

---

## PHASE 4: Generate HTML Page

1. Read the template: `programs/_template.html`
2. Replace ALL placeholders with program data
3. Generate curriculum blocks HTML (maintain existing structure from template)
4. Generate faculty cards HTML
5. Generate FAQ items HTML
6. Write to: `programs/[program-slug].html`

### Placeholders Reference

**Meta & SEO (NEW - from Phase 2.5):**
- `{{META_TITLE}}`, `{{META_DESCRIPTION}}`, `{{META_KEYWORDS}}`
- `{{OG_TITLE}}`, `{{OG_DESCRIPTION}}`, `{{OG_IMAGE}}`, `{{PROGRAM_SLUG}}`
- `{{TWITTER_CARD}}` - Card type (default: `summary_large_image`)
- `{{TWITTER_TITLE}}`, `{{TWITTER_DESCRIPTION}}`, `{{TWITTER_IMAGE}}` - Twitter Card tags
- `{{CANONICAL_URL}}` - Full canonical URL (e.g., `https://iaml.com/programs/employee-relations-law`)
- `{{META_ROBOTS}}` - Robots directive (default: `index, follow`)
- `{{SCHEMA_JSON_LD}}` - Complete Schema.org Course JSON-LD block

**Hero:**
- `{{PROGRAM_TITLE}}`, `{{PROGRAM_DESCRIPTION}}`, `{{PROGRAM_PRICE}}`
- `{{REGISTRATION_URL}}`, `{{DELIVERY_OPTIONS}}`

**Content:**
- `{{CONTENT_HEADLINE}}`, `{{CONTENT_DESCRIPTION}}`, `{{CONTENT_BENEFITS}}`

**Data:**
- `{{TESTIMONIALS_DATA}}` - JSON array
- `{{PROGRAM_NAME}}` - For Airtable queries
- `{{PROGRAM_NAME_LOWERCASE}}` - For string matching

**Curriculum:**
- `{{CURRICULUM_HEADER_TITLE}}`, `{{CURRICULUM_HEADER_DESC}}`
- `{{CURRICULUM_NAV_CARDS}}`, `{{CURRICULUM_BLOCKS}}`

**Faculty:**
- `{{FACULTY_HEADLINE}}`, `{{FACULTY_SUBTITLE}}`, `{{FACULTY_CARDS}}`

**Benefits:**
- `{{BENEFIT_CREDITS}}`, `{{BENEFIT_UPDATES}}`, `{{BENEFIT_DISCOUNT}}`

**FAQ:**
- `{{FAQ_ITEMS}}`

### Schema.org JSON-LD Template

When generating `{{SCHEMA_JSON_LD}}`, use this structure:

```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "{{PROGRAM_NAME}}",
  "description": "{{META_DESCRIPTION}}",
  "url": "{{CANONICAL_URL}}",
  "image": "{{OG_IMAGE}}",
  "provider": {
    "@type": "Organization",
    "name": "Institute for Applied Management & Law",
    "url": "https://iaml.com",
    "logo": "https://storage.googleapis.com/msgsndr/MjGEy0pobNT9su2YJqFI/media/69042ba0346960d8775fb4a4.svg"
  },
  "educationalLevel": "{{EDUCATIONAL_LEVEL}}",
  "timeRequired": "{{TIME_REQUIRED}}",
  "teaches": {{TEACHES_ARRAY}},
  "offers": {
    "@type": "Offer",
    "price": "{{PROGRAM_PRICE}}",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "{{REGISTRATION_URL}}"
  },
  "hasCourseInstance": [
    {
      "@type": "CourseInstance",
      "courseMode": ["onsite", "online"],
      "courseWorkload": "{{DURATION}}"
    }
  ]
}
```

**Field Mappings:**
- `{{EDUCATIONAL_LEVEL}}` - From `seo.schema.educationalLevel` (beginner/intermediate/advanced)
- `{{TIME_REQUIRED}}` - From `seo.schema.timeRequired` (ISO 8601, e.g., "P4DT4H")
- `{{TEACHES_ARRAY}}` - JSON array from `seo.schema.teaches`
- `{{DURATION}}` - From `hero.duration`

---

## PHASE 5: Post-Generation Checklist

Display this checklist:
```
Program page generated successfully!

Files created:
- programs/data/[slug].json
- programs/[slug].html

Post-generation checklist:
[ ] Verify images are uploaded to Google Cloud Storage
[ ] Test registration URL works correctly
[ ] Check Airtable has sessions for this program name
[ ] Preview the page in browser
[ ] Test responsive layouts (mobile, tablet, desktop)

SEO verification:
[ ] Twitter Card preview (cards-dev.twitter.com/validator)
[ ] Schema.org validation (validator.schema.org)
[ ] Open Graph preview (developers.facebook.com/tools/debug)

>>> Ready for Lighthouse SEO audit? [Y/n/skip]
```

---

## PHASE 6: Lighthouse SEO Audit (MCP-Powered)

Run an automated SEO audit on the generated page to verify quality.

### Step 6.1: Start Local Server

If not already running, start the development server:
```bash
npx vercel dev --listen 3000
```

Wait for server to be ready, then proceed.

### Step 6.2: Run Lighthouse SEO Audit

Using the Lighthouse MCP server, run an SEO-focused audit:

**Audit Configuration:**
- URL: `http://localhost:3000/programs/[program-slug].html`
- Categories: `seo` only (faster than full audit)
- Device: Desktop

### Step 6.3: Report Results

```
=== Lighthouse SEO Audit ===

URL: http://localhost:3000/programs/employee-relations-law.html
SEO Score: 98/100

PASSED:
[✓] Document has a <title> element
[✓] Document has a meta description
[✓] Page has successful HTTP status code
[✓] Links have descriptive text
[✓] Links are crawlable
[✓] Page isn't blocked from indexing
[✓] Document has valid hreflang
[✓] Document has valid rel=canonical
[✓] Document uses legible font sizes
[✓] Tap targets are sized appropriately
[✓] Document has valid structured data (Course schema)

WARNINGS:
[!] Image elements missing [alt] attributes (2 found)
    - Line 234: <img src="faculty-photo.jpg">
    - Line 289: <img src="sponsor-logo.png">

>>> Fix warnings automatically? [Y/n]
```

### Step 6.4: Auto-Fix Simple Issues

If user approves, automatically fix common issues:

**Fixable issues:**
- Missing alt attributes on images (generate from context/filename)
- Missing aria-labels on interactive elements
- Links with generic text ("click here", "read more")

**Not auto-fixable (report only):**
- Slow page load (requires optimization)
- Missing structured data fields
- Complex accessibility issues

### Step 6.5: Final Summary

```
=== Generation Complete ===

Program: Certificate in Employee Relations Law
URL:     https://iaml.com/programs/employee-relations-law

Files:
  ✓ programs/data/employee-relations-law.json
  ✓ programs/employee-relations-law.html

SEO Status:
  ✓ Lighthouse Score: 98/100
  ✓ Schema.org: Course (valid)
  ✓ Twitter Card: summary_large_image
  ✓ Open Graph: Complete
  ✓ Canonical: Set
  ✓ Keywords: 8 targeted

Next Steps:
  1. Review the page in browser: http://localhost:3000/programs/employee-relations-law.html
  2. Commit changes: git add . && git commit -m "feat: add employee-relations-law program page"
  3. Push to deploy
```

---

## HTML Generation Templates

### Delivery Options Pills
```html
<span class="format-pill">In Person</span>
<span class="format-pill">Virtual</span>
<span class="format-pill">On Demand</span>
```

### Curriculum Nav Card
```html
<div class="curriculum-nav-card [active]" data-target="block[N]" tabindex="[0|-1]" role="tab" aria-selected="[true|false]" aria-controls="block[N]">
  <div class="block-label">[Label]</div>
  <h3>[Title]</h3>
  <p>[Description]</p>
  <div class="curriculum-price">$[Price]</div>
  <div class="curriculum-availability">Available individually</div>
</div>
```

### Curriculum Block Content
Keep the existing block structure from the template, replacing competency groups and skills.

### Faculty Card
```html
<article class="faculty-card">
  <div class="faculty-card-inner">
    <div class="faculty-image">
      <img src="[imageUrl]" alt="[name]">
    </div>
    <div class="faculty-content">
      <h3 class="faculty-name">[name]</h3>
      <p class="faculty-title">[title]</p>
      <p class="faculty-bio">[bio]</p>
      <a href="[bioLink]" class="faculty-link">Read [firstName]'s full bio →</a>
    </div>
  </div>
</article>
```

### FAQ Item
```html
<div class="faq-item [active - first one only]">
  <button class="faq-question">
    [question]
    <svg class="faq-chevron" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
    </svg>
  </button>
  <div class="faq-answer">
    <div class="faq-answer-content">
      [answer]
    </div>
  </div>
</div>
```

---

## Important Rules

1. **Vanilla JS only** - No frameworks or build tools
2. **Keep heading hierarchy**: H1 (title), H2 (sections), H3 (subsections), H4 (skills)
3. **Sessions widget** uses program name for Airtable queries - must match exactly
4. **No registration modal** - Uses external registration URL
5. **Preserve inline CSS** - Template has ~3000 lines of inline styles

### SEO Rules (NEW)

6. **Always generate Schema.org JSON-LD** - Use Course type with valid structure
7. **Meta description length** - Keep between 150-160 characters for optimal SERP display
8. **Canonical URL format** - Always use `https://iaml.com/programs/[slug]` (no .html)
9. **Twitter Card defaults** - Use `summary_large_image` unless specified otherwise
10. **Keyword research** - Store in JSON for future reference, even if user skips suggestions
11. **ISO 8601 duration** - Convert program duration (e.g., "4½ days" → "P4DT4H")

### MCP Server Usage

- **DataForSEO**: Keyword research (volume, competition), SERP analysis
- **Google Search Console**: Existing rankings, impression data, CTR
- **Lighthouse**: Post-generation SEO audit, accessibility check

If MCP servers are unavailable, the command can still generate pages with sensible defaults for SEO fields.

## Schema Reference

See `programs/data/_schema.json` for the complete data structure (includes new `seo` object).
