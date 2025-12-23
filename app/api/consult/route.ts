import { NextResponse } from "next/server";
import { getCouncilReviews, getMasterSynthesis, getPeerRankings } from "@/lib/llm";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("[API] /api/consult received body:", JSON.stringify(body, null, 2));
        const { name, chartData } = body;

        if (!chartData || !chartData.houses) {
            console.error("[API] ❌ Invalid chartData received:", chartData);
            return NextResponse.json({ error: "Invalid chart data" }, { status: 400 });
        }

        // Note: We use the chartData directly as it's passed to getCouncilReviews which handles formatting
        // No local formatChartForLLM needed here as logic is moved to lib/llm.ts

        // Stage 1: Council Reviews
        console.log("Fetching council reviews...");
        const reviews = await getCouncilReviews(chartData);
        console.log("Council reviews received.");

        // Stage 2: Peer Review
        console.log("Fetching peer reviews...");
        const peerReviews = await getPeerRankings(reviews);
        console.log("Peer reviews received.");

        // Stage 3: Master Synthesis
        console.log("Fetching master synthesis...");
        const synthesis = await getMasterSynthesis(reviews, peerReviews);
        console.log("Master synthesis received.");

        return NextResponse.json({
            chartData,
            reviews,
            peerReviews,
            synthesis,
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

// Format manual chart data into a clear text format for LLM consumption
function formatChartForLLM(chartData: any): string {
    const { ascendantSign, houses } = chartData;

    let chartText = `VEDIC BIRTH CHART ANALYSIS\n`;
    chartText += `========================\n\n`;
    chartText += `Ascendant(Lagna): ${ascendantSign} \n\n`;
    chartText += `HOUSE PLACEMENTS: \n`;
    chartText += `-----------------\n`;

    houses.forEach((house: any) => {
        const planetsStr = house.planets.length > 0
            ? house.planets.map((p: any) => `${p.name}${p.isRetro ? ' (R)' : ''} `).join(', ')
            : 'Empty';

        chartText += `House ${house.house} (${house.sign}): ${planetsStr} \n`;
    });

    // Add summary of planet positions
    chartText += `\nPLANET SUMMARY: \n`;
    chartText += `---------------\n`;

    const allPlanets: { name: string; house: number; sign: string; isRetro: boolean }[] = [];
    houses.forEach((house: any) => {
        house.planets.forEach((planet: any) => {
            allPlanets.push({
                name: planet.name,
                house: house.house,
                sign: house.sign,
                isRetro: planet.isRetro
            });
        });
    });

    allPlanets.forEach(p => {
        chartText += `${p.name}: House ${p.house} in ${p.sign}${p.isRetro ? ' (Retrograde)' : ''} \n`;
    });

    return chartText;
}
