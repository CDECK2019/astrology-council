"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const DELIBERATION_QUOTES = [
    "The Council is consulting the ancient scrolls...",
    "Aligning your birth data with the celestial spheres...",
    "The Sage of Wisdom is interpreting your karma...",
    "The Scholar of Tradition is calculating planetary dashas...",
    "The Architect of Life is drafting your cosmic blueprint...",
    "Synthesizing the collective wisdom of the spheres...",
];

export const DeliberationView = () => {
    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % DELIBERATION_QUOTES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-cosmic-dark/90 backdrop-blur-2xl"
        >
            {/* Vortex background effect */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Concentric rings */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2 rounded-full border"
                        style={{
                            width: 150 + i * 80,
                            height: 150 + i * 80,
                            marginLeft: -(75 + i * 40),
                            marginTop: -(75 + i * 40),
                            borderColor: `rgba(129, 140, 248, ${0.15 - i * 0.02})`,
                        }}
                        animate={{
                            rotate: i % 2 === 0 ? 360 : -360,
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            rotate: { duration: 20 + i * 5, repeat: Infinity, ease: "linear" },
                            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                        }}
                    />
                ))}

                {/* Orbiting particles */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={`particle-${i}`}
                        className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-accent-indigo"
                        style={{
                            boxShadow: "0 0 10px rgba(129, 140, 248, 0.8)",
                        }}
                        animate={{
                            x: Math.cos((i * Math.PI * 2) / 8) * (100 + i * 15),
                            y: Math.sin((i * Math.PI * 2) / 8) * (100 + i * 15),
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            x: { duration: 8 + i, repeat: Infinity, ease: "linear" },
                            y: { duration: 8 + i, repeat: Infinity, ease: "linear" },
                            opacity: { duration: 2, repeat: Infinity },
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 text-center space-y-10 px-6 max-w-lg">
                {/* Central glowing orb */}
                <motion.div
                    animate={{
                        scale: [1, 1.15, 1],
                        rotate: [0, 360],
                    }}
                    transition={{
                        scale: { duration: 3, repeat: Infinity },
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    }}
                    className="mx-auto w-28 h-28 rounded-full p-[2px] shadow-glow-lg"
                    style={{
                        background: "linear-gradient(135deg, var(--accent-indigo), var(--accent-violet), var(--accent-gold))",
                    }}
                >
                    <div className="w-full h-full rounded-full bg-cosmic-dark flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <Sparkles className="text-accent-gold w-12 h-12" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Text content */}
                <div className="space-y-5">
                    <motion.h2
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-[0.15em] font-cinzel"
                        style={{
                            textShadow: "0 0 40px rgba(129, 140, 248, 0.4)",
                        }}
                    >
                        Council <span className="text-gradient">Deliberation</span>
                    </motion.h2>
                    <div className="h-10">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={quoteIndex}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.5 }}
                                className="text-accent-indigo/80 text-lg italic font-medium"
                            >
                                "{DELIBERATION_QUOTES[quoteIndex]}"
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Loading dots */}
                <div className="flex justify-center gap-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                opacity: [0.3, 1, 0.3],
                                scale: [0.8, 1.2, 0.8],
                                backgroundColor: [
                                    "rgba(129, 140, 248, 1)",
                                    "rgba(167, 139, 250, 1)",
                                    "rgba(129, 140, 248, 1)",
                                ],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.15,
                            }}
                            className="w-2.5 h-2.5 rounded-full bg-accent-indigo"
                            style={{
                                boxShadow: "0 0 8px rgba(129, 140, 248, 0.6)",
                            }}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
