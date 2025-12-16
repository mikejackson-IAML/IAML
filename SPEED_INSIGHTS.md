# Vercel Speed Insights Implementation Guide

This document describes how Vercel Speed Insights has been integrated into the IAML website to monitor and optimize performance.

## Overview

Vercel Speed Insights is a performance monitoring tool that tracks real user metrics and helps identify performance bottlenecks. It provides:

- **Core Web Vitals tracking** - Largest Contentful Paint (LCP), First Input Delay (FID), Cumulative Layout Shift (CLS)
- **Real user monitoring (RUM)** - Data from actual visitors to your site
- **Performance trends** - Historical data to track improvements over time
- **Privacy-compliant** - GDPR and privacy-friendly data collection

## Implementation Details

### What Was Added

The Speed Insights tracking script has been integrated into all major pages of the IAML website:

- `index.html` - Home page
- `about-us.html` - About Us page
- `program-schedule.html` - Program Schedule page
- `register.html` - Registration page

### How It Works

The implementation uses a simple two-script pattern added before the closing `</body>` tag:

```html
<!-- Vercel Speed Insights -->
<script>
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="/_vercel/speed-insights/script.js"></script>
```

**Why two scripts?**

1. **First script** - Creates a global `window.si` function that queues any calls before the main script loads
2. **Second script** - Loads the actual Vercel Speed Insights tracking script from `/_vercel/speed-insights/script.js`

The script is loaded with `defer` attribute, which means:
- It doesn't block page rendering
- It loads asynchronously while other resources are loading
- It executes after the document is parsed

### Setup Prerequisites

Before Speed Insights will work, you must:

1. **Enable Speed Insights in Vercel Dashboard**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your IAML project
   - Go to the **Speed Insights** tab
   - Click **Enable**

2. **Deploy to Vercel**
   - The tracking endpoint `/_vercel/speed-insights/script.js` only works on Vercel deployments
   - Local development (with `vercel dev`) will not collect Speed Insights data
   - After deployment, the script will automatically start collecting data

3. **Wait for Data Collection**
   - Allow a few days for user data to accumulate
   - After visitors access the site, metrics will appear in the dashboard
   - You'll see real user metrics (RUM) based on actual visitor experiences

## Viewing Your Data

Once enabled and deployed:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your IAML project
3. Click the **Speed Insights** tab
4. View metrics including:
   - Core Web Vitals (LCP, FID/INP, CLS)
   - Page load performance
   - Trends over time
   - Per-page performance breakdown

## Key Metrics

### Largest Contentful Paint (LCP)
- **What it measures**: Time when the largest visible content element appears
- **Goal**: < 2.5 seconds
- **Improvement tips**: Optimize images, preload fonts, minimize CSS

### First Input Delay (FID) / Interaction to Next Paint (INP)
- **What it measures**: Responsiveness to user interactions
- **Goal**: < 100ms (FID) or < 200ms (INP)
- **Improvement tips**: Reduce JavaScript execution time, break up long tasks

### Cumulative Layout Shift (CLS)
- **What it measures**: Visual stability during page load
- **Goal**: < 0.1
- **Improvement tips**: Set explicit dimensions for images/videos, avoid inserting content above existing content

## Privacy & Compliance

Vercel Speed Insights is designed with privacy in mind:

- **No personal data collected** - Only performance metrics
- **GDPR compliant** - No tracking of individual users or identifiable information
- **Anonymized by default** - Data is aggregated and anonymized
- **No cookies** - Does not use cookies for tracking
- **CCPA compliant** - Respects California Consumer Privacy Act requirements

For more details, see [Vercel Privacy Policy](https://vercel.com/legal/privacy-policy)

## Performance Impact

The Speed Insights script is optimized for minimal impact:

- **Small file size** - Minimal JavaScript added to your pages
- **Non-blocking** - Uses `defer` attribute to not block page rendering
- **Asynchronous loading** - Loads independently of your application code
- **No sensitive data sent** - Only sends performance metrics

## Local Development

When running locally with `vercel dev`:

- The Speed Insights script will still load
- However, data will not be collected
- This is by design to keep local development isolated
- Speed Insights only collects data in production

To test locally:
```bash
vercel dev
```

The page will load normally, but Speed Insights metrics won't be visible in the dashboard until deployed to production.

## Troubleshooting

### Script not loading
- **Check**: Ensure you're on a Vercel deployment (not localhost)
- **Check**: Verify Speed Insights is enabled in Vercel Dashboard
- **Check**: Open DevTools Network tab and look for `/_vercel/speed-insights/script.js`

### No data appearing in dashboard
- **Wait**: Allow 24-48 hours for initial data collection
- **Check**: Verify users are actually visiting the site
- **Check**: Ensure deployment is complete and active

### Data collection not working
- **Check**: Verify Speed Insights is enabled in Settings
- **Check**: Confirm no Content Security Policy blocks the script
- **Check**: Look for JavaScript errors in browser console

## Next Steps

1. **Enable Speed Insights** in Vercel Dashboard (if not already done)
2. **Deploy** your changes to Vercel
3. **Wait** for data to accumulate from real users
4. **Review** metrics in the Speed Insights dashboard
5. **Identify** pages or metrics that need optimization
6. **Implement** optimizations based on the data
7. **Monitor** trends over time

## Additional Resources

- [Vercel Speed Insights Documentation](https://vercel.com/docs/speed-insights)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Performance Best Practices](https://web.dev/performance/)
- [Vercel Blog - Speed Insights](https://vercel.com/blog)

## Files Modified

The following files were updated to include the Speed Insights tracking script:

- `index.html`
- `about-us.html`
- `program-schedule.html`
- `register.html`

Each file now includes the Speed Insights initialization code before the closing `</body>` tag.

## Notes

- The implementation uses HTML-based tracking, which is appropriate for static HTML pages
- For dynamic pages in `/pages/` directory, you may need to add the same script if they're not already included
- The script is compatible with all modern browsers
- Consider adding the script to any other major entry points to your site
