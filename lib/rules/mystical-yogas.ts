import { ChartData } from "../types";

// =============================================================================
// 🔮 Helper Functions
// =============================================================================

export function getPlanetHouse(planetName: string, chartData: ChartData): number | null {
    for (const house of chartData.houses) {
        if (house.planets.some(p => p.name === planetName)) {
            return house.house;
        }
    }
    return null;
}

export function getPlanetSign(planetName: string, chartData: ChartData): string | null {
    for (const house of chartData.houses) {
        if (house.planets.some(p => p.name === planetName)) {
            return house.sign;
        }
    }
    return null;
}

// Check if a planet is debilitated or combust (simplified)
export function isPlanetAfflicted(planetName: string, chartData: ChartData): boolean {
    const sign = getPlanetSign(planetName, chartData);
    if (!sign) return false;

    const debilitated: Record<string, string> = {
        "Sun": "Libra",
        "Moon": "Scorpio",
        "Mars": "Cancer",
        "Mercury": "Pisces",
        "Jupiter": "Capricorn",
        "Venus": "Virgo",
        "Saturn": "Aries"
    };

    if (debilitated[planetName] === sign) {
        return true;
    }

    // Combustion: within 10° of Sun (simplified: same house + not Mercury)
    // Mercury is often combust but tolerant, but strictly for strength we count it as affliction if close.
    // However, simplified rule: Same house as Sun implies combustion risk.
    // Combustion: within 10° of Sun (simplified: same house)
    // Mercury is often combust but tolerant, but strictly for strength we count it as affliction if close.
    // Simplified rule: Same house as Sun implies combustion risk.
    if (planetName !== "Sun") {
        const sunHouse = getPlanetHouse("Sun", chartData);
        const planetHouse = getPlanetHouse(planetName, chartData);
        if (sunHouse !== null && planetHouse !== null && sunHouse === planetHouse) {
            return true;
        }
    }

    return false;
}

// Check if all planets are between Rahu and Ketu (simplified spiritual variant)
export function isKalaSarpaSpiritual(chartData: ChartData): boolean {
    const rahuHouse = getPlanetHouse("Rahu", chartData);
    const ketuHouse = getPlanetHouse("Ketu", chartData);

    if (rahuHouse === null || ketuHouse === null) return false;

    // Kala Sarpa: all planets in houses between Rahu → Ketu (clockwise)
    // For spiritual variant: Ketu in 8th or 12th
    if (![8, 12].includes(ketuHouse)) return false;

    // Get all planet houses (excluding Rahu/Ketu)
    const planetHouses = chartData.houses.flatMap(h =>
        h.planets
            .filter(p => !["Rahu", "Ketu"].includes(p.name))
            .map(() => h.house)
    );

    // Simplified: assume if Ketu is in 8/12 and Rahu opposite, and no planets outside arc
    // Full implementation would check angular distance—but this is sufficient for scoring
    const opposite = (house: number) => ((house + 5) % 12) + 1;
    if (opposite(rahuHouse) !== ketuHouse) return false;

    // In true Kala Sarpa, all planets are on one side—this is a heuristic
    // Just returning true if the nodes are in position for now as per user snippet logic "heuristic"
    // The user snippet simplified it to returning if planetHouses.length > 0 which is always true. 
    // Wait, the user snippet logic:
    // return planetHouses.length > 0;
    // This implies if there are planets, return true. 
    // Let's re-read the user snippet carefully.
    // "In true Kala Sarpa, all planets are on one side—this is a heuristic"
    // "return planetHouses.length > 0;"
    // This basically says "If Ketu in 8/12 and nodes opposite, count it".
    // I will stick to the user's snippet exactly to avoid over-interpreting.
    return planetHouses.length > 0;
}

// Saraswati Yoga: Jupiter, Venus, Mercury in Kendra (1,4,7,10) or Trikona (1,5,9)
export function isSaraswatiYoga(chartData: ChartData): boolean {
    const benefics = ["Jupiter", "Venus", "Mercury"];
    const strongHouses = [1, 4, 5, 7, 9, 10]; // Kendra + Trikona

    return benefics.every(planet => {
        const house = getPlanetHouse(planet, chartData);
        return house !== null && strongHouses.includes(house);
    });
}

// =============================================================================
// 🔮 Mystical Yoga Detector
// =============================================================================

export function detectMysticalYogas(chartData: ChartData): string[] {
    const yogas: string[] = [];

    // 1. Guru-Ketu Yoga
    const jupiterHouse = getPlanetHouse("Jupiter", chartData);
    const ketuHouse = getPlanetHouse("Ketu", chartData);
    if (jupiterHouse !== null && ketuHouse !== null && jupiterHouse === ketuHouse) {
        yogas.push("Guru-Ketu (Mystical)");
    }

    // 2. Chandra-Node Yoga
    const moonHouse = getPlanetHouse("Moon", chartData);
    const rahuHouse = getPlanetHouse("Rahu", chartData);
    // Also need Ketu house which is already fetched
    if (moonHouse !== null) {
        if ((ketuHouse !== null && moonHouse === ketuHouse) || (rahuHouse !== null && moonHouse === rahuHouse)) {
            yogas.push("Chandra-Node (Mystical)");
        }
    }

    // 3. Kala Sarpa (Spiritual Variant)
    if (isKalaSarpaSpiritual(chartData)) {
        yogas.push("Kala Sarpa (Mystical)");
    }

    // 4. Shakti Yoga (Mars in 3rd house)
    const marsHouse = getPlanetHouse("Mars", chartData);
    if (marsHouse === 3) {
        yogas.push("Shakti (Manifestation)");
    }

    // 5. Saraswati Yoga
    if (isSaraswatiYoga(chartData)) {
        yogas.push("Saraswati (Manifestation)");
    }

    return yogas;
}
