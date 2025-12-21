const BASE_URL = 'https://json.freeastrologyapi.com';

export interface BirthData {
    name: string;
    year: number;
    month: number;
    date: number;
    hours: number;
    minutes: number;
    seconds: number;
    latitude: number;
    longitude: number;
    timezone: number;
}

export async function getBirthChart(data: BirthData) {
    const apiKey = process.env.NEXT_PUBLIC_ASTROLOGY_API_KEY;

    console.log('[ASTROLOGY] API Key present:', !!apiKey);
    console.log('[ASTROLOGY] API Key prefix:', apiKey?.substring(0, 10) + '...');

    if (!apiKey) {
        console.error('[ASTROLOGY] ❌ API key is missing!');
        throw new Error('Astrology API key is missing');
    }

    console.log('[ASTROLOGY] Making request to:', `${BASE_URL}/planets`);

    const response = await fetch(`${BASE_URL}/planets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
        },
        body: JSON.stringify({
            year: data.year,
            month: data.month,
            date: data.date,
            hours: data.hours,
            minutes: data.minutes,
            seconds: data.seconds,
            latitude: data.latitude,
            longitude: data.longitude,
            timezone: data.timezone,
            config: {
                observation_point: 'topocentric',
                ayanamsha: 'lahiri',
            },
        }),
    });

    console.log('[ASTROLOGY] Response status:', response.status, response.statusText);

    if (!response.ok) {
        const errorData = await response.json();
        console.error('[ASTROLOGY] ❌ Error response:', errorData);
        throw new Error(errorData.message || 'Failed to fetch birth chart');
    }

    console.log('[ASTROLOGY] ✅ Birth chart fetched successfully');
    return response.json();
}
