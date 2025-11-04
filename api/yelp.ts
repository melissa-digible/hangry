import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const YELP_API_KEY = process.env.VITE_YELP_API_KEY;
  
  if (!YELP_API_KEY) {
    return res.status(500).json({ error: 'Yelp API key not configured' });
  }

  try {
    // Get the path from the query parameter
    const path = req.url?.replace('/api/yelp', '') || '/businesses/search';
    const yelpUrl = `https://api.yelp.com/v3${path}`;

    const response = await fetch(yelpUrl, {
      headers: {
        'Authorization': `Bearer ${YELP_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Yelp API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch from Yelp API',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

