// Environment configuration loader
// For production, these values should be set by your hosting platform
// For local development, you can manually set them here or use a build tool

const ENV_CONFIG = {
  // Quiz Section Airtable Config
  AIRTABLE_QUIZ_API_KEY: window.ENV?.AIRTABLE_QUIZ_API_KEY || 'YOUR_QUIZ_API_KEY_HERE',
  AIRTABLE_QUIZ_BASE_ID: window.ENV?.AIRTABLE_QUIZ_BASE_ID || 'YOUR_QUIZ_BASE_ID_HERE',

  // Registration Modal Airtable Config
  AIRTABLE_REGISTRATION_API_KEY: window.ENV?.AIRTABLE_REGISTRATION_API_KEY || 'YOUR_REGISTRATION_API_KEY_HERE',
  AIRTABLE_REGISTRATION_BASE_ID: window.ENV?.AIRTABLE_REGISTRATION_BASE_ID || 'YOUR_REGISTRATION_BASE_ID_HERE',

  // GHL Webhook URL
  GHL_WEBHOOK_URL: window.ENV?.GHL_WEBHOOK_URL || 'YOUR_WEBHOOK_URL_HERE'
};
