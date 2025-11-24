// Testimonials Carousel - Splide.js powered slider
// Used on homepage testimonials section

const testimonialsData = [
    {
      "quote": "The classroom participation was excellent and allowed us to share situations and get other perspectives in a safe space. This was the best employee relations seminar that I've ever attended.",
      "name": "JoAnne Guerrant",
      "title": "Employee Relations Manager",
      "company": "Delta Community Credit Union"
    },
    {
      "quote": "I thoroughly enjoyed the seminar. Thank you for so much valuable information and for great case examples.",
      "name": "Amelia Gowdy",
      "title": "Human Resources Business Associate",
      "company": "Miami-Dade County Housing Finance Authority"
    },
    {
      "quote": "It's always good to come back to IAML to get updated on the newest rulings as well as to refresh my knowledge of employment law. The instructors were very good and their presentation skills were excellent.",
      "name": "Denise Teuscher",
      "title": "Lead Labor Relations Specialist",
      "company": "Battelle Energy Alliance"
    },
    {
      "quote": "Thank you for all of the information that was given. I am very excited to apply the knowledge that has been given. I would very much like to continue to work with the IAML team to continue my education.",
      "name": "David Deem",
      "title": "Continuous Improvement Manager",
      "company": "Lear Corporation"
    },
    {
      "quote": "This was my third IAML seminar and I have been very impressed each time. The information is comprehensive, in-depth, and very relevant. I plan to attend more IAML seminars in the future.",
      "name": "Gloria Lindsey",
      "title": "Human Resources Benefits Manager",
      "company": "Thiele Kaolin Company"
    },
    {
      "quote": "This is the best seminar I have ever attended. Our instructor was thoroughly engaging and his energy, enthusiasm and enjoyment of his subjects was infectious.",
      "name": "John H. Livingston",
      "title": "Assistant General Counsel & Human Resources Director",
      "company": "Liberty National Life Insurance Company"
    },
    {
      "quote": "The information was extremely valuable and interesting, I learned a great deal. The instructors did an exceptional job presenting; they were helpful, knowledgeable and entertaining.",
      "name": "Katie Sanders",
      "title": "Coordinator of Workforce Development",
      "company": "Northside Hospital"
    },
    {
      "quote": "The best training seminar I've attended! Very valuable to what I do every day, especially in reviewing litigation cases. There was much value in the interaction with other HR peers.",
      "name": "Jennifer Capozziello",
      "title": "AVP, Human Resources",
      "company": "Travelers"
    },
    {
      "quote": "I thought the seminar was very informative! I will definitely utilize my new skills I have acquired during the training. I would highly recommend others to use IAML as their training/learning tool.",
      "name": "Stephanie Banach",
      "title": "Shareholder Relations Manager",
      "company": "Akhiok-Kaguyak, Inc."
    },
    {
      "quote": "This was my first seminar with IAML and I was very impressed! The speakers were great and the sessions were very informative. I will definitely attend again!",
      "name": "Holly Dean",
      "title": "Employment Manager",
      "company": "Alfa Insurance Company"
    }
  ];
  
  function initializeTestimonialsCarousel() {
    const list = document.getElementById('testimonials-list');
    if (!list) return;
    
    // Star rating image URL
    const starImageUrl = 'https://storage.googleapis.com/msgsndr/MjGEy0pobNT9su2YJqFI/media/68d667936fe1a53fe6603670.png';
    
    // Populate slides
    if (Array.isArray(testimonialsData) && testimonialsData.length) {
      list.innerHTML = '';
      testimonialsData.forEach(({ quote, name, title, company }) => {
        const li = document.createElement('li');
        li.className = 'splide__slide';
        
        // Clean quote text
        const clean = String(quote || '')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/(^"|"$)/g, '');
        
        li.innerHTML = `
          <a href="#" class="testimonial-link"></a>
          <div class="testimonial-card relative rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,.03)]">
            <div class="flex mb-4">
              <img src="${starImageUrl}" alt="5 star rating" class="h-5 w-auto opacity-90 star-image">
            </div>
            <blockquote class="text-gray-200 text-lg leading-relaxed mb-6 relative z-10 italic font-normal">
              "${clean}"
            </blockquote>
            <div class="pt-4 mt-auto">
              <div class="author-name">${name || ''}</div>
              <div class="text-gray-400 text-sm">${title || ''}</div>
              <div class="text-gray-400 text-sm font-medium">${company || ''}</div>
            </div>
          </div>`;
        list.appendChild(li);
      });
    }
    
    // Check if Splide is loaded
    if (typeof Splide === 'undefined') {
      console.warn('Splide library not loaded');
      return;
    }
    
    // Initialize Splide carousel
    const splide = new Splide('#testimonials-splide', {
      type: 'loop',
      perPage: 1,
      perMove: 1,
      gap: '2rem',
      autoplay: false,
      interval: 5000,
      pauseOnHover: true,
      arrows: true,
      pagination: false,
      drag: true,
      focus: 'center',
      trimSpace: false,
      padding: { left: '15%', right: '15%' },
      breakpoints: {
        1024: { padding: { left: '10%', right: '10%' }, gap: '1.5rem' },
        768: { padding: { left: '5%', right: '5%' }, gap: '1rem' },
        576: { padding: { left: '2%', right: '2%' }, gap: '0.5rem' }
      }
    });
    
    splide.mount();
    
    // Click any slide to make it active
    document.getElementById('testimonials-list').addEventListener('click', (e) => {
      const slide = e.target.closest('.splide__slide');
      if (!slide) return;
      const index = Array.prototype.indexOf.call(slide.parentElement.children, slide);
      splide.go(index);
    });
    
    // Trackpad/mouse wheel horizontal navigation
    (function addWheelNav() {
      const root = splide.root;
      let last = 0;
      const throttleMs = 220;
      const threshold = 10;
      
      root.addEventListener('wheel', (e) => {
        const axisX = Math.abs(e.deltaX);
        const axisY = Math.abs(e.deltaY);
        
        // Only intercept if horizontal scroll is dominant
        if (axisX <= axisY) return;
        
        const delta = e.deltaX;
        if (Math.abs(delta) < threshold) return;
        
        const now = Date.now();
        if (now - last < throttleMs) {
          e.preventDefault();
          return;
        }
        
        if (delta > 0) splide.go('>');
        else splide.go('<');
        
        last = now;
        e.preventDefault();
      }, { passive: false });
    })();
  }
  
  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', initializeTestimonialsCarousel);