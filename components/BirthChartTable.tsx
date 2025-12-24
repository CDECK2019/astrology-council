
"use client";

import { motion } from "framer-motion";
import { normalizeChartData } from "@/lib/chart-normalizer";

// Zodiac sign symbols
const SIGN_SYMBOLS: Record<string, string> = {
    Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
    Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
    Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
};

// Planet symbols
const PLANET_SYMBOLS: Record<string, string> = {
    Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
    Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
    Rahu: "☊", Ketu: "☋", Ascendant: "AC"
};

interface Planet {
    name: string;
    isRetro: boolean;
}

interface BirthChartTableProps {
    chartData: any; // Accepting raw API response
}

export const BirthChartTable = ({ chartData }: BirthChartTableProps) => {
    // Utilize the shared normalizer to ensure frontend matches backend logic perfectly
    const normalizedData = normalizeChartData(chartData);
    const houses = normalizedData.houses || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-2xl mx-auto mt-8"
        >
            <h3 className="text-center text-sm uppercase tracking-[0.2em] text-gray-400 mb-4 font-medium">
                Your Vedic Birth Chart
            </h3>

            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-cosmic-dark/60 backdrop-blur-md">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent-indigo/5 via-transparent to-accent-violet/5 pointer-events-none" />

                <table className="w-full relative z-10">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-accent-indigo font-medium">
                                House
                            </th>
                            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-accent-indigo font-medium">
                                Sign
                            </th>
                            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-accent-indigo font-medium">
                                Planets
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {houses.map((house, index) => (
                            <motion.tr
                                key={house.house}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                                <td className="px-4 py-2.5 text-gray-300 font-medium">
                                    {house.house}
                                </td>
                                <td className="px-4 py-2.5 text-gray-200">
                                    <span className="text-accent-gold mr-2">
                                        {SIGN_SYMBOLS[house.sign] || ""}
                                    </span>
                                    {house.sign}
                                </td>
                                <td className="px-4 py-2.5">
                                    {house.planets.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {house.planets.map((planet: any, idx: number) => (
                                                <span
                                                    key={idx}
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${planet.isRetro
                                                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                                        : "bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30"
                                                        }`}
                                                >
                                                    <span className="text-sm">
                                                        {PLANET_SYMBOLS[planet.name] || ""}
                                                    </span>
                                                    {planet.name}
                                                    {planet.isRetro && <span className="text-[10px]">℞</span>}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-600 text-sm">—</span>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};
