
import { ChartData, EvaluationResult } from "../types";

const SPIRITUAL_MODEL = "meta-llama/llama-3.1-405b-instruct"; // The Sage (Mystic)

export async function evaluateSpiritual(chartData: ChartData): Promise<EvaluationResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const formattedData = JSON.stringify(chartData, null, 2);

    const systemPrompt = `You are the MYSTIC SAGE of the Astrology Council.
    Your focus is strictly SPIRITUALITY, INTUITION, and SUPERNATURAL POTENTIAL.
    
    ** ANALYSIS SCOPE (Moksha Focus) **
    1. Moksha Houses: 4th, 8th, 12th.
    2. Ketu (The Moksha Karaka) - Position in 12th/8th is powerful.
    3. Water Signs (Cancer, Scorpio, Pisces) - Emotional depth.
    4. Yogas: Guru-Ketu, Kala Sarpa (Spiritual).
    
    ** SCORING CRITERIA (1-10) **
    - 9-10: Ketu in 12th/8th, Strong Moksha Houses, Guru-Ketu Yoga.
    - 7-8: Good intuition indicators.
    - 4-6: Average spiritual inclination.
    - 1-3: Highly materialistic chart (Strong Earth/Artha, weak Moksha).

    ** OUTPUT FORMAT **:
    Return a JSON object with this EXACT structure:
    {
        "score": 0, // Integer 1-10
        "reasoning": "Brief spiritual assessment.",
        "keyFindings": ["List", "of", "Key", "Spiritual", "Factors"]
    }`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://astrologycouncil.app",
                "X-Title": "Astrology Council Spiritual Evaluator",
            },
            body: JSON.stringify({
                model: SPIRITUAL_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Analyze this chart for SPIRITUALITY: ${formattedData}` }
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
