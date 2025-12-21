"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Sparkles } from "lucide-react";

const ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const SIGN_SYMBOLS: Record<string, string> = {
    Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
    Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
    Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
};

const PLANETS = [
    "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"
];

const PLANET_SYMBOLS: Record<string, string> = {
    Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
    Jupiter: "♃", Saturn: "♄", Rahu: "☊", Ketu: "☋"
};

interface PlanetPlacement {
    name: string;
    isRetro: boolean;
}

interface HouseData {
    house: number;
    sign: string;
    planets: PlanetPlacement[];
}

interface ManualChartData {
    name: string;
    chartData: {
        ascendantSign: string;
        houses: HouseData[];
    };
}

interface ManualChartInputProps {
    onSubmit: (data: ManualChartData) => void;
}

export const ManualChartInput = ({ onSubmit }: ManualChartInputProps) => {
    const [name, setName] = useState("");
    const [ascendantSign, setAscendantSign] = useState("Aries");
    const [housePlanets, setHousePlanets] = useState<PlanetPlacement[][]>(
        Array(12).fill(null).map(() => [])
    );
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

    // Calculate signs for all houses based on ascendant
    const getHouseSigns = (): string[] => {
        const ascIndex = ZODIAC_SIGNS.indexOf(ascendantSign);
        return Array(12).fill(null).map((_, i) =>
            ZODIAC_SIGNS[(ascIndex + i) % 12]
        );
    };

    const houseSigns = getHouseSigns();

    const togglePlanet = (houseIndex: number, planetName: string) => {
        setHousePlanets(prev => {
            const newPlanets = [...prev];
            const houseData = [...newPlanets[houseIndex]];

            const existingIndex = houseData.findIndex(p => p.name === planetName);

            if (existingIndex >= 0) {
                // Remove planet from this house
                houseData.splice(existingIndex, 1);
            } else {
                // Remove from any other house first
                for (let i = 0; i < newPlanets.length; i++) {
                    if (i !== houseIndex) {
                        newPlanets[i] = newPlanets[i].filter(p => p.name !== planetName);
                    }
                }
                // Add to this house
                houseData.push({ name: planetName, isRetro: false });
            }

            newPlanets[houseIndex] = houseData;
            return newPlanets;
        });
    };

    const toggleRetrograde = (houseIndex: number, planetName: string) => {
        setHousePlanets(prev => {
            const newPlanets = [...prev];
            const houseData = [...newPlanets[houseIndex]];

            const planetIdx = houseData.findIndex(p => p.name === planetName);
            if (planetIdx >= 0) {
                houseData[planetIdx] = {
                    ...houseData[planetIdx],
                    isRetro: !houseData[planetIdx].isRetro
                };
            }

            newPlanets[houseIndex] = houseData;
            return newPlanets;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const houses: HouseData[] = houseSigns.map((sign, i) => ({
            house: i + 1,
            sign,
            planets: housePlanets[i]
        }));

        onSubmit({
            name,
            chartData: {
                ascendantSign,
                houses
            }
        });
    };

    // Get all assigned planets for visual feedback
    const getAssignedPlanets = (): Set<string> => {
        const assigned = new Set<string>();
        housePlanets.forEach(house => {
            house.forEach(p => assigned.add(p.name));
        });
        return assigned;
    };

    const assignedPlanets = getAssignedPlanets();

    const inputStyle = {
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "0.5rem",
        padding: "0.5rem 0.75rem",
        color: "#fff",
        fontSize: "0.875rem",
        outline: "none",
        transition: "all 0.3s",
    };

    const selectStyle = {
        ...inputStyle,
        cursor: "pointer",
        appearance: "none" as const,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.5rem center",
        backgroundSize: "1rem",
        paddingRight: "2rem",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
                background: "rgba(15, 13, 26, 0.85)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(129, 140, 248, 0.15)",
                borderRadius: "1.5rem",
                padding: "2rem",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                position: "relative",
                overflow: "hidden",
                width: "100%",
                maxWidth: "700px",
            }}
        >
            {/* Header gradient */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(ellipse at top right, rgba(129, 140, 248, 0.08) 0%, transparent 50%)",
                    pointerEvents: "none",
                }}
            />

            <h2
                style={{
                    marginBottom: "1.5rem",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#fff",
                    fontFamily: "'Cinzel', serif",
                    textAlign: "center",
                }}
            >
                Enter Your{" "}
                <span style={{
                    background: "linear-gradient(135deg, #818cf8, #a78bfa, #d4af37)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}>
                    Birth Chart
                </span>
            </h2>

            <form onSubmit={handleSubmit} style={{ position: "relative" }}>
                {/* Name Input */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                        marginBottom: "0.5rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                    }}>
                        <User size={14} />
                        <span>Name</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        style={{ ...inputStyle, width: "100%" }}
                    />
                </div>

                {/* Ascendant Selection */}
                <div style={{ marginBottom: "1rem" }}>
                    <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.75rem",
                        color: "#818cf8",
                        marginBottom: "0.5rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                    }}>
                        <Sparkles size={14} />
                        <span>Ascendant (House 1 Sign)</span>
                    </label>
                    <select
                        value={ascendantSign}
                        onChange={(e) => setAscendantSign(e.target.value)}
                        style={{ ...selectStyle, width: "100%" }}
                    >
                        {ZODIAC_SIGNS.map(sign => (
                            <option key={sign} value={sign} style={{ background: "#1a1625" }}>
                                {SIGN_SYMBOLS[sign]} {sign}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Chart Table */}
                <div style={{
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    marginBottom: "1.5rem",
                }}>
                    {/* Table Header */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "60px 140px 1fr",
                        background: "rgba(129, 140, 248, 0.1)",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        padding: "0.75rem 1rem",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "#818cf8",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                    }}>
                        <div>House</div>
                        <div>Sign</div>
                        <div>Planets</div>
                    </div>

                    {/* Table Rows */}
                    {houseSigns.map((sign, index) => (
                        <div
                            key={index}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "60px 140px 1fr",
                                borderBottom: index < 11 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
                                padding: "0.5rem 1rem",
                                alignItems: "center",
                                transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                            {/* House Number */}
                            <div style={{ color: "#9ca3af", fontWeight: 500 }}>
                                {index + 1}
                            </div>

                            {/* Sign */}
                            <div style={{ color: "#e2e8f0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ color: "#d4af37" }}>{SIGN_SYMBOLS[sign]}</span>
                                <span>{sign}</span>
                            </div>

                            {/* Planets */}
                            <div style={{ position: "relative" }}>
                                <div
                                    onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                                    style={{
                                        ...inputStyle,
                                        cursor: "pointer",
                                        minHeight: "36px",
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "0.25rem",
                                        alignItems: "center",
                                    }}
                                >
                                    {housePlanets[index].length === 0 ? (
                                        <span style={{ color: "#6b7280", fontSize: "0.8rem" }}>Select planets...</span>
                                    ) : (
                                        housePlanets[index].map(planet => (
                                            <span
                                                key={planet.name}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "0.25rem",
                                                    background: planet.isRetro ? "rgba(239, 68, 68, 0.2)" : "rgba(129, 140, 248, 0.2)",
                                                    border: `1px solid ${planet.isRetro ? "rgba(239, 68, 68, 0.3)" : "rgba(129, 140, 248, 0.3)"}`,
                                                    borderRadius: "0.375rem",
                                                    padding: "0.125rem 0.5rem",
                                                    fontSize: "0.75rem",
                                                    color: planet.isRetro ? "#fca5a5" : "#a5b4fc",
                                                }}
                                            >
                                                <span>{PLANET_SYMBOLS[planet.name]}</span>
                                                <span>{planet.name}</span>
                                                {planet.isRetro && <span style={{ fontSize: "0.6rem" }}>R</span>}
                                            </span>
                                        ))
                                    )}
                                </div>

                                {/* Dropdown */}
                                {openDropdown === index && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            right: 0,
                                            background: "rgba(26, 22, 37, 0.98)",
                                            border: "1px solid rgba(129, 140, 248, 0.2)",
                                            borderRadius: "0.5rem",
                                            marginTop: "0.25rem",
                                            zIndex: 50,
                                            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                                            maxHeight: "200px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        {PLANETS.map(planet => {
                                            const isInThisHouse = housePlanets[index].some(p => p.name === planet);
                                            const isAssignedElsewhere = assignedPlanets.has(planet) && !isInThisHouse;

                                            return (
                                                <div
                                                    key={planet}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        padding: "0.5rem 0.75rem",
                                                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                                                        opacity: isAssignedElsewhere ? 0.4 : 1,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "0.5rem",
                                                            cursor: "pointer",
                                                            flex: 1,
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            togglePlanet(index, planet);
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isInThisHouse}
                                                            readOnly
                                                            style={{ accentColor: "#818cf8", pointerEvents: "none" }}
                                                        />
                                                        <span style={{ color: "#d4af37" }}>{PLANET_SYMBOLS[planet]}</span>
                                                        <span style={{ color: "#e2e8f0", fontSize: "0.85rem" }}>{planet}</span>
                                                    </div>

                                                    {isInThisHouse && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleRetrograde(index, planet);
                                                            }}
                                                            style={{
                                                                background: housePlanets[index].find(p => p.name === planet)?.isRetro
                                                                    ? "rgba(239, 68, 68, 0.3)"
                                                                    : "rgba(255, 255, 255, 0.1)",
                                                                border: "none",
                                                                borderRadius: "0.25rem",
                                                                padding: "0.125rem 0.5rem",
                                                                fontSize: "0.7rem",
                                                                color: housePlanets[index].find(p => p.name === planet)?.isRetro
                                                                    ? "#fca5a5"
                                                                    : "#9ca3af",
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            R
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    style={{
                        width: "100%",
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)",
                        backgroundSize: "200% 100%",
                        border: "none",
                        borderRadius: "0.75rem",
                        padding: "1rem",
                        color: "#fff",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        cursor: "pointer",
                        boxShadow: "0 10px 40px rgba(99, 102, 241, 0.3)",
                    }}
                >
                    Consult The Council
                </motion.button>

                <p style={{
                    textAlign: "center",
                    fontSize: "0.625rem",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    marginTop: "1rem",
                }}>
                    ✦ Ancient Wisdom • Artificial Intelligence ✦
                </p>
            </form>

            {/* Click outside to close dropdown */}
            {openDropdown !== null && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 40,
                    }}
                    onClick={() => setOpenDropdown(null)}
                />
            )}
        </motion.div>
    );
};
