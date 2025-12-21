"use client";

import { motion } from "framer-motion";

// Zodiac signs in order (for house assignment)
const ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

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
    full_degree: number;
    norm_degree: number;
    speed: number;
    is_retro: boolean;
    sign: string;
    house: number;
}

interface BirthChartTableProps {
    chartData: {
        output?: Planet[];
        [key: string]: any;
    };
}

interface HouseData {
    house: number;
    sign: string;
    planets: { name: string; isRetro: boolean }[];
}

function processChartData(chartData: { output?: any[] }): HouseData[] {
    const houses: HouseData[] = [];

    // Initialize 12 houses
    for (let i = 1; i <= 12; i++) {
        houses.push({
            house: i,
            sign: "",
            planets: []
        });
    }

    // The API returns data in output[0] as an object with numeric keys
    // or output[1] as an object with planet names as keys
    if (!chartData.output) {
        return houses;
    }

    // Try to get planet data from output[1] (named keys) or output[0] (numeric keys)
    const planetData = chartData.output[1] || chartData.output[0];

    if (!planetData || typeof planetData !== 'object') {
        return houses;
    }

    // Find the Ascendant to determine house signs
    let ascendantSign = 1; // Default to Aries (sign 1)

    if (planetData.Ascendant) {
        ascendantSign = planetData.Ascendant.current_sign || 1;
    } else if (planetData["0"]?.name === "Ascendant") {
        ascendantSign = planetData["0"].current_sign || 1;
    }

    // Assign signs to houses (starting from ascendant sign)
    const ascendantIndex = ascendantSign - 1; // Convert 1-indexed to 0-indexed
    for (let i = 0; i < 12; i++) {
        const signIndex = (ascendantIndex + i) % 12;
        houses[i].sign = ZODIAC_SIGNS[signIndex];
    }

    // Process planets - handle both formats
    const entries = Object.entries(planetData);

    entries.forEach(([key, details]: [string, any]) => {
        // Skip non-planet entries
        if (!details || typeof details !== 'object') return;
        if (key === 'debug' || details.name === 'ayanamsa') return;

        const planetName = details.name || key;
        const houseNumber = details.house_number;
        const isRetro = details.isRetro === "true" || details.isRetro === true;

        // Only add if this is a planet with a valid house number
        if (planetName && planetName !== "Ascendant" && houseNumber >= 1 && houseNumber <= 12) {
            houses[houseNumber - 1].planets.push({
                name: planetName,
                isRetro: isRetro
            });
        }
    });

    return houses;
}

export const BirthChartTable = ({ chartData }: BirthChartTableProps) => {
    const houses = processChartData(chartData);

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
                                            {house.planets.map((planet, idx) => (
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
