---
description: Analyze codebase and provide optimization recommendations
---

You are tasked with performing a comprehensive codebase optimization analysis. Follow these steps systematically:

## 1. Project Structure Analysis
First, understand the project structure:
- List all HTML, CSS, and JavaScript files
- Identify the main entry points and dependencies
- Check for any build configuration files (package.json, webpack, etc.)

## 2. Performance Analysis
Examine the codebase for performance optimization opportunities:

### JavaScript Analysis
- Check for unused JavaScript code and functions
- Look for opportunities to defer or async load scripts
- Identify any redundant DOM manipulations
- Check for memory leaks (event listeners not cleaned up, etc.)
- Look for expensive operations in loops
- Identify opportunities for code splitting or lazy loading
- Check for console.log statements left in production code

### CSS Analysis
- Look for unused CSS rules and selectors
- Check for redundant or duplicate styles
- Identify opportunities to reduce specificity
- Look for CSS that could be simplified or combined
- Check for inefficient selectors (e.g., universal selectors, deep nesting)
- Identify CSS that blocks rendering

### HTML Analysis
- Check for unnecessary inline styles
- Look for redundant or unused HTML elements
- Verify proper semantic HTML usage
- Check image loading strategies (lazy loading, srcset, etc.)
- Identify render-blocking resources

## 3. Resource Optimization
Analyze resource loading and optimization:
- Check for unoptimized images (size, format)
- Verify CDN usage for external libraries
- Look for opportunities to bundle or minify resources
- Check font loading strategies
- Identify opportunities for caching strategies
- Check for missing compression (gzip, brotli)

## 4. Code Quality & Maintainability
Review code quality issues that impact performance:
- Check for code duplication across files
- Look for overly complex functions that could be simplified
- Identify inconsistent coding patterns
- Check for proper error handling
- Look for hardcoded values that should be constants
- Verify consistent file organization

## 5. Accessibility & SEO Performance
- Check for missing alt attributes on images
- Verify proper heading hierarchy
- Check for ARIA labels where needed
- Verify meta tags and structured data

## 6. Security Considerations
- Check for potential XSS vulnerabilities
- Look for exposed API keys or sensitive data
- Verify input validation and sanitization
- Check for insecure external resource loading (http vs https)

## Output Format
Provide your findings in this structure:

### 🚀 High Priority Optimizations
List critical issues that significantly impact performance or functionality.
For each item:
- Describe the issue
- Explain the impact
- Provide specific file locations with line numbers
- Suggest concrete solutions with code examples

### ⚡ Medium Priority Improvements
List important improvements that would enhance performance or code quality.

### 💡 Low Priority Enhancements
List nice-to-have improvements and best practices.

### 📊 Summary Statistics
Provide metrics:
- Total files analyzed
- Total lines of code
- Number of issues found by category
- Estimated performance impact

### 🎯 Quick Wins
List 3-5 optimizations that would have the highest impact with the least effort.

### 📋 Implementation Roadmap
Suggest a phased approach to implementing the recommendations.

Be specific, actionable, and prioritize recommendations by impact vs. effort ratio.
