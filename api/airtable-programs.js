// Serverless function to proxy Airtable programs/sessions/instructors requests
// This keeps API keys server-side and never exposes them to browsers

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { table, recordId, filterByFormula, maxRecords, view, sort } = req.query;

    // Validate required parameters
    if (!table) {
      return res.status(400).json({ error: 'table parameter is required' });
    }

    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const API_KEY = process.env.AIRTABLE_PROGRAMS_API_KEY;

    // Debug logging
    console.log('BASE_ID:', BASE_ID ? 'SET' : 'MISSING');
    console.log('API_KEY:', API_KEY ? 'SET' : 'MISSING');

    // Validate environment variables
    if (!BASE_ID || !API_KEY) {
      console.error('Missing Airtable configuration - BASE_ID:', BASE_ID, 'API_KEY:', API_KEY);
      return res.status(500).json({ error: 'Server configuration error', debug: { BASE_ID: !!BASE_ID, API_KEY: !!API_KEY } });
    }

    // Build Airtable API URL
    let url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;

    if (recordId) {
      url += `/${recordId}`;
    }

    // Add query parameters
    const params = new URLSearchParams();
    if (filterByFormula) params.append('filterByFormula', filterByFormula);
    if (maxRecords) params.append('maxRecords', maxRecords);
    if (view) params.append('view', view);
    if (sort) params.append('sort[0][field]', sort);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    // Make request to Airtable API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Airtable request failed',
        details: data.error
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Airtable programs proxy error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
