import { ChartData, House, YogaEvaluationResult, CareerEvaluationResult, LoveEvaluationResult, ManifestationEvaluationResult, SupernaturalEvaluationResult } from "../types";
import { detectMysticalYogas, getPlanetHouse, getPlanetSign, isPlanetAfflicted } from "./mystical-yogas";

// =============================================================================
// 🛠️ Helpers
// =============================================================================

const SIGN_RULERS: Record<string, string> = {
    "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
    "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
    "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
};

function getPlanetForSign(sign: string): string {
    return SIGN_RULERS[sign] || "Sun";
}

// =============================================================================
// 🔮 Yoga Detection (Mahapurusha + General + Mystical)
// =============================================================================

function detectMahapurushaYogas(chartData: ChartData): string[] {
    const yogas: string[] = [];

    const getPlanetInfo = (planetName: string): { house: number | null; sign: string | null } => {
        for (const house of chartData.houses) {
            if (house.planets.some(p => p.name === planetName)) {
                return { house: house.house, sign: house.sign };
            }
        }
        return { house: null, sign: null };
    };

    // 1. Ruchaka Yoga (Mars)
    const { house: marsHouse, sign: marsSign } = getPlanetInfo("Mars");
    if (marsHouse && [1, 4, 7, 10].includes(marsHouse) && marsSign) {
        if (["Aries", "Scorpio", "Capricorn"].includes(marsSign) && !isPlanetAfflicted("Mars", chartData)) {
            yogas.push("Ruchaka (Mahapurusha)");
        }
    }

    // 2. Bhadra Yoga (Mercury)
    const { house: mercuryHouse, sign: mercurySign } = getPlanetInfo("Mercury");
    if (mercuryHouse && [1, 4, 7, 10].includes(mercuryHouse) && mercurySign) {
        if (["Gemini", "Virgo"].includes(mercurySign) && !isPlanetAfflicted("Mercury", chartData)) {
            yogas.push("Bhadra (Mahapurusha)");
        }
    }

    // 3. Hamsa Yoga (Jupiter)
    const { house: jupiterHouse, sign: jupiterSign } = getPlanetInfo("Jupiter");
    if (jupiterHouse && [1, 4, 7, 10].includes(jupiterHouse) && jupiterSign) {
        if (["Sagittarius", "Pisces", "Cancer"].includes(jupiterSign) && !isPlanetAfflicted("Jupiter", chartData)) {
            yogas.push("Hamsa (Mahapurusha)");
        }
    }

    // 4. Malavya Yoga (Venus)
    const { house: venusHouse, sign: venusSign } = getPlanetInfo("Venus");
    if (venusHouse && [1, 4, 7, 10].includes(venusHouse) && venusSign) {
        if (["Taurus", "Libra", "Pisces"].includes(venusSign) && !isPlanetAfflicted("Venus", chartData)) {
            yogas.push("Malavya (Mahapurusha)");
        }
    }

    // 5. Sasa Yoga (Saturn)
    const { house: saturnHouse, sign: saturnSign } = getPlanetInfo("Saturn");
    if (saturnHouse && [1, 4, 7, 10].includes(saturnHouse) && saturnSign) {
        if (["Capricorn", "Aquarius", "Libra"].includes(saturnSign) && !isPlanetAfflicted("Saturn", chartData)) {
            yogas.push("Sasa (Mahapurusha)");
        }
    }

    return yogas;
}

function detectGeneralYogas(chartData: ChartData): string[] {
    const yogas: string[] = [];

    // Opposite house lookup
    const OPPOSITE_HOUSE: Record<number, number> = {
        1: 7, 2: 8, 3: 9, 4: 10, 5: 11, 6: 12,
        7: 1, 8: 2, 9: 3, 10: 4, 11: 5, 12: 6
    };

    // Budhaditya: Sun + Mercury same house
    const sunHouse = chartData.houses.find(h => h.planets.some(p => p.name === "Sun"))?.house;
    const mercuryHouse = chartData.houses.find(h => h.planets.some(p => p.name === "Mercury"))?.house;
    if (sunHouse !== undefined && mercuryHouse !== undefined && sunHouse === mercuryHouse) {
        yogas.push("Budhaditya (Auspicious)");
    }

    // Chandra-Mangala: Moon + Mars same or opposite
    const moonHouse = chartData.houses.find(h => h.planets.some(p => p.name === "Moon"))?.house;
    const marsHouse = chartData.houses.find(h => h.planets.some(p => p.name === "Mars"))?.house;
    if (moonHouse !== undefined && marsHouse !== undefined) {
        if (moonHouse === marsHouse || OPPOSITE_HOUSE[moonHouse] === marsHouse) {
            yogas.push("Chandra Mangala (Auspicious)");
        }
    }

    // Gaja Kesari: Jupiter in Kendra (1,4,7,10) FROM Moon
    const jupiterHouse = chartData.houses.find(h => h.planets.some(p => p.name === "Jupiter"))?.house;
    if (moonHouse !== undefined && jupiterHouse !== undefined) {
        const housesFromMoon = ((jupiterHouse - moonHouse + 12) % 12) + 1;
        if ([1, 4, 7, 10].includes(housesFromMoon)) {
            yogas.push("Gaja Kesari (Auspicious)");
        }
    }

    return yogas;
}

