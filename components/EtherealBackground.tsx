"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Star {
    id: number;
    size: number;
    x: number;
    y: number;
    duration: number;
    delay: number;
    opacity: number;
}

export const EtherealBackground = () => {
    const [stars, setStars] = useState<Star[]>([]);

    useEffect(() => {
        const generatedStars = [...Array(100)].map((_, i) => ({
            id: i,
            size: Math.random() * 2 + 0.5,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: Math.random() * 4 + 3,
            delay: Math.random() * 5,
            opacity: Math.random() * 0.5 + 0.2,
        }));
        setStars(generatedStars);
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: -1,
                overflow: "hidden",
                background: "linear-gradient(180deg, #0a0a1a 0%, #0d0d20 30%, #1a1a35 60%, #0d0d18 100%)",
            }}
        >
            {/* Subtle radial gradient overlay */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)",
                }}
            />

            {/* Stars */}
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    style={{
                        position: "absolute",
                        width: star.size,
                        height: star.size,
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.5)`,
                    }}
                    animate={{
                        opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
                    }}
                    transition={{
                        duration: star.duration,
                        delay: star.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Subtle bottom glow */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "150%",
                    height: "400px",
                    background: "radial-gradient(ellipse at center bottom, rgba(139, 92, 246, 0.06) 0%, transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            {/* Very subtle center glow */}
            <motion.div
                style={{
                    position: "absolute",
                    top: "40%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "600px",
                    height: "600px",
                    background: "radial-gradient(circle, rgba(99, 102, 241, 0.04) 0%, transparent 60%)",
                    pointerEvents: "none",
                }}
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
};
