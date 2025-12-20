import { NextResponse } from "next/server";
import { getBirthChart } from "@/lib/astrology";
import { getCouncilReviews, getMasterSynthesis } from "@/lib/llm";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log("Consultation requested for:", data.name);

        // 1. Get Birth Chart from Astrology API
        console.log("Fetching birth chart...");
        const birthChart = await getBirthChart({
            year: data.year,
            month: data.month,
            date: data.date,
            hours: data.hours,
            minutes: data.minutes,
            seconds: 0,
            latitude: data.latitude || 40.096,
            longitude: data.longitude || -74.222,
            timezone: data.timezone || -5.0,
            name: data.name
        });
        console.log("Birth chart received.");

        // 2. Get Council Reviews from OpenRouter
        console.log("Fetching council reviews...");
        const reviews = await getCouncilReviews(birthChart);
        console.log("Council reviews received.");

        // 3. Get Master Synthesis from OpenRouter
        console.log("Fetching master synthesis...");
        const synthesis = await getMasterSynthesis(reviews);
        console.log("Master synthesis received.");

        return NextResponse.json({
            chartData: birthChart,
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