export function evaluateYogas(chartData: ChartData): YogaEvaluationResult {
    const mahapurushaYogas = detectMahapurushaYogas(chartData);
    const generalYogas = detectGeneralYogas(chartData);
    const mysticalYogas = detectMysticalYogas(chartData);

    // Scoring Logic:
    // 1. Auspiciousness is driven by Mahapurusha & General Yogas.
    // 2. Mystical Yogas do NOT inflate Auspiciousness (they feed Supernatural).
    const auspiciousYogas = [...mahapurushaYogas, ...generalYogas];
    const allYogas = [...auspiciousYogas, ...mysticalYogas];

    let score = 5; // Base
    let reasoningParts: string[] = [];

    // Tier 1: Mahapurusha Yogas (The Gold Standard)
    if (mahapurushaYogas.length >= 1) {
        score = 8;
        if (mahapurushaYogas.length >= 2) {
            score = 10;
            reasoningParts.push("Multiple Great Person (Mahapurusha) Yogas detected, indicating legendary potential");
        } else {
            reasoningParts.push("Great Person (Mahapurusha) Yoga detected, indicating exceptional potential");
        }
    }

    // Tier 2: Powerful Auspicious Yogas (Gaja Kesari)
    const tier2Yogas = generalYogas.filter(y => y.includes("Gaja Kesari"));
    const hasTier2 = tier2Yogas.length > 0;

    if (hasTier2) {
        if (score < 8) {
            score = 8;
            reasoningParts.push("Powerful Auspicious Yoga (Gaja Kesari) detected, ensuring success");
        } else if (score === 8) {
            score = 10; // Mahapurusha + Gaja Kesari = 10
            reasoningParts.push("Combination of Mahapurusha and Gaja Kesari Yoga amplifies chart to highest degree");
        }
    }

    // Tier 3: General Supportive Yogas (Budhaditya, Chandra Mangala)
    // These add minor boosts but do not push score to 10 unless combined with Tier 1/2
    const tier3Yogas = generalYogas.filter(y => !y.includes("Gaja Kesari"));
    if (tier3Yogas.length > 0) {
        if (score < 8) {
            score += 1; // Minor boost to base
            reasoningParts.push("Supportive yogas present, adding strength to the chart");
        } else if (score === 8) {
            // Check if Tier 2 was already applied. If it was, we are at 8. 
            // If Tier 1 was applied, we are at 8.
            // If Tier 2 (Gaja Kesari) is also present, it would have pushed to 10 already.
            // So if we are at 8 here, it means we have [1 Mahapurusha OR 1 Gaja Kesari] AND [Tier 3 yoga].
            // This should sum to 9.
            score = 9;
            reasoningParts.push("Additional auspicious yogas support the primary placement, creating a robust chart");
        }
        // IMPORTANT: Be careful not to overwrite a 10 from Tier 1+2.
        // The previous logic was: if (score === 8) score = 9. 
        // If score is already 10 (from Mahapurusha + Gaja Kesari), this block does nothing, which is correct.
    }

    // Fallback reasoning
    if (reasoningParts.length === 0) {
        reasoningParts.push("No major auspicious yogas detected; chart relies on planetary strength");
    }

    return {
        score: Math.min(10, score),
        yogaCount: allYogas.length,
        yogasIdentified: allYogas,
        reasoning: reasoningParts.join(". ") + ".",
        keyFindings: allYogas
    };
}

