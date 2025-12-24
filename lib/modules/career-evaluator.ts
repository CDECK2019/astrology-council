
import { ChartData, EvaluationResult } from "../types";

const CAREER_MODEL = "x-ai/grok-beta"; // The Executive (Real World Edge)
const MANIFESTATION_MODEL = "openai/gpt-4o-mini"; // The Architect (Builder)

export async function evaluateCareer(chartData: ChartData): Promise<EvaluationResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const formattedData = JSON.stringify(chartData, null, 2);

    const systemPrompt = `You are the CAREER EXECUTIVE of the Astrology Council.
    Your focus is strictly PROFESSIONAL SUCCESS, STATUS,AUTHORITY, and CAREER PATH.
    
    ** ANALYSIS SCOPE (10th House Focus) **
    1. 10th House Planets (Strength, Nature).
    2. 10th Lord placement (Kendra/Trikona is strong).
    3. Amala Yoga (Benefic in 10th from Asc/Moon).
    4. Sun/Saturn strength (Karaka for career/authority).
    
    ** SCORING CRITERIA (1-10) **
    - 9-10: Exalted 10th Lord, Major Rajayogas in 10th.
    - 7-8: Strong 10th House, Benefics present.
    - 4-6: Average placement, mixed influences.
    - 1-3: Weak/Afflicted 10th House.

    ** OUTPUT FORMAT **:
    Return a JSON object with this EXACT structure:
    {
        "score": 0, // Integer 1-10
        "reasoning": "Brief professional assessment.",
        "keyFindings": ["List", "of", "Key", "Career", "Factors"]
    }`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://astrologycouncil.app",
                "X-Title": "Astrology Council Career Evaluator",
            },
            body: JSON.stringify({
                model: CAREER_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Analyze this chart for CAREER: ${formattedData}` }
                ],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        return result;

    } catch (e) {
        return { score: 5, reasoning: "Evaluation failed.", keyFindings: [] };
    }
}


