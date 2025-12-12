# New Program Page Generator

Generate a new IAML program page from the template system.

## Your Task

You are generating a new program page for IAML. This command handles both **data collection** and **page generation**.

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

**Meta:**
- `{{META_TITLE}}`, `{{META_DESCRIPTION}}`, `{{META_KEYWORDS}}`
- `{{OG_TITLE}}`, `{{OG_DESCRIPTION}}`, `{{OG_IMAGE}}`, `{{PROGRAM_SLUG}}`

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
[ ] Commit changes to git
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

## Schema Reference

See `programs/data/_schema.json` for the complete data structure.
