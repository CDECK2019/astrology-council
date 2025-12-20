"use client";

import { motion } from "framer-motion";

const PLANET_SYMBOLS: Record<string, string> = {
    "Sun": "☉", "Moon": "☽", "Mars": "♂", "Mercury": "☿", "Jupiter": "♃",
    "Venus": "♀", "Saturn": "♄", "Rahu": "☊", "Ketu": "☋", "Ascendant": "Asc"
};

const PLANET_COLORS: Record<string, string> = {
    "Sun": "#d4af37",
    "Moon": "#e2e8f0",
    "Mars": "#ef4444",
    "Mercury": "#22c55e",
    "Jupiter": "#eab308",
    "Venus": "#f472b6",
    "Saturn": "#6366f1",
    "Rahu": "#8b5cf6",
    "Ketu": "#a78bfa",
    "Ascendant": "#22d3ee",
};

export const RasiChart = ({ data }: { data: any }) => {
    const gridLayout = [
        { houseNum: 12, label: "12" }, { houseNum: 1, label: "1" }, { houseNum: 2, label: "2" }, { houseNum: 3, label: "3" },
        { houseNum: 11, label: "11" }, { empty: true }, { empty: true }, { houseNum: 4, label: "4" },
        { houseNum: 10, label: "10" }, { empty: true }, { empty: true }, { houseNum: 5, label: "5" },
        { houseNum: 9, label: "9" }, { houseNum: 8, label: "8" }, { houseNum: 7, label: "7" }, { houseNum: 6, label: "6" },
    ];

    const planetsByHouse: Record<number, { name: string; symbol: string; color: string }[]> = {};

    if (data?.output?.[1]) {
        Object.entries(data.output[1]).forEach(([name, details]: [string, any]) => {
            const h = details.house_number || details.current_sign;
            if (h && PLANET_SYMBOLS[name]) {
                if (!planetsByHouse[h]) planetsByHouse[h] = [];
                planetsByHouse[h].push({
                    name,
                    symbol: PLANET_SYMBOLS[name],
                    color: PLANET_COLORS[name] || "#818cf8",
                });
            }
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-5 aspect-square w-full max-w-sm mx-auto relative overflow-hidden"
        >
            {/* Corner decorations */}
            <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-accent-indigo/30 rounded-tl-lg" />
            <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-accent-indigo/30 rounded-tr-lg" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-accent-indigo/30 rounded-bl-lg" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-accent-indigo/30 rounded-br-lg" />

            <div className="grid grid-cols-4 grid-rows-4 h-full border border-accent-indigo/20 rounded-lg overflow-hidden">
                {gridLayout.map((cell, i) => (
                    <div
                        key={i}
                        className={`border border-accent-indigo/10 p-1 flex flex-col items-center justify-start text-[10px] relative transition-all duration-300 hover:bg-white/[0.03] ${cell.empty ? "bg-transparent" : "bg-white/[0.02]"
                            }`}
                    >
                        {!cell.empty && (
                            <>
                                <span className="text-accent-indigo/40 absolute top-1 right-1.5 font-bold text-[9px]">
                                    {cell.label}
                                </span>
                                <div className="flex flex-wrap gap-1 justify-center items-center mt-4 px-0.5">
                                    {(planetsByHouse[cell.houseNum as number] || []).map((planet, pi) => (
                                        <motion.span
                                            key={pi}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: pi * 0.1 + i * 0.02, type: "spring" }}
                                            className="text-sm font-bold px-1 rounded"
                                            style={{
                                                color: planet.color,
                                                textShadow: `0 0 8px ${planet.color}50`,
                                            }}
                                            title={planet.name}
                                        >
                                            {planet.symbol}
                                        </motion.span>
                                    ))}
                                </div>
                            </>
                        )}
                        {cell.empty && i === 5 && (
                            <div className="absolute inset-0 col-span-2 row-span-2 flex items-center justify-center pointer-events-none">
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-3xl font-bold tracking-[0.3em] text-accent-indigo uppercase font-cinzel"
                                    style={{
                                        writingMode: "vertical-rl",
                                        textOrientation: "mixed",
                                    }}
                                >
                                    RASI
                                </motion.span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-4 text-center text-[9px] text-gray-500 uppercase tracking-[0.2em]"
            >
                ✦ Vedic Birth Chart ✦
            </motion.div>
        </motion.div>
    );
};
