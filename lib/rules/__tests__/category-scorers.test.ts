import { ChartData } from "../../types";
import { evaluateCareer, evaluateLove, evaluateManifestation, evaluateYogas } from "../index";

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

    const ascendantSign = fullHouses[0].sign;
    return { ascendantSign, houses: fullHouses };
}

describe("Category Scorers (Base 5 Standardization)", () => {

    // ============================================================================
    // 💼 Career Scoring
    // ============================================================================
    test("Career: Base 5 (Average)", () => {
        const chart = buildChart([]);
        const result = evaluateCareer(chart);
        expect(result.score).toBe(5);
        expect(result.reasoning).toContain("Career path requires consistent effort");
    });

    test("Career: Penalty for Weak 10th Lord (House 6)", () => {
        // 10th House is Capricorn (ruled by Saturn). Saturn in House 6 (Virgo).
        const chart = buildChart([
            { house: 10, sign: "Capricorn", planets: [] },
            { house: 6, sign: "Virgo", planets: ["Saturn"] }
        ]);
        const result = evaluateCareer(chart);
        // Base 5 - 1.5 (Lord in 6) = 3.5
        expect(result.score).toBe(3.5);
        expect(result.reasoning).toContain("Lord of 10th House in challenging placement");
    });

    test("Career: Penalty for Afflicted Sun", () => {
        // Sun combust with Moon involved? Or simple check of 'isPlanetAfflicted' logic.
        // Assuming 'isPlanetAfflicted' checks combustion if with Sun? No, Sun itself is afflicted if...
        // Wait, how is Sun afflicted? Usually by Nodes or being Debilitated (Libra).
        const chart = buildChart([
            { house: 1, sign: "Libra", planets: ["Sun"] } // Sun Debilitated
        ]);
        const result = evaluateCareer(chart);
        // Base 5 - 1 (Afflicted Sun) = 4
        expect(result.score).toBe(4);
        expect(result.reasoning).toContain("Afflicted Sun indicates challenges");
    });

    test("Career: Bonus for Planet in 10th (+0.5)", () => {
        const chart = buildChart([
            { house: 10, sign: "Aries", planets: ["Mars"] }
        ]);
        const result = evaluateCareer(chart);
        // Base 5 + 0.5 (Planet) + 1.5 (Mars Own Sign in 10th? No, just strong planet check)
        // Check function: "Mars" is a strong planet -> +0.5.
        // Also is 10th Lord Strong?
        // 10th Sign Aries -> Lord Mars. Mars in 10 -> Kendra (10). -> +1.5.
        // Total = 5 + 0.5 + 1.5 = 7.
        expect(result.score).toBe(7);
    });

    // ============================================================================
    // ❤️ Love Scoring
    // ============================================================================
    test("Love: Base 5 (Average)", () => {
        const chart = buildChart([]);
        const result = evaluateLove(chart);
        expect(result.score).toBe(5);
    });

    test("Love: Penalty for Weak 7th Lord (House 8)", () => {
        // 7th House Libra (ruled by Venus). Venus in House 8.
        const chart = buildChart([
            { house: 7, sign: "Libra", planets: [] },
            { house: 8, sign: "Taurus", planets: ["Venus"] }
        ]);
        const result = evaluateLove(chart);
        // Base 5 - 1.5 (Lord in 8) = 3.5.
        // Also Venus in Taurus (Own Sign) -> But in 8th house. 
        // evaluating 'Venus Strength': Venus Own Sign -> +2?
        // Let's check logic:
        // Venus in 8th (Taurus) -> +2 for strength? 
        // 7th Lord Penalty (-1.5).
        // Total = 5 - 1.5 + 2 = 5.5.
        expect(result.score).toBe(5.5);
    });

    test("Love: Malefics in 7th (-1)", () => {
        const chart = buildChart([
            { house: 7, sign: "Aries", planets: ["Mars"] }
        ]);
        const result = evaluateLove(chart);
        // Base 5
        // Malefic Mars -> -1
        // 7th Lord (Mars) in 7th (Kendra) -> +1.0
        // Total = 5 - 1 + 1 = 5.
        expect(result.score).toBe(5);
    });

    // ============================================================================
    // 🌀 Manifestation Scoring
    // ============================================================================
    test("Manifestation: Base 5 (Average)", () => {
        const chart = buildChart([]);
        const yogaResult = evaluateYogas(chart);
        const result = evaluateManifestation(chart, yogaResult);
        expect(result.score).toBe(5);
    });

    test("Manifestation: Penalty for Weak 11th Lord (House 12)", () => {
        // 11th House Leo (Sun). Sun in 12 (Cancer).
        const chart = buildChart([
            { house: 11, sign: "Leo", planets: [] },
            { house: 12, sign: "Cancer", planets: ["Sun"] }
        ]);
        const yogaResult = evaluateYogas(chart);
        const result = evaluateManifestation(chart, yogaResult);
        // Base 5 - 1.5 (Lord in 12) = 3.5
        expect(result.score).toBe(3.5);
    });

    test("Manifestation: Penalty for Weak 3rd Lord (House 6)", () => {
        // 3rd House Aries (Mars). Mars in 6 (Virgo).
        // 11th House Taurus (Venus). Venus in 1 (Safe).
        const chart = buildChart([
            { house: 3, sign: "Aries", planets: [] },
            { house: 6, sign: "Virgo", planets: ["Mars"] },
            { house: 11, sign: "Taurus", planets: [] },
            { house: 1, sign: "Aries", planets: ["Venus"] }
        ]);
        const yogaResult = evaluateYogas(chart);
        const result = evaluateManifestation(chart, yogaResult);
        // Base 5
        // 11th Lore (Venus) in 1 -> +0 (Neutral/Good, no bonus logic triggered unless Exalted/Strong sign. Venus in Aries is neutral).
        // 3rd Lord (Mars) in 6 -> -1 Penalty.
        // Total = 4.
        expect(result.score).toBe(4);
    });
});