// =============================================================================
// 💼 Career Scoring
// =============================================================================

export function evaluateCareer(chartData: ChartData): CareerEvaluationResult {
    let score = 5; // Base: Average Career (Employment)
    let reasoningParts: string[] = [];

    // 10th house planets (Sun, Mars, Saturn, Jupiter = +0.5 each to avoid inflation)
    const tenthHouse = chartData.houses.find(h => h.house === 10);
    if (tenthHouse) {
        const strongPlanets = ["Sun", "Mars", "Saturn", "Jupiter"];
        const strongCount = tenthHouse.planets
            .filter(p => strongPlanets.includes(p.name))
            .length;
        score += strongCount * 0.5; // Adjusted from +1 to +0.5 for Base 5
        if (strongCount > 0) {
            reasoningParts.push(`Presence of powerful planets (${tenthHouse.planets.map(p => p.name).join(", ")}) in the 10th House boosts authority`);
        }
    }

    // Lord of 10th Logic
    const tenthLordSign = tenthHouse?.sign || "Aries";
    const tenthLordHouse = chartData.houses.find(h =>
        h.planets.some(p => p.name === getPlanetForSign(tenthLordSign))
    )?.house;

    if (tenthLordHouse) {
        if ([1, 4, 7, 10, 5, 9].includes(tenthLordHouse)) {
            score += 1.5; // Reduced from +2
            reasoningParts.push(`The Lord of the 10th House is strongly placed in House ${tenthLordHouse}, ensuring professional stability`);
        } else if ([6, 8, 12].includes(tenthLordHouse)) {
            score -= 1.5; // Penalty
            reasoningParts.push(`Lord of 10th House in challenging placement (House ${tenthLordHouse}) suggests career obstacles`);
        }
    }

    // Penalty: Afflicted Sun (Karaka for Career)
    if (isPlanetAfflicted("Sun", chartData)) {
        score -= 1;
        reasoningParts.push("Afflicted Sun indicates challenges with authority or recognition");
    }

    // Amala Yoga: Benefic (Jup, Ven, Merc) in 10th (+2)
    if (tenthHouse) {
        const benefics = ["Jupiter", "Venus", "Mercury"];
        const beneficPlanets = tenthHouse.planets.filter(p => benefics.includes(p.name));
        if (beneficPlanets.length > 0) {
            score += 2;
            reasoningParts.push(`Amala Yoga detected: Benefics in the 10th House (${beneficPlanets.map(p => p.name).join(", ")}) support righteous success`);
        }
    }

    // Sun strength (+1.5)
    const sunHouseObj = chartData.houses.find(h => h.planets.some(p => p.name === "Sun")) || null;
    if (sunHouseObj) {
        if (sunHouseObj.sign === "Leo" || sunHouseObj.sign === "Aries") {
            score += 1.5;
            reasoningParts.push("Sun is Exalted or in Own Sign, granting strong leadership capability");
        }
    }

    // Saturn strength (+1.5)
    const saturnHouseObj = chartData.houses.find(h => h.planets.some(p => p.name === "Saturn")) || null;
    if (saturnHouseObj) {
        if (["Capricorn", "Aquarius", "Libra"].includes(saturnHouseObj.sign)) {
            score += 1.5;
            reasoningParts.push("Saturn is strong, providing discipline and endurance");
        }
    }

    if (reasoningParts.length === 0) {
        reasoningParts.push("Career path requires consistent effort to build momentum");
    }

    return {
        score: Math.min(10, Math.round(score * 2) / 2),
        reasoning: reasoningParts.join(". ") + ".",
        keyFindings: []
    };
}

// =============================================================================
// ❤️ Love Scoring
// =============================================================================

