
import { ChartData, YogaEvaluationResult } from "../types";

const YOGA_MODEL = "openai/gpt-4o"; // The Lawyer (Gold Standard)

export async function checkYogas(chartData: ChartData): Promise<YogaEvaluationResult> {
    console.log("⚡️ [ROUTING CONFIRMED] Executing Yoga Evaluator with model:", YOGA_MODEL);
    const apiKey = process.env.OPENROUTER_API_KEY;

    // Helper to format data into a FLAT LIST for LLM accuracy
    let formattedData = `ASCENDANT: ${chartData.ascendantSign}\nPlanetary Positions:\n`;

    chartData.houses.forEach(h => {
        h.planets.forEach(p => {
            formattedData += `- ${p.name.toUpperCase()} in ${h.sign} (House ${h.house})\n`;
        });
    });

    console.log("Formatted Data for Yoga Evaluator:\n", formattedData);

    const systemPrompt = `You are the YOGA LAWYER of the Astrology Council.
    Your ONLY job is to verify the TECHNICAL EXISTENCE of Mahapurusha Yogas.

    ** ABSOLUTE RULES **
    1. ONLY use the planetary data provided. Do NOT assume missing info.
    2. A yoga EXISTS if and only if ALL conditions in its definition are met.
    3. DEBILITATED planets (e.g., Mars in Cancer) CANNOT form yogas.

    ** YOGA DEFINITIONS (STRICT CHECKLIST) **
    For each yoga below, output: "✅ [Yoga Name]" if ALL conditions met, else "❌ [Yoga Name]".

    1. RUCHAKA: Mars in House 1/4/7/10 AND Sign = Aries/Scorpio/Capricorn.
    2. BHADRA: Mercury in House 1/4/7/10 AND Sign = Gemini/Virgo.
    3. HAMSA: Jupiter in House 1/4/7/10 AND Sign = Sagittarius/Pisces/Cancer.
    4. MALAVYA: Venus in House 1/4/7/10 AND Sign = Taurus/Libra/Pisces.
    5. SASA: Saturn in House 1/4/7/10 AND Sign = Capricorn/Aquarius/Libra.

    6. GAJAKESARI: Jupiter in Kendra (1/4/7/10) FROM Moon's house.
    7. BUDHADITYA: Sun AND Mercury in EXACT SAME House Number.
    8. CHANDRA MANGALA: Moon AND Mars in Same OR Opposite (±7) House.

    ** OUTPUT INSTRUCTIONS **
    - FIRST, list each yoga with ✅/❌ as shown above.
    - THEN, create the JSON with ONLY ✅ yogas in "yogasIdentified".
    - For Mahapurusha (1-5), add " (Mahapurusha)" suffix.
    - For others (6-8), add " (Auspicious)" suffix.

    ** EXAMPLE OUTPUT **
    ✅ SASA
    ❌ RUCHAKA
    ✅ BUDHADITYA
    {
        "yogasIdentified": ["Sasa (Mahapurusha)", "Budhaditya (Auspicious)"],
        "reasoning": "Saturn exalted in Libra (House 1) -> Sasa. Sun/Mercury both in House 5 -> Budhaditya."
    }
    `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://astrologycouncil.app",
                "X-Title": "Astrology Council Yoga Evaluator",
            },
            body: JSON.stringify({
                model: YOGA_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Analyze this chart data: ${formattedData}` }
                ],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        if (!data.choices) {
            console.error("GPT-4o API Error:", data);
            throw new Error("API Response missing choices");
        }
        const result = JSON.parse(data.choices[0].message.content);

        // --- SAFETY NET: Explicit Code Check for Sasa Yoga ---
        // Sometimes LLMs miss the obvious. We double check the specific condition for Sasa.
        // Rule: Saturn in House 1, 4, 7, 10 AND Sign is Capricorn (10), Aquarius (11), or Libra (7).
        const hasSasa = chartData.houses.some(h =>
            (h.house === 1 || h.house === 4 || h.house === 7 || h.house === 10) &&
            ["Capricorn", "Aquarius", "Libra"].includes(h.sign) &&
            h.planets.some(p => p.name === "Saturn")
        );

        if (hasSasa) {
            const sasaName = "Sasa (Mahapurusha)";
            if (!result.yogasIdentified.includes(sasaName)) {
                console.log("⚠️ Yoga Evaluator - Safety Net Triggered: Auto-adding Sasa Yoga.");
                result.yogasIdentified.push(sasaName);
                result.reasoning += " [System Note: Sasa Yoga verified by deterministic rule check.]";
            }
        }

        // Calculate Score in Code (Deterministic)
        const yogaCount = result.yogasIdentified.length;
        let score = 5; // Base
        if (yogaCount >= 1) score = 8;
        if (yogaCount >= 2) score = 10;

        // Mahapurusha Bonus (Verify it's a Big 5 for max score) vs General
        // We now check for the string "(Mahapurusha)"
        const hasMahapurusha = result.yogasIdentified.some((y: string) => y.includes("(Mahapurusha)"));
        if (hasMahapurusha && score < 9) score = 9;

        return {
            score: score,
            yogaCount: yogaCount,
            yogasIdentified: result.yogasIdentified,
            reasoning: result.reasoning,
            keyFindings: result.yogasIdentified
        };

    } catch (e) {
        console.error("Yoga Evaluator Failed", e);
        return {
            score: 5,
            yogaCount: 0,
            yogasIdentified: [],
            reasoning: "Evaluator failed. Defaulting to neutral score.",
            keyFindings: []
        };
    }
}
