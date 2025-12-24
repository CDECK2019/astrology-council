
import { ChartData, CouncilReport } from "./types";
import { calculateAllScores } from "./rules";
import { normalizeChartData } from "./chart-normalizer";

const MASTER_MODEL = "nvidia/llama-3.1-nemotron-70b-instruct";

export async function orchestrateCouncil(rawChartData: any): Promise<CouncilReport> {

    // 0. Normalize Data (Crucial Step!)
    // The input might be raw API JSON. We convert it to strict specific ChartData.
    const chartData = normalizeChartData(rawChartData);

    // 1. Deterministic Rules Engine Evaluation
    console.log("[Orchestrator] Starting Council Deliberation (Rules Engine)...");

    const findings = calculateAllScores(chartData);

    console.log("[Orchestrator] Rules Engine Complete.");
    console.log("Yoga Score:", findings.auspiciousness.score);
    console.log("Career Score:", findings.career.score);

    // 2. Synthesize Master Decree
    const synthesis = await synthesizeDecree(findings);

    return {
        ...findings,
        synthesis
    };
}

async function synthesizeDecree(report: Omit<CouncilReport, "synthesis">): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const reportJson = JSON.stringify(report, null, 2);

    const systemPrompt = `You are the COUNCIL PRESIDENT (Master Vedic Astrologer).
    
    ** YOUR ROLE **:
    You are the "Narrator of Truth". You receive verified, deterministic calculations from the Astrology Engine.
    Your job is NOT to calculate anything. Your job is to WEAVE these facts into a profound, compassionate, and wise decree.

    ** INPUT DATA **:
    You are receiving a JSON object with SCORES and IDENTIFIED YOGAS.
    - These are FACTS. Do not dispute them.
    - If "Sasa Yoga" is in the list, IT IS THERE.
    - If "Score: 7", it is a 7.

    ** TASK **:
    Write a beautiful "Master Decree" spoken directly to the native.

    ** GUIDELINES **:
    1. **Trust the Engine**: The engine has verified planetary positions. You do not need to check houses or signs.
    2. **Highlight the Yogas**: If any Mahapurusha Yogas are found (like Ruchaka, Sasa, etc.), make them the centerpiece of your praise.
    3. **Tone**: Ancient wisdom meets modern clarity. Be encouraging but grounded.
    4. **Output Structure**:
       - **The Verdict**: A summary of their soul's power based on the scores.
       - **The Yogas**: Explain the specific Yogas found (if any) and what they grant the native.
       - **The Path**: Advice for Career, Love, and Spirit based on the strongest scores.
       - **The Blessing**: A final poetic closing.

    ** CRITICAL **:
    - Do not invent new yogas. Only narrate what is likely in the 'yogasIdentified' or 'keyFindings' fields.
    - If scores are low, focus on the potential for growth and the lessons of Saturn/Mars.
    `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://astrologycouncil.app",
                "X-Title": "Astrology Council Orchestrator",
            },
            body: JSON.stringify({
                model: MASTER_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Here are the Verified Findings. Speak the Decree:\n\n${reportJson}` }
                ]
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (e) {
        console.error("Master Synthesis Failed", e);
        return "The Council is in deep meditation. (Synthesis Failed)";
    }
}
