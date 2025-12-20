"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EtherealBackground } from "@/components/EtherealBackground";
import { BirthDataForm } from "@/components/BirthDataForm";
import { DeliberationView } from "@/components/DeliberationView";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Home() {
    const [status, setStatus] = useState<"IDLE" | "CONSULTING">("IDLE");
    const router = useRouter();

    const handleConsult = async (data: any) => {
        setStatus("CONSULTING");

        try {
            const response = await fetch("/api/consult", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name,
                    year: parseInt(data.birthDate.split("-")[0]),
                    month: parseInt(data.birthDate.split("-")[1]),
                    date: parseInt(data.birthDate.split("-")[2]),
                    hours: parseInt(data.birthTime.split(":")[0]),
                    minutes: parseInt(data.birthTime.split(":")[1]),
                    latitude: 40.096,
                    longitude: -74.222,
                    timezone: -5.0,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to consult the spheres");
            }

            const result = await response.json();
            localStorage.setItem("astrology_results", JSON.stringify(result));
            router.push("/dashboard");
        } catch (error: any) {
            console.error("Consultation failed:", error);
            alert(error.message || "The stars are momentarily obscured. Please try again.");
            setStatus("IDLE");
        }
    };

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 overflow-hidden">
            <EtherealBackground />

            <AnimatePresence>
                {status === "CONSULTING" && <DeliberationView />}
            </AnimatePresence>

            {/* Hero Section */}
            <div className="z-10 text-center mb-12 max-w-3xl">
                {/* Decorative element */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="flex justify-center mb-6"
                >
                    <div className="relative">
                        <Sparkles className="w-8 h-8 text-accent-gold animate-pulse-slow" />
                        <div className="absolute inset-0 w-8 h-8 bg-accent-gold/20 blur-xl" />
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white font-cinzel leading-none"
                    style={{
                        textShadow: "0 0 60px rgba(129, 140, 248, 0.3), 0 0 120px rgba(167, 139, 250, 0.2)",
                    }}
                >
                    The Astrology{" "}
                    <span className="text-gradient">Council</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mt-6 text-lg sm:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed"
                >
                    Speak with the celestial wise. A council of AI experts awaits to decipher the cosmic alignment of your birth.
                </motion.p>

                {/* Decorative line */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="mt-8 mx-auto w-32 h-px bg-gradient-to-r from-transparent via-accent-indigo/50 to-transparent"
                />
            </div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="z-10 w-full max-w-md"
            >
                <BirthDataForm onSubmit={handleConsult} />
            </motion.div>

            {/* Footer tagline */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="z-10 mt-16 flex items-center gap-3 text-xs text-gray-500 uppercase tracking-[0.2em]"
            >
                <span className="w-8 h-px bg-gradient-to-r from-transparent to-gray-600" />
                <span>Vedic Wisdom</span>
                <span className="text-accent-gold">✦</span>
                <span>AI Enlightenment</span>
                <span className="w-8 h-px bg-gradient-to-l from-transparent to-gray-600" />
            </motion.div>
        </main>
    );
}
