
import { ChartData, House } from "./types";

// Zodiac signs in order (for house assignment)
const ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

/**
 * Normalizes raw API response data into a strict ChartData structure
 * expected by the Council Evaluators.
 */
export function normalizeChartData(rawApiData: any): ChartData {
    // 1. PASSTHROUGH CHECK: Is it already strict ChartData?
    if (rawApiData?.houses && Array.isArray(rawApiData.houses) && rawApiData.ascendantSign) {
        // Double check it has planets
        const hasPlanets = rawApiData.houses.some((h: any) => h.planets?.length > 0);
        if (hasPlanets) {
            console.log("Chart Normalizer: Data is already normalized.");
            return rawApiData as ChartData;
        }
    }

    // 2. PARTIAL CHECK: Does it have 'houses' but missing Ascendant?
    if (rawApiData?.houses && Array.isArray(rawApiData.houses)) {
        console.log("Chart Normalizer: partial 'houses' found. Attempting to wrap.");
        // Try to derive Ascendant from House 1 sign
        const ascSign = rawApiData.houses.find((h: any) => h.house === 1)?.sign || "Aries";
        return {
            ascendantSign: ascSign,
            houses: rawApiData.houses
        };
    }

    const houses: House[] = [];

    // Initialize 12 houses
    for (let i = 1; i <= 12; i++) {
        houses.push({
            house: i,
            sign: "",
            planets: []
        });
    }

    // Handle different API response structures
    // Sometimes it's directly the output object, sometimes it's wrapped in { output: ... }
    const dataOutput = rawApiData.output || rawApiData;

    // The API might return data in output[0] (numeric keys) or output[1] (named keys)
    // or sometimes simply as the object itself if it was already pre-processed partially.
    // We look for planet data.
    let planetData = null;

    if (Array.isArray(dataOutput)) {
        planetData = dataOutput[1] || dataOutput[0];
    } else if (typeof dataOutput === 'object') {
        planetData = dataOutput;
    }

    if (!planetData) {
        console.error("Chart Normalizer: No planet data found", rawApiData);
        // Return empty structure to avoid crashes, valid evaluators will just see no planets
        return { ascendantSign: "Aries", houses };
    }

    // Find the Ascendant to determine house signs
    let ascendantSignId = 1; // Default to Aries (sign 1)

    // Check various possible locations for Ascendant info
    if (planetData.Ascendant) {
        ascendantSignId = planetData.Ascendant.current_sign || 1;
    } else if (planetData["0"] && planetData["0"].name === "Ascendant") {
        ascendantSignId = planetData["0"].current_sign || 1;
    }

    // Assign signs to houses (starting from ascendant sign)
    const ascendantIndex = ascendantSignId - 1; // Convert 1-indexed to 0-indexed
    for (let i = 0; i < 12; i++) {
        const signIndex = (ascendantIndex + i) % 12;
        houses[i].sign = ZODIAC_SIGNS[signIndex];
    }

    // Process planets
    const entries = Object.entries(planetData);

    entries.forEach(([key, details]: [string, any]) => {
        // Skip non-planet entries
        if (!details || typeof details !== 'object') return;
        if (key === 'debug' || details.name === 'ayanamsa') return;

        // Determine planet name and house
        const planetName = details.name || key;
        const houseNumber = typeof details.house_number === 'string'
            ? parseInt(details.house_number, 10)
            : details.house_number;

        const isRetro = details.isRetro === "true" || details.isRetro === true;

        // Only add if this is a planet with a valid house number
        if (planetName && planetName !== "Ascendant" && !isNaN(houseNumber) && houseNumber >= 1 && houseNumber <= 12) {
            houses[houseNumber - 1].planets.push({
                name: planetName,
                isRetro: isRetro
            });
        }
    });

    const ascendantSignName = ZODIAC_SIGNS[ascendantIndex];

    return {
        ascendantSign: ascendantSignName,
        houses: houses
    };
}