export function evaluateLove(chartData: ChartData): LoveEvaluationResult {
    let score = 5; // Base: Average Relationships
    let reasoningParts: string[] = [];

    // 7th house benefics (+1 each, adjusted from 1.5)
    const seventhHouse = chartData.houses.find(h => h.house === 7);
    if (seventhHouse) {
        const benefics = ["Venus", "Jupiter", "Moon", "Mercury"];
        const beneficPlanets = seventhHouse.planets.filter(p => benefics.includes(p.name));
        const beneficCount = beneficPlanets.length;

        score += beneficCount * 1.0;
        if (beneficCount > 0) {
            reasoningParts.push(`Benefics in 7th House (${beneficPlanets.map(p => p.name).join(", ")}) promote harmony`);
        }

        // Malefics in 7th (-1)
        const malefics = ["Mars", "Saturn", "Rahu", "Ketu"];
        const maleficPlanets = seventhHouse.planets.filter(p => malefics.includes(p.name));
        const maleficCount = maleficPlanets.length;

        score -= maleficCount; // Keep -1 penalty
        if (maleficCount > 0) {
            reasoningParts.push(`Challenges indicated by harsh planets in 7th House (${maleficPlanets.map(p => p.name).join(", ")})`);
        }
    }

    // Lord of 7th Logic
    const seventhSign = seventhHouse?.sign || "Aries";
    const seventhLord = getPlanetForSign(seventhSign);
    const seventhLordHouse = chartData.houses.find(h =>
        h.planets.some(p => p.name === seventhLord)
    )?.house;

    if (seventhLordHouse) {
        if ([1, 4, 7, 10, 5, 9].includes(seventhLordHouse)) {
            score += 1.0; // Reduced from 1.5
            reasoningParts.push("Lord of Relationships is securely placed, favoring commitment");
        } else if ([6, 8, 12].includes(seventhLordHouse)) {
            score -= 1.5; // Penalty
            reasoningParts.push(`Lord of Relationships in House ${seventhLordHouse} suggests emotional separation or delays`);
        }
    }

    // Venus strength
    const venusHouseObj = chartData.houses.find(h => h.planets.some(p => p.name === "Venus"));
    if (venusHouseObj) {
        if (["Taurus", "Libra", "Pisces"].includes(venusHouseObj.sign)) {
            score += 2; // Exalted/own
            reasoningParts.push("Venus is strong, enhancing romance and charm");
        }
        if (venusHouseObj.sign === "Virgo") {
            score -= 1.5; // Debilitated
            reasoningParts.push("Venus is debilitated in Virgo, suggesting need for practicality in love");
        }
        // Venus + Mars conjunction (+1)
        const marsHouse = chartData.houses.find(h => h.planets.some(p => p.name === "Mars"))?.house;
        if (marsHouse === venusHouseObj.house) {
            score += 1;
            reasoningParts.push("Venus-Mars conjunction adds passion");
        }
    }

    // Jupiter aspecting 7th (+1)
    const jupiterHouse = chartData.houses.find(h => h.planets.some(p => p.name === "Jupiter"))?.house;
    if (jupiterHouse && [7, 11, 1, 3].includes(jupiterHouse)) {
        score += 1;
        reasoningParts.push("Jupiter aspects the House of Marriage, offering protection");
    }

    if (reasoningParts.length === 0) {
        reasoningParts.push("Standard relationship prospects; depends on dasha cycles");
    }

    return {
        score: Math.min(10, Math.round(score * 2) / 2),
        reasoning: reasoningParts.join(". ") + ".",
        keyFindings: []
    };
}

// =============================================================================
// 🌀 Manifestation Scoring
// =============================================================================

