
import { ChartData, YogaEvaluationResult } from "../types";

const YOGA_MODEL = "qwen/qwen-2.5-72b-instruct"; // The Scholar (Logic Expert)

export async function checkYogas(chartData: ChartData): Promise<YogaEvaluationResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    // Helper to format data for LLM
    const formattedData = JSON.stringify(chartData, null, 2);

    const systemPrompt = `You are the YOGA LAWYER of the Astrology Council.
    Your ONLY job is to verify the TECHNICAL EXISTENCE of Mahapurusha Yogas.
    You do NOT give general advice. You only check rules.

    ** REFERENCE TABLE: PLANETARY DIGNITIES **
    | Planet  | Own Sign(s)          | Exalted Sign    |
    |---------|----------------------|-----------------|
    | Mars    | Aries, Scorpio       | Capricorn       |
    | Mercury | Gemini, Virgo        | Virgo           |
    | Jupiter | Sagittarius, Pisces  | Cancer          |
    | Venus   | Taurus, Libra        | Pisces          |
    | Saturn  | Capricorn, Aquarius  | Libra           |

    ** RULEBOOK: MAHAPURUSHA YOGAS **
    A Yoga exists IF AND ONLY IF:
    1. The Planet is in a KENDRA House (1, 4, 7, 10).
    2. AND The Planet is in its OWN or EXALTED Sign.

    ** SPECIFIC YOGAS TO CHECK **:
    1. Ruchaka (Mars) - WARNING: SUN in Aries is NOT Ruchaka.
    2. Bhadra (Mercury)
    3. Hamsa (Jupiter) - WARNING: Sun in Leo is NOT Hamsa.
    4. Malavya (Venus) - WARNING: MOON in Taurus is NOT Malavya.
    5. Sasa (Saturn)

    ** OUTPUT FORMAT **:
    Return a JSON object with this EXACT structure:
    {
        "yogasIdentified": ["List", "of", "Verified", "Yogas"],
        "yogaCount": 0, // Integer
        "score": 0, // 0-10. Base 4. +4 per Mahapurusha Yoga. Max 10.
        "reasoning": "Brief explanation of verified/rejected yogas."
    }
    
    CRITICAL: If yogaCount >= 1, score MUST be >= 8.
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
                response_format: { type: "json_object" } // Force JSON
            })
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        // Safety fallback if LLM hallucinates score vs count
        if (result.yogaCount >= 1 && result.score < 8) {
            result.score = 8;
            result.reasoning += " [Score Adjusted to 8/10 due to Mandatory Yoga Floor Rule]";
        }

        return {
            score: result.score,
            yogaCount: result.yogaCount,
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
