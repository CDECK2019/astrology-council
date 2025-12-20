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

    if (!apiKey) {
        throw new Error('Astrology API key is missing');
    }

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
            settings: {
                observation_point: 'topocentric',
                ayanamsha: 'lahiri',
            },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch birth chart');
    }

    return response.json();
}
