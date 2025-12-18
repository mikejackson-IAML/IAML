/**
 * IAML Faculty Module
 * Dynamically loads and renders faculty members for program pages
 * Data sourced from Airtable Faculty table, filtered by program relationships
 *
 * Features:
 * - Two-step Airtable API query (PROGRAMS → Faculty)
 * - Random shuffle on each page load (Fisher-Yates algorithm)
 * - Progressive enhancement (fallback to static HTML if API fails)
 * - Responsive grid layout with line-clamped bios
 */

/**
 * Fisher-Yates shuffle algorithm
 * Randomizes array in O(n) time with true randomness
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Fetch program record from Airtable by slug
 * First step of two-step query to get program record ID
 */
const fetchProgramBySlug = async (slug) => {
  const formula = `{Slug}='${slug}'`;
  const url = `/api/airtable-programs?table=PROGRAMS&filterByFormula=${encodeURIComponent(formula)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Program fetch failed: ${response.statusText}`);
    }
    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      console.warn(`Program not found for slug: ${slug}`);
      return null;
    }

    return data.records[0].id;
  } catch (error) {
    console.error('Error fetching program:', error);
    throw error;
  }
};

/**
 * Fetch faculty records linked to a specific program
 * Second step of two-step query using program record ID
 */
const fetchFacultyByProgram = async (programRecordId) => {
  const formula = `SEARCH("${programRecordId}", ARRAYJOIN({PROGRAMS (Faculty)}))`;
  const url = `/api/airtable-programs?table=Faculty&filterByFormula=${encodeURIComponent(formula)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Faculty fetch failed: ${response.statusText}`);
    }
    const data = await response.json();

    if (!data.records) {
      console.warn(`No faculty found for program ID: ${programRecordId}`);
      return [];
    }

    // Map Airtable fields to our template format
    return data.records.map(record => ({
      id: record.id,
      name: record.fields['Full Name with Credentials'] || '',
      firstName: record.fields['First Name'] || '',
      title: record.fields['Current Title'] || '',
      bio: record.fields['Short Bio (3-line)'] || '',
      imageUrl: record.fields['Headshot Photo'] || '',
      bioLink: record.fields['Full Bio URL'] || ''
    }));
  } catch (error) {
    console.error('Error fetching faculty:', error);
    throw error;
  }
};

/**
 * Generate HTML for a single faculty card
 * Uses template literal for performance and readability
 */
const createFacultyCardHTML = (faculty) => {
  return `
    <article class="faculty-card">
      <div class="faculty-card-inner">
        <div class="faculty-image">
          <img src="${faculty.imageUrl}" alt="${faculty.name}">
        </div>
        <div class="faculty-content">
          <h3 class="faculty-name">${faculty.name}</h3>
          <p class="faculty-title">${faculty.title}</p>
          <p class="faculty-bio">${faculty.bio}</p>
          <a href="${faculty.bioLink}" class="faculty-link">Read ${faculty.firstName}'s full bio →</a>
        </div>
      </div>
    </article>
  `;
};

/**
 * Render faculty cards to the DOM
 * Replaces placeholder content with dynamically loaded faculty
 */
const renderFacultyCards = (facultyArray) => {
  const container = document.querySelector('.faculty-grid');

  if (!container) {
    console.warn('Faculty grid container not found');
    return;
  }

  // Shuffle faculty for variety on each page load
  const shuffledFaculty = shuffleArray(facultyArray);

  // Generate HTML for all faculty cards
  const facultyHTML = shuffledFaculty
    .map(faculty => createFacultyCardHTML(faculty))
    .join('');

  // Replace existing content with dynamically loaded faculty
  container.innerHTML = facultyHTML;
};

/**
 * Main initialization function
 * Orchestrates two-step fetch and render process
 */
const initializeFaculty = async () => {
  const facultySection = document.querySelector('[data-program-slug]');

  // Progressive enhancement: only proceed if data attribute exists
  if (!facultySection) {
    console.warn('Faculty section with data-program-slug not found');
    return;
  }

  const programSlug = facultySection.dataset.programSlug;

  if (!programSlug) {
    console.warn('data-program-slug attribute is empty');
    return;
  }

  try {
    // Step 1: Get program record ID from slug
    const programId = await fetchProgramBySlug(programSlug);

    if (!programId) {
      console.warn(`Could not find program for slug: ${programSlug}`);
      return; // Fallback to static HTML
    }

    // Step 2: Fetch faculty linked to this program
    const faculty = await fetchFacultyByProgram(programId);

    if (faculty.length === 0) {
      console.warn(`No faculty found for program: ${programSlug}`);
      return; // Fallback to static HTML
    }

    // Render faculty cards
    renderFacultyCards(faculty);

    console.log(`Loaded ${faculty.length} faculty members for ${programSlug}`);
  } catch (error) {
    console.error('Faculty initialization failed:', error);
    console.log('Falling back to static HTML faculty content');
    // Progressive enhancement: let static HTML remain visible on error
  }
};

/**
 * Auto-initialize on DOMContentLoaded
 * Supports both early and late script loading
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFaculty);
} else {
  // DOM already loaded (late script execution)
  initializeFaculty();
}
