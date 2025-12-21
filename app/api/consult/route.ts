import { NextResponse } from "next/server";
import { getCouncilReviews, getMasterSynthesis } from "@/lib/llm";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log("Consultation requested for:", data.name);

        // Use manual chart data directly (no external API call needed)
        const chartData = data.chartData;

        if (!chartData) {
            return NextResponse.json(
                { error: "Chart data is required" },
                { status: 400 }
            );
        }

        console.log("Chart data received:", JSON.stringify(chartData, null, 2));

        // Convert manual chart format to a format suitable for LLM analysis
        const chartForLLM = formatChartForLLM(chartData);

        // Get Council Reviews from OpenRouter
        console.log("Fetching council reviews...");
        const reviews = await getCouncilReviews(chartForLLM);
        console.log("Council reviews received.");

        // Get Master Synthesis from OpenRouter
        console.log("Fetching master synthesis...");
        const synthesis = await getMasterSynthesis(reviews);
        console.log("Master synthesis received.");

        return NextResponse.json({
            chartData,
            reviews,
            synthesis,
            userName: data.name
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
    chartText += `Ascendant (Lagna): ${ascendantSign}\n\n`;
    chartText += `HOUSE PLACEMENTS:\n`;
    chartText += `-----------------\n`;

    houses.forEach((house: any) => {
        const planetsStr = house.planets.length > 0
            ? house.planets.map((p: any) => `${p.name}${p.isRetro ? ' (R)' : ''}`).join(', ')
            : 'Empty';

        chartText += `House ${house.house} (${house.sign}): ${planetsStr}\n`;
    });

    // Add summary of planet positions
    chartText += `\nPLANET SUMMARY:\n`;
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
        chartText += `${p.name}: House ${p.house} in ${p.sign}${p.isRetro ? ' (Retrograde)' : ''}\n`;
    });

    return chartText;
}
