import { ChartData, House, YogaEvaluationResult, CareerEvaluationResult, LoveEvaluationResult, ManifestationEvaluationResult, SpiritualEvaluationResult } from "../types";

// =============================================================================
// �️ Helpers
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
// �🔮 Yoga Detection (Mahapurusha + General)
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
        if (["Aries", "Scorpio", "Capricorn"].includes(marsSign) && marsSign !== "Cancer") {
            yogas.push("Ruchaka (Mahapurusha)");
        }
    }

    // 2. Bhadra Yoga (Mercury)
    const { house: mercuryHouse, sign: mercurySign } = getPlanetInfo("Mercury");
    if (mercuryHouse && [1, 4, 7, 10].includes(mercuryHouse) && mercurySign) {
        if (["Gemini", "Virgo"].includes(mercurySign) && mercurySign !== "Pisces") {
            yogas.push("Bhadra (Mahapurusha)");
        }
    }

    // 3. Hamsa Yoga (Jupiter)
    const { house: jupiterHouse, sign: jupiterSign } = getPlanetInfo("Jupiter");
    if (jupiterHouse && [1, 4, 7, 10].includes(jupiterHouse) && jupiterSign) {
        if (["Sagittarius", "Pisces", "Cancer"].includes(jupiterSign) && jupiterSign !== "Capricorn") {
            yogas.push("Hamsa (Mahapurusha)");
        }
    }

    // 4. Malavya Yoga (Venus)
    const { house: venusHouse, sign: venusSign } = getPlanetInfo("Venus");
    if (venusHouse && [1, 4, 7, 10].includes(venusHouse) && venusSign) {
        if (["Taurus", "Libra", "Pisces"].includes(venusSign) && venusSign !== "Virgo") {
            yogas.push("Malavya (Mahapurusha)");
        }
    }

    // 5. Sasa Yoga (Saturn)
    const { house: saturnHouse, sign: saturnSign } = getPlanetInfo("Saturn");
    if (saturnHouse && [1, 4, 7, 10].includes(saturnHouse) && saturnSign) {
        if (["Capricorn", "Aquarius", "Libra"].includes(saturnSign) && saturnSign !== "Aries") {
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
    const allYogas = [...mahapurushaYogas, ...generalYogas];

    let score = 5;
    if (allYogas.length >= 1) score = 8;
    if (allYogas.length >= 2) score = 10;
    if (mahapurushaYogas.length > 0 && score < 9) score = 9;

    return {
        score,
        yogaCount: allYogas.length,
        yogasIdentified: allYogas,
        reasoning: "Yogas verified by deterministic rules engine.",
        keyFindings: allYogas
    };
}

// =============================================================================
// 💼 Career Scoring
// =============================================================================

export function evaluateCareer(chartData: ChartData): CareerEvaluationResult {
    let score = 3; // Base

    // 10th house planets (Sun, Mars, Saturn, Jupiter = +1 each)
    const tenthHouse = chartData.houses.find(h => h.house === 10);
    if (tenthHouse) {
        const strongPlanets = ["Sun", "Mars", "Saturn", "Jupiter"];
        const strongCount = tenthHouse.planets
            .filter(p => strongPlanets.includes(p.name))
            .length;
        score += strongCount;
    }

    // Lord of 10th in Kendra/Trikona (+2)
    const tenthLordSign = tenthHouse?.sign || "Aries"; // fallback

    // FIXED: Removed redundant zodiac/tenthLord logic
    const tenthLordHouse = chartData.houses.find(h =>
        h.planets.some(p => p.name === getPlanetForSign(tenthLordSign))
    )?.house;

    if (tenthLordHouse && ([1, 4, 7, 10, 5, 9] as number[]).includes(tenthLordHouse)) {
        score += 2;
    }

    // Amala Yoga: Benefic (Jup, Ven, Merc) in 10th (+2)
    if (tenthHouse) {
        const benefics = ["Jupiter", "Venus", "Mercury"];
        if (tenthHouse.planets.some(p => benefics.includes(p.name))) {
            score += 2;
        }
    }

    // Sun strength (+1.5)
    // OPTIMIZATION: Added null safety (optional but good practice)
    const sunHouseObj = chartData.houses.find(h => h.planets.some(p => p.name === "Sun")) || null;
    if (sunHouseObj) {
        if (sunHouseObj.sign === "Leo" || sunHouseObj.sign === "Aries") {
            score += 1.5;
        }
    }

    // Saturn strength (+1.5)
    const saturnHouseObj = chartData.houses.find(h => h.planets.some(p => p.name === "Saturn")) || null;
    if (saturnHouseObj) {
        if (["Capricorn", "Aquarius", "Libra"].includes(saturnHouseObj.sign)) {
            score += 1.5;
        }
    }

    return {
        score: Math.min(10, Math.round(score * 2) / 2), // Cap at 10, allow .5
        reasoning: "Career score calculated from 10th house strength, lord placement, and planetary dignity.",
        keyFindings: []
    };
}

// =============================================================================
// ❤️ Love Scoring
// =============================================================================

export function evaluateLove(chartData: ChartData): LoveEvaluationResult {
    let score = 4; // Base

    // 7th house benefics (+1.5 each)
    const seventhHouse = chartData.houses.find(h => h.house === 7);
    if (seventhHouse) {
        const benefics = ["Venus", "Jupiter", "Moon", "Mercury"];
        const beneficCount = seventhHouse.planets
            .filter(p => benefics.includes(p.name))
            .length;
        score += beneficCount * 1.5;

        // Malefics in 7th (-1)
        // FIXED: Removed "Sun" from malefics in 7th House
        const malefics = ["Mars", "Saturn", "Rahu", "Ketu"];
        const maleficCount = seventhHouse.planets
            .filter(p => malefics.includes(p.name))
            .length;
        score -= maleficCount;
    }

    // Lord of 7th in Kendra/Trikona (+1.5)
    const seventhSign = seventhHouse?.sign || "Aries";
    const seventhLord = getPlanetForSign(seventhSign);
    const seventhLordHouse = chartData.houses.find(h =>
        h.planets.some(p => p.name === seventhLord)
    )?.house;
    if (seventhLordHouse && ([1, 4, 7, 10, 5, 9] as number[]).includes(seventhLordHouse)) {
        score += 1.5;
    }

    // Venus strength
    const venusHouseObj = chartData.houses.find(h => h.planets.some(p => p.name === "Venus"));
    if (venusHouseObj) {
        if (["Taurus", "Libra", "Pisces"].includes(venusHouseObj.sign)) {
            score += 2; // Exalted/own
        }
        if (venusHouseObj.sign === "Virgo") {
            score -= 1.5; // Debilitated
        }
        // Venus + Mars conjunction (+1)
        const marsHouse = chartData.houses.find(h => h.planets.some(p => p.name === "Mars"))?.house;
        if (marsHouse === venusHouseObj.house) {
            score += 1;
        }
    }

    // Jupiter aspecting 7th (+1)
    const jupiterHouse = chartData.houses.find(h => h.planets.some(p => p.name === "Jupiter"))?.house;
    if (jupiterHouse && [7, 11, 1, 3].includes(jupiterHouse)) {
        score += 1;
    }

    return {
        score: Math.min(10, Math.round(score * 2) / 2),
        reasoning: "Love score based on 7th house, Venus dignity, and relationship indicators.",
        keyFindings: []
    };
}

// =============================================================================
// 🌀 Manifestation Scoring
// =============================================================================

// OPTIMIZATION: Inject verified YogaResult to avoid re-calculation
export function evaluateManifestation(chartData: ChartData, yogaResult: YogaEvaluationResult): ManifestationEvaluationResult {
    let score = 2; // Base

    // 11th house planets (+1 each)
    const eleventhHouse = chartData.houses.find(h => h.house === 11);
    if (eleventhHouse) {
        score += eleventhHouse.planets.length;
    }

    // Lord of 11th strong (+2)
    const eleventhSign = eleventhHouse?.sign || "Aries";
    const eleventhLord = getPlanetForSign(eleventhSign);
    const eleventhLordHouse = chartData.houses.find(h =>
        h.planets.some(p => p.name === eleventhLord)
    );
    if (eleventhLordHouse) {
        const sign = eleventhLordHouse.sign;
        const planet = eleventhLord;
        // Check if planet is exalted/own in that sign
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
            score += 2;
        }
    }

    // 3rd house malefics (+1.5)
    const thirdHouse = chartData.houses.find(h => h.house === 3);
    if (thirdHouse) {
        const malefics = ["Mars", "Saturn", "Sun", "Rahu"];
        const maleficCount = thirdHouse.planets
            .filter(p => malefics.includes(p.name))
            .length;
        score += maleficCount * 1.5;
    }

    // Lord of 3rd strong (+1)
    const thirdSign = thirdHouse?.sign || "Aries";
    const thirdLord = getPlanetForSign(thirdSign);
    const thirdLordHouse = chartData.houses.find(h =>
        h.planets.some(p => p.name === thirdLord)
    );
    if (thirdLordHouse) {
        const sign = thirdLordHouse.sign;
        const planet = thirdLord;
        const exaltedOwn = {
            "Sun": ["Leo", "Aries"],
            "Moon": ["Cancer", "Taurus"],
            "Mars": ["Aries", "Scorpio", "Capricorn"],
            "Mercury": ["Gemini", "Virgo"],
            "Jupiter": ["Sagittarius", "Pisces", "Cancer"],
            "Venus": ["Taurus", "Libra", "Pisces"],
            "Saturn": ["Capricorn", "Aquarius", "Libra"]
        };
        if (exaltedOwn[planet as keyof typeof exaltedOwn]?.includes(sign)) {
            score += 1;
        }
    }

    // Mars strength (+2)
    const marsHouseObj = chartData.houses.find(h => h.planets.some(p => p.name === "Mars"));
    if (marsHouseObj) {
        if (["Aries", "Scorpio", "Capricorn"].includes(marsHouseObj.sign)) {
            score += 2;
        }
    }

    // Chart Power Bonus: +1 if any Tier 1/2 yoga
    // OPTIMIZATION: Used injected yogaResult
    if (yogaResult.yogaCount > 0) {
        score += 1;
    }

    return {
        score: Math.min(10, Math.round(score * 2) / 2),
        reasoning: "Manifestation score based on 11th/3rd houses, Mars strength, and chart power.",
        keyFindings: []
    };
}

