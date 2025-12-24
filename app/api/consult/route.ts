
import { NextResponse } from "next/server";
import { orchestrateCouncil } from "@/lib/orchestrator";

export const maxDuration = 300; // 5 minutes timeout

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("[API] /api/consult received body:", JSON.stringify(body, null, 2));

        // Note: The frontend sends { name: "...", chartData: { ... } }
        // BUT the old code destructured `const { name, chartData } = body`.
        // However, if the user sends `birthChartData` (as per my previous attempt's assumption), we should check.
        // Looking at the view_file output, the old code used: `const { name, chartData } = body;`
        // So we will stick to that.

        const { name, chartData, birthChartData } = body;
        const dataToProcess = chartData || birthChartData;

        if (!dataToProcess || !dataToProcess.houses) {
            console.error("[API] ❌ Invalid chartData received:", dataToProcess);
            return NextResponse.json({ error: "Invalid chart data" }, { status: 400 });
        }

        // Run the new Orchestrator Pipeline
        console.log("[API] calling orchestrateCouncil...");
        const councilReport = await orchestrateCouncil(dataToProcess);
        console.log("[API] orchestrateCouncil complete.");

        // ADAPTER LAYER:
        // The frontend expects: { reviews: Array, peerReviews: Array, synthesis: String }
        // We must map our new `councilReport` structure to this to keep the UI working without a frontend refactor.

        const adaptedReviews = [
            {
                modelId: "yoga-evaluator",
                role: "Auspiciousness & Yogas",
                content: `**Score: ${councilReport.auspiciousness.score}/10**\n\n**Yogas Found:**\n${councilReport.auspiciousness.yogasIdentified.join(', ') || "None"}\n\n**Analysis:**\n${councilReport.auspiciousness.reasoning}`
            },
            {
                modelId: "career-evaluator",
                role: "Career & Status",
                content: `**Score: ${councilReport.career.score}/10**\n\n**Analysis:**\n${councilReport.career.reasoning}`
            },
            {
                modelId: "manifestation-evaluator",
                role: "Manifestation & Gains",
                content: `**Score: ${councilReport.manifestation.score}/10**\n\n**Analysis:**\n${councilReport.manifestation.reasoning}`
            },
            {
                modelId: "love-evaluator",
                role: "Love & Relationships",
                content: `**Score: ${councilReport.love.score}/10**\n\n**Analysis:**\n${councilReport.love.reasoning}`
            },
            {
                modelId: "spiritual-evaluator", // Keeping ID stable for FE compatibility
                role: "Supernatural Abilities",
                content: `**Score: ${councilReport.supernatural.score}/10**\n\n**Yogas:**\n${councilReport.supernatural.keyFindings.join(', ') || "None"}\n\n**Analysis:**\n${councilReport.supernatural.reasoning}`
            },
        ];

        return NextResponse.json({
            chartData: dataToProcess,
            reviews: adaptedReviews,
            peerReviews: [], // No longer needed
            synthesis: councilReport.synthesis,
            userName: name
        });

    } catch (error: any) {
        console.error("Consultation API error detail:", error);
        return NextResponse.json(
            { error: error.message || "Failed to consult the spheres" },
            { status: 500 }
        );
    }
}
