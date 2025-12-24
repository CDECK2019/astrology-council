
import { ChartData, EvaluationResult } from "../types";

const MANIFESTATION_MODEL = "openai/gpt-4o-mini"; // The Architect (Builder)

export async function evaluateManifestation(chartData: ChartData): Promise<EvaluationResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const formattedData = JSON.stringify(chartData, null, 2);

    const systemPrompt = `You are the MANIFESTATION ARCHITECT of the Astrology Council.
    Your focus is strictly WILLPOWER (3rd House) and GAINS/DESIRES (11th House).
    
    ** ANALYSIS SCOPE (3rd/11th Focus) **
    1. 11th House (Labha Bhava) - Fulfillment of desires.
    2. 3rd House (Sahaja Bhava) - Courage and self-effort.
    3. Evaluation of specific Yogas like Shakti Yoga or Vasumati Yoga.
    
    ** ASTROLOGICAL RULES - TERMINOLOGY **
    - **Benefics**: Venus, Jupiter, Mercury (unafflicted), Moon (bright).
    - **Malefics**: Sun, Mars, Saturn, Rahu, Ketu.
    - **CRITICAL**: Malefics (Sun/Mars/Saturn) in 3rd and 11th (Upachaya Houses) are **EXCELLENT** for gains and willpower.
      - *Correct Phrasing*: "The 11th house has the strong Sun, offering immense gains..."
      - *Incorrect Phrasing*: "The 11th house has the benefic Sun..." (SUN IS NOT A BENEFIC).
    
    ** SCORING CRITERIA (1-10) **
    - 9-10: Strong 11th House (Benefics OR Strong Malefics present), Exalted 3rd Lord.
    - 7-8: Good gains potential, decent willpower.
    - 4-6: Average.
    - 1-3: Weak 11th/3rd houses (Debilitated lords).

    ** OUTPUT FORMAT **:
    Return a JSON object with this EXACT structure:
    {
        "score": 0, // Integer 1-10
        "reasoning": "Brief manifestation assessment.",
        "keyFindings": ["List", "of", "Key", "Manifestation", "Factors"]
    }`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://astrologycouncil.app",
                "X-Title": "Astrology Council Manifestation Evaluator",
            },
            body: JSON.stringify({
                model: MANIFESTATION_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Analyze this chart for MANIFESTATION: ${formattedData}` }
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
