export async function GET(request: Request) {
  try {
    const placeId = process.env.VITE_GOOGLE_PLACE_ID;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!placeId || !apiKey) {
      return new Response(JSON.stringify({ error: 'Missing configuration' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Google API responded with ${response.status}`);
    }

    const data: any = await response.json();

    return new Response(JSON.stringify(data.result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache for 1 hour to prevent hitting Google API rate limits
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching Google Reviews:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch reviews' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