// =============================================================================
// 🌌 Spiritual Scoring (Simplified Example)
// =============================================================================

export function evaluateSpiritual(chartData: ChartData): SpiritualEvaluationResult {
    let score = 5; // Base

    // Ketu in 4th, 8th, or 12th (Moksha Houses) (+2)
    const ketuHouse = chartData.houses.find(h => h.planets.some(p => p.name === "Ketu"))?.house;
    if (ketuHouse && [4, 8, 12].includes(ketuHouse)) {
        score += 2;
    }

    // Jupiter + Ketu conjunction (+1.5)
    if (ketuHouse !== undefined) {
        const jupiterHouse = chartData.houses.find(h => h.planets.some(p => p.name === "Jupiter"))?.house;
        if (jupiterHouse === ketuHouse) {
            score += 1.5;
        }
    }

    // Moon + Mercury in 12th (+1)
    const moonHouse = chartData.houses.find(h => h.planets.some(p => p.name === "Moon"))?.house;
    const mercuryHouse = chartData.houses.find(h => h.planets.some(p => p.name === "Mercury"))?.house;
    if (moonHouse === 12 && mercuryHouse === 12) {
        score += 1;
    }

    return {
        score: Math.min(10, Math.round(score * 2) / 2),
        reasoning: "Spiritual score based on Ketu, Jupiter, and 12th house placements.",
        keyFindings: []
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
    spiritual: SpiritualEvaluationResult;
}

export function calculateAllScores(chartData: ChartData): CouncilFindings {
    const findings = evaluateYogas(chartData);

    return {
        auspiciousness: findings,
        career: evaluateCareer(chartData),
        manifestation: evaluateManifestation(chartData, findings), // Injected dependency
        love: evaluateLove(chartData),
        spiritual: evaluateSpiritual(chartData)
    };
}
