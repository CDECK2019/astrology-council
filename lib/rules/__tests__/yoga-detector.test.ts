import { ChartData } from "../../types";
import { evaluateYogas } from "../index";

// Helper to build minimal chart data
function buildChart(houses: Array<{ house: number; sign: string; planets: string[] }>): ChartData {
    const fullHouses = Array(12).fill(null).map((_, i) => {
        const houseNum = i + 1;
        const entry = houses.find(h => h.house === houseNum);
        return {
            house: houseNum,
            sign: entry?.sign || "Aries", // fallback sign
            planets: (entry?.planets || []).map(name => ({ name, isRetro: false }))
        };
    });

    // Ascendant = sign of House 1
    const ascendantSign = fullHouses[0].sign;

    return {
        ascendantSign,
        houses: fullHouses
    };
}

describe("Yoga Detection", () => {

    // ============================================================================
    // ✅ Mahapurusha Yogas
    // ============================================================================

    test("Sasa Yoga: Saturn exalted in Libra in House 1", () => {
        const chart = buildChart([
            { house: 1, sign: "Libra", planets: ["Saturn"] }
        ]);
        const result = evaluateYogas(chart);
        expect(result.yogasIdentified).toContain("Sasa (Mahapurusha)");
        expect(result.score).toBeGreaterThanOrEqual(8);
    });

    test("Ruchaka Yoga: Mars in Capricorn (exalted) in House 10", () => {
        const chart = buildChart([
            { house: 10, sign: "Capricorn", planets: ["Mars"] }
        ]);
        const result = evaluateYogas(chart);
        expect(result.yogasIdentified).toContain("Ruchaka (Mahapurusha)");
    });

    test("Bhadra Yoga: Mercury in Virgo (exalted) in House 4", () => {
        const chart = buildChart([
            { house: 4, sign: "Virgo", planets: ["Mercury"] }
        ]);
        const result = evaluateYogas(chart);
        expect(result.yogasIdentified).toContain("Bhadra (Mahapurusha)");
    });

    test("Hamsa Yoga: Jupiter in Cancer (exalted) in House 7", () => {
        const chart = buildChart([
            { house: 7, sign: "Cancer", planets: ["Jupiter"] }
        ]);
        const result = evaluateYogas(chart);
        expect(result.yogasIdentified).toContain("Hamsa (Mahapurusha)");
    });

    test("Malavya Yoga: Venus in Pisces (exalted) in House 10", () => {
        const chart = buildChart([
            { house: 10, sign: "Pisces", planets: ["Venus"] }
        ]);
        const result = evaluateYogas(chart);
        expect(result.yogasIdentified).toContain("Malavya (Mahapurusha)");
    });

    // ============================================================================
    // ❌ Mahapurusha Yoga Rejections (Debilitation / Non-Kendra / Affliction)
    // ============================================================================

    test("NO Ruchaka: Mars debilitated in Cancer (House 10)", () => {
        const chart = buildChart([
            { house: 10, sign: "Cancer", planets: ["Mars"] }
        ]);
        const result = evaluateYogas(chart);
        expect(result.yogasIdentified).not.toContain("Ruchaka (Mahapurusha)");
    });

    test("NO Sasa: Saturn in Aries (debilitated) in House 1", () => {
        const chart = buildChart([
            { house: 1, sign: "Aries", planets: ["Saturn"] }
        ]);
        const result = evaluateYogas(chart);
        expect(result.yogasIdentified).not.toContain("Sasa (Mahapurusha)");
    });

    test("NO Bhadra: Mercury in Pisces (debilitated) in House 1", () => {
        const chart = buildChart([
            { house: 1, sign: "Pisces", planets: ["Mercury"] }
        ]);
        const result = evaluateYogas(chart);
        expect(result.yogasIdentified).not.toContain("Bhadra (Mahapurusha)");
    });

    test("NO Mahapurusha: Planet in non-Kendra house", () => {
        const chart = buildChart([
            { house: 2, sign: "Capricorn", planets: ["Mars"] } // House 2 ≠ Kendra
        ]);
        const result = evaluateYogas(chart);
        expect(result.yogasIdentified).toEqual([]);
    });

    // 🔥 NEW: Affliction Check (Combustion)
    test("NO Bhadra: Mercury combust with Sun in House 10 (Sherri's Case)", () => {
        const chart = buildChart([
            { house: 10, sign: "Gemini", planets: ["Sun", "Mercury"] }
        ]);
        const result = evaluateYogas(chart);
        // Should NOT contain Bhadra because Mercury is combust
        expect(result.yogasIdentified).not.toContain("Bhadra (Mahapurusha)");
        // But SHOULD contain Budhaditya
        expect(result.yogasIdentified).toContain("Budhaditya (Auspicious)");
    });

    // ============================================================================
    // ✅ General Yogas
    // ============================================================================

    test("Budhaditya: Sun and Mercury in same house (House 5)", () => {
        const chart = buildChart([
            { house: 5, sign: "Leo", planets: ["Sun", "Mercury"] }
        ]);
        const result = evaluateYogas(chart);
        expect(result.yogasIdentified).toContain("Budhaditya (Auspicious)");
    });

    test("Chandra-Mangala: Moon and Mars in same house", () => {
        const chart = buildChart([
            { house: 3, sign: "Taurus", planets: ["Moon", "Mars"] }
        ]);
        const result = evaluateYogas(chart);
        expect(result.yogasIdentified).toContain("Chandra Mangala (Auspicious)");
    });

    test("Chandra-Mangala: Moon in House 1, Mars in House 7 (opposite)", () => {
        const chart = buildChart([
            { house: 1, sign: "Aries", planets: ["Moon"] },
            { house: 7, sign: "Libra", planets: ["Mars"] }
        ]);
        const result = evaluateYogas(chart);
        expect(result.yogasIdentified).toContain("Chandra Mangala (Auspicious)");
    });

    test("Gaja Kesari: Jupiter in House 4 (Kendra) from Moon in House 1", () => {
        const chart = buildChart([
            { house: 1, sign: "Cancer", planets: ["Moon"] },
            { house: 4, sign: "Libra", planets: ["Jupiter"] }
        ]);
        const result = evaluateYogas(chart);
        expect(result.yogasIdentified).toContain("Gaja Kesari (Auspicious)");
    });

    // ============================================================================
    // ❌ General Yoga Rejections
    // ============================================================================

    test("NO Budhaditya: Sun in House 11, Mercury in House 12", () => {
        const chart = buildChart([
            { house: 11, sign: "Leo", planets: ["Sun"] },
            { house: 12, sign: "Virgo", planets: ["Mercury"] }
        ]);
        const result = evaluateYogas(chart);
        expect(result.yogasIdentified).not.toContain("Budhaditya (Auspicious)");
    });

    test("NO Gaja Kesari: Jupiter not in Kendra from Moon", () => {
        const chart = buildChart([
            { house: 1, sign: "Aries", planets: ["Moon"] },
            { house: 2, sign: "Taurus", planets: ["Jupiter"] } // House 2 ≠ Kendra from Moon
        ]);
        const result = evaluateYogas(chart);
        expect(result.yogasIdentified).not.toContain("Gaja Kesari (Auspicious)");
    });

    // ============================================================================
    // 🧮 Scoring Logic
    // ============================================================================

    test("Score = 5 when no yogas", () => {
        const chart = buildChart([]); // empty chart
        const result = evaluateYogas(chart);
        expect(result.score).toBe(5);
        expect(result.yogaCount).toBe(0);
    });

    test("Score = 8 with 1 yoga (General)", () => {
        const chart = buildChart([
            { house: 5, sign: "Leo", planets: ["Sun", "Mercury"] }
        ]);
        const result = evaluateYogas(chart);
        expect(result.score).toBe(6); // Base 5 + 1 (Tier 3)
        expect(result.yogaCount).toBe(1);
    });

    test("Score = 9 with 1 Mahapurusha yoga", () => {
        const chart = buildChart([
            { house: 1, sign: "Libra", planets: ["Saturn"] }
        ]);
        const result = evaluateYogas(chart);
        expect(result.score).toBe(8); // Mahapurusha base (Tier 1)
        expect(result.yogaCount).toBe(1);
    });

    test("Score = 9 with Mahapurusha + General (Sasa + Budhaditya)", () => {
        const chart = buildChart([
            { house: 1, sign: "Libra", planets: ["Saturn"] },
            { house: 3, sign: "Gemini", planets: ["Sun", "Mercury"] }
        ]);
        const result = evaluateYogas(chart);
        expect(result.score).toBe(9); // Corrected: Mahapurusha + General = 9
        expect(result.yogaCount).toBe(2);
    });
    test("Score = 10 with Mahapurusha + Gaja Kesari (Tier 1 + Tier 2)", () => {
        const chart = buildChart([
            { house: 1, sign: "Aries", planets: ["Moon"] },
            { house: 4, sign: "Cancer", planets: ["Jupiter"] } // Jupiter exalted in 4th (Hamsa) + 4th from Moon 1 (Gaja Kesari)
        ]);
        const result = evaluateYogas(chart);
        expect(result.score).toBe(10);
        expect(result.yogaCount).toBeGreaterThanOrEqual(2);
    });

});
