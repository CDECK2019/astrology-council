import { NextResponse } from "next/server";
import { getBirthChart } from "@/lib/astrology";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log("Chart requested for birth data");

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

        return NextResponse.json(birthChart);
    } catch (error: any) {
        console.error("Chart API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch birth chart" },
            { status: 500 }
        );
    }
}
