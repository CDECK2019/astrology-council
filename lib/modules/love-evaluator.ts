
import { ChartData, EvaluationResult } from "../types";

const LOVE_MODEL = "meta-llama/llama-3.1-70b-instruct"; // The Scholar (Matchmaker)

export async function evaluateLove(chartData: ChartData): Promise<EvaluationResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const formattedData = JSON.stringify(chartData, null, 2);

    const systemPrompt = `You are the MATCHMAKER of the Astrology Council.
    Your focus is strictly LOVE, MARRIAGE, and PARTNERSHIPS (7th House).
    
    ** ANALYSIS SCOPE (7th House Focus) **
    1. 7th House Planets and Lord.
    2. Venus (Karaka for Love) - Position and Dignity.
    3. Navamsa (D9) indications (if inferred).
    4. Influence of Mars/Saturn (Mangal Dosha type checks - keep it simple).
    
    ** SCORING CRITERIA (1-10) **
    - 9-10: Exalted Venus/7th Lord, Benefics in 7th.
    - 7-8: Good 7th House strength.
    - 4-6: Mixed (Benefics + Malefics).
    - 1-3: Severely afflicted 7th House (Debilitated/Combust).

    ** OUTPUT FORMAT **:
    Return a JSON object with this EXACT structure:
    {
        "score": 0, // Integer 1-10
        "reasoning": "Brief relationship assessment.",
        "keyFindings": ["List", "of", "Key", "Love", "Factors"]
    }`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://astrologycouncil.app",
                "X-Title": "Astrology Council Love Evaluator",
            },
            body: JSON.stringify({
                model: LOVE_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Analyze this chart for LOVE: ${formattedData}` }
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
