
import { ChartData, CouncilReport } from "./types";
import { checkYogas } from "./modules/yoga-evaluator";
import { evaluateCareer } from "./modules/career-evaluator";
import { evaluateManifestation } from "./modules/manifestation-evaluator";
import { evaluateLove } from "./modules/love-evaluator";
import { evaluateSpiritual } from "./modules/spiritual-evaluator";

const MASTER_MODEL = "nvidia/llama-3.1-nemotron-70b-instruct";

export async function orchestrateCouncil(chartData: ChartData): Promise<CouncilReport> {

    // 1. Parallel Evaluation
    console.log("[Orchestrator] Starting Council Deliberation (Parallel Evaluators)...");

    const [
        auspiciousness,
        career,
        manifestation,
        love,
        spiritual
    ] = await Promise.all([
        checkYogas(chartData),
        evaluateCareer(chartData),
        evaluateManifestation(chartData),
        evaluateLove(chartData),
        evaluateSpiritual(chartData)
    ]);

    console.log("[Orchestrator] Evaluators Complete.");
    console.log("Yoga Score:", auspiciousness.score);
    console.log("Career Score:", career.score);

    // 2. Synthesize Master Decree
    const synthesis = await synthesizeDecree({
        auspiciousness,
        career,
        manifestation,
        love,
        spiritual
    });

    return {
        auspiciousness,
        career,
        manifestation,
        love,
        spiritual,
        synthesis
    };
}

async function synthesizeDecree(report: Omit<CouncilReport, "synthesis">): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const reportJson = JSON.stringify(report, null, 2);

    const systemPrompt = `You are the COUNCIL PRESIDENT (Master Vedic Astrologer).
    
    ** INPUT DATA **:
    You are receiving verified reports from 5 specialist AI agents:
    1. Yoga Evaluator (Auspiciousness & Mahapurusha Yogas) - **STRICTLY FOLLOW THIS COUNT**.
    2. Career Executive.
    3. Manifestation Architect.
    4. Love Matchmaker.
    5. Spiritual Mystic.

    ** YOUR TASK **:
    Synthesize these findings into a "Master Decree" spoken directly to the native.
    
    ** DRAFTING RULES **:
    1. **Trust the Scores**: Do NOT re-evaluate the chart. Use the scores provided by the specialists.
    2. **Mahapurusha Check**: If Yoga Evaluator confirms a Mahapurusha Yoga, celebrate it! If it says "0", do NOT hallucinate one.
    3. **Tone**: Profound, Wise, Encouraging but Truthful.
    4. **Output Format**:
       - "Synthesized Findings" (Bullet points of key strengths/weaknesses from the reports).
       - "Unified Scores" (List the exact scores provided in the input - do not change them).
       - "Spiritual Insight" (A beautiful closing paragraph).

    ** CRITICAL **:
    - If Yoga Count >= 1, ensure the narrative reflects this high status.
    - If Yoga Count = 0, focus on other strengths (Career, Spirit, etc.).
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
                    { role: "user", content: `Here are the Council Reports. Write the Decree:\n\n${reportJson}` }
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