export function evaluateManifestation(chartData: ChartData, yogaResult: YogaEvaluationResult): ManifestationEvaluationResult {
    let score = 5; // Base: Average Manifestation
    let reasoningParts: string[] = [];

    // 11th house planets (+0.5 each, adjusted)
    const eleventhHouse = chartData.houses.find(h => h.house === 11);
    if (eleventhHouse) {
        score += eleventhHouse.planets.length * 0.5;
        if (eleventhHouse.planets.length > 0) {
            reasoningParts.push(`Active 11th House (${eleventhHouse.planets.map(p => p.name).join(", ")}) signifies gains and networking`);
        }
    }

    // Lord of 11th Logic
    const eleventhSign = eleventhHouse?.sign || "Aries";
    const eleventhLord = getPlanetForSign(eleventhSign);
    const eleventhLordHouse = chartData.houses.find(h =>
        h.planets.some(p => p.name === eleventhLord)
    );
    if (eleventhLordHouse) {
        // Strong Sign Logic (Existing)
        const sign = eleventhLordHouse.sign;
        const planet = eleventhLord;
        const exaltedOwn: Record<string, string[]> = {
            "Sun": ["Leo", "Aries"],
            "Moon": ["Cancer", "Taurus"],
            "Mars": ["Aries", "Scorpio", "Capricorn"],
            "Mercury": ["Gemini", "Virgo"],
            "Jupiter": ["Sagittarius", "Pisces", "Cancer"],
            "Venus": ["Taurus", "Libra", "Pisces"],
            "Saturn": ["Capricorn", "Aquarius", "Libra"]
        };
        if (exaltedOwn[planet]?.includes(sign)) {
            score += 1.5; // Reduced from 2
            reasoningParts.push(`Lord of Gains (${eleventhLord}) is strong in ${sign}, amplifying results`);
        }

        // Penalty Logic
        if ([6, 8, 12].includes(eleventhLordHouse.house)) {
            score -= 1.5;
            reasoningParts.push(`Lord of Gains in challenging placement (House ${eleventhLordHouse.house}) indicates fluctuating income`);
        }
    }

    // 3rd house malefics (+1.0)
    const thirdHouse = chartData.houses.find(h => h.house === 3);
    if (thirdHouse) {
        const malefics = ["Mars", "Saturn", "Sun", "Rahu"];
        const maleficCount = thirdHouse.planets
            .filter(p => malefics.includes(p.name))
            .length;
        score += maleficCount * 1.0; // Reduced from 1.5
        if (maleficCount > 0) {
            reasoningParts.push("Malefics in 3rd House boost courage and self-effort");
        }
    }

    // Lord of 3rd Logic
    const thirdSign = thirdHouse?.sign || "Aries";
    const thirdLord = getPlanetForSign(thirdSign);
    const thirdLordHouse = chartData.houses.find(h =>
        h.planets.some(p => p.name === thirdLord)
    );
    if (thirdLordHouse) {
        // Strength
        const sign = thirdLordHouse.sign;
        const planet = thirdLord;
        const exaltedOwn = {
            "Sun": ["Leo", "Aries"],
            ...SIGN_RULERS // Simplified hack but better to rely on known map. Let's reuse existing map logic or just check sign.
        };
        // Re-using the explicit map from above for safety in this scope:
        const exaltedOwnMap: Record<string, string[]> = {
            "Sun": ["Leo", "Aries"],
            "Moon": ["Cancer", "Taurus"],
            "Mars": ["Aries", "Scorpio", "Capricorn"],
            "Mercury": ["Gemini", "Virgo"],
            "Jupiter": ["Sagittarius", "Pisces", "Cancer"],
            "Venus": ["Taurus", "Libra", "Pisces"],
            "Saturn": ["Capricorn", "Aquarius", "Libra"]
        };

        if (exaltedOwnMap[planet as keyof typeof exaltedOwnMap]?.includes(sign)) {
            score += 1;
            reasoningParts.push("Lord of Effort is strong, supporting initiative");
        }

        // Penalty
        if ([6, 8, 12].includes(thirdLordHouse.house)) {
            score -= 1;
            reasoningParts.push("Lord of Effort in weak house limits initiative");
        }
    }

    // Mars strength (+2)
    const marsHouseObj = chartData.houses.find(h => h.planets.some(p => p.name === "Mars"));
    if (marsHouseObj) {
        if (["Aries", "Scorpio", "Capricorn"].includes(marsHouseObj.sign)) {
            score += 2;
            reasoningParts.push("Strong Mars indicates exceptional willpower");
        }
    }

    // Manifestation Bonuses from Mystical Yogas
    const mysticalYogas = yogaResult.yogasIdentified.filter(y => y.includes("(Manifestation)"));
    for (const yoga of mysticalYogas) {
        if (yoga.includes("Shakti")) {
            const marsSign = getPlanetSign("Mars", chartData);
            if (marsSign && ["Aries", "Scorpio", "Capricorn"].includes(marsSign)) {
                score += 2; // Mars strong
                reasoningParts.push("Shakti Yoga (with exalted Mars) maximizes manifesting power");
            } else {
                score += 1.5;
                reasoningParts.push("Shakti Yoga present, granting energy for achievement");
            }
        }
        if (yoga.includes("Saraswati")) {
            score += isPlanetAfflicted("Mercury", chartData) ? 1 : 1.5;
            reasoningParts.push("Saraswati Yoga adds intellectual and creative power to manifestation");
        }
    }

    // Chart Power Bonus: +1 if any Tier 1/2 yoga (including general)
    if (yogaResult.yogaCount > 0) {
        score += 1;
        // This is a general bonus, we can append it or leave it implicit in the high score.
        // Let's add it for clarity.
        reasoningParts.push(`General chart strength (+${yogaResult.yogaCount} Yogas) reinforces success`);
    }

    if (reasoningParts.length === 0) {
        reasoningParts.push("Manifestation relies on steady, consistent work rather than bursts of power");
    }

    return {
        score: Math.min(10, Math.round(score * 2) / 2),
        reasoning: reasoningParts.join(". ") + ".",
        keyFindings: mysticalYogas
    };
}

// =============================================================================
// 🌌 Supernatural Scoring (Replaces "Spiritual")
// =============================================================================

export function evaluateSupernatural(
    chartData: ChartData,
    yogaResult: YogaEvaluationResult
): SupernaturalEvaluationResult {
    let score = 5; // Base: Average Intuition (Functional)
    let reasoningParts: string[] = [];

    // 1. Penalties (The "Blocked" State)
    if (isPlanetAfflicted("Moon", chartData)) {
        score -= 1.5;
        reasoningParts.push("Emotional turbulence hinders clarity (Afflicted Moon)");
    }
    if (isPlanetAfflicted("Jupiter", chartData)) {
        score -= 1;
        reasoningParts.push("Lack of spiritual faith or wisdom creates skepticism (Afflicted Jupiter)");
    }

    // 2. Moksha Houses (4, 8, 12) - The "Open Door"
    const ketuHouse = getPlanetHouse("Ketu", chartData);
    if (ketuHouse && [4, 8, 12].includes(ketuHouse)) {
        score += 2;
        reasoningParts.push(`Ketu in Moksha House (${ketuHouse}) opens door to liberation`);
    }

    // 3. Mystical Yogas - The "Gift"
    const mysticalYogas = yogaResult.yogasIdentified.filter(y => y.includes("(Mystical)"));

    for (const yoga of mysticalYogas) {
        if (yoga.includes("Guru-Ketu")) {
            // Contextual Bonus
            const ketuHouse = getPlanetHouse("Ketu", chartData);
            if (ketuHouse && [8, 12].includes(ketuHouse)) {
                score += isPlanetAfflicted("Jupiter", chartData) ? 1.5 : 2;
                reasoningParts.push("Guru-Ketu Yoga in Moksha house indicates profound spiritual wisdom");
            } else {
                score += 2; // Increased from +1 to +2 per user request
                reasoningParts.push("Guru-Ketu Yoga detected, granting deep spiritual insight");
            }
        }
        if (yoga.includes("Chandra-Node")) {
            const moonSign = getPlanetSign("Moon", chartData);
            if (moonSign && ["Cancer", "Scorpio", "Pisces"].includes(moonSign)) {
                score += 2; // Water sign amplifies
                reasoningParts.push("Chandra-Node Yoga in Water sign heightens psychic sensitivity");
            } else {
                score += 1.5;
                reasoningParts.push("Chandra-Node Yoga suggests intuitive nature");
            }
        }
        if (yoga.includes("Kala Sarpa")) {
            score += isPlanetAfflicted("Moon", chartData) ? 1 : 1.5;
            reasoningParts.push("Kala Sarpa Yoga (Spiritual) creates intense life path focused on destiny");
        }
    }

    // Default reasoning for "Average" charts
    if (reasoningParts.length === 0) {
        if (score === 5) {
            reasoningParts.push("Standard intuition; relies on logic and sensory perception");
        } else if (score < 5) {
            reasoningParts.push("Intuition may be clouded by skepticism or emotional volatility");
        }
    }

    return {
        score: Math.min(10, Math.round(score * 2) / 2),
        reasoning: reasoningParts.join(". ") + ".",
        keyFindings: mysticalYogas
    };
}

// =============================================================================
// 🧩 Unified Scorer
// =============================================================================

export interface CouncilFindings {
    auspiciousness: YogaEvaluationResult;
    career: CareerEvaluationResult;
    manifestation: ManifestationEvaluationResult;
    love: LoveEvaluationResult;
    supernatural: SupernaturalEvaluationResult;
}

export function calculateAllScores(chartData: ChartData): CouncilFindings {
    const findings = evaluateYogas(chartData);

    return {
        auspiciousness: findings,
        career: evaluateCareer(chartData),
        manifestation: evaluateManifestation(chartData, findings),
        love: evaluateLove(chartData),
        supernatural: evaluateSupernatural(chartData, findings)
    };
}
