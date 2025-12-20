"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User } from "lucide-react";

interface FormData {
    name: string;
    birthDate: string;
    birthTime: string;
    location: string;
}

export const BirthDataForm = ({ onSubmit }: { onSubmit: (data: FormData) => void }) => {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        birthDate: "",
        birthTime: "",
        location: "",
    });
    const [focused, setFocused] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
                background: "rgba(15, 13, 26, 0.8)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(129, 140, 248, 0.15)",
                borderRadius: "1.5rem",
                padding: "2.5rem",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Subtle inner gradient */}
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
                    marginBottom: "2rem",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "#fff",
                    fontFamily: "'Cinzel', serif",
                }}
            >
                Enter Your{" "}
                <span style={{
                    background: "linear-gradient(135deg, #818cf8, #a78bfa, #d4af37)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}>
                    Birth Details
                </span>
            </h2>

            <form onSubmit={handleSubmit} style={{ position: "relative", zIndex: 10 }}>
                <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.875rem",
                        color: focused === 'name' ? "#818cf8" : "#9ca3af",
                        marginBottom: "0.5rem",
                        transition: "color 0.3s",
                    }}>
                        <User size={14} />
                        <span>Name</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused(null)}
                        placeholder="e.g. Alexander the Great"
                        style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.03)",
                            border: focused === 'name' ? "1px solid rgba(129, 140, 248, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "0.75rem",
                            padding: "0.875rem 1rem",
                            color: "#fff",
                            fontSize: "1rem",
                            outline: "none",
                            transition: "all 0.3s",
                            boxShadow: focused === 'name' ? "0 0 20px rgba(129, 140, 248, 0.15)" : "none",
                        }}
                    />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                    <div>
                        <label style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.875rem",
                            color: focused === 'date' ? "#818cf8" : "#9ca3af",
                            marginBottom: "0.5rem",
                            transition: "color 0.3s",
                        }}>
                            <Calendar size={14} />
                            <span>Birth Date</span>
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.birthDate}
                            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                            onFocus={() => setFocused('date')}
                            onBlur={() => setFocused(null)}
                            style={{
                                width: "100%",
                                background: "rgba(255, 255, 255, 0.03)",
                                border: focused === 'date' ? "1px solid rgba(129, 140, 248, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "0.75rem",
                                padding: "0.875rem 1rem",
                                color: "#fff",
                                fontSize: "1rem",
                                outline: "none",
                                transition: "all 0.3s",
                                boxShadow: focused === 'date' ? "0 0 20px rgba(129, 140, 248, 0.15)" : "none",
                                colorScheme: "dark",
                            }}
                        />
                    </div>
                    <div>
                        <label style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.875rem",
                            color: focused === 'time' ? "#818cf8" : "#9ca3af",
                            marginBottom: "0.5rem",
                            transition: "color 0.3s",
                        }}>
                            <Clock size={14} />
                            <span>Birth Time</span>
                        </label>
                        <input
                            type="time"
                            required
                            value={formData.birthTime}
                            onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                            onFocus={() => setFocused('time')}
                            onBlur={() => setFocused(null)}
                            style={{
                                width: "100%",
                                background: "rgba(255, 255, 255, 0.03)",
                                border: focused === 'time' ? "1px solid rgba(129, 140, 248, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "0.75rem",
                                padding: "0.875rem 1rem",
                                color: "#fff",
                                fontSize: "1rem",
                                outline: "none",
                                transition: "all 0.3s",
                                boxShadow: focused === 'time' ? "0 0 20px rgba(129, 140, 248, 0.15)" : "none",
                                colorScheme: "dark",
                            }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.875rem",
                        color: focused === 'location' ? "#818cf8" : "#9ca3af",
                        marginBottom: "0.5rem",
                        transition: "color 0.3s",
                    }}>
                        <MapPin size={14} />
                        <span>Birth Location</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        onFocus={() => setFocused('location')}
                        onBlur={() => setFocused(null)}
                        placeholder="City, Province/State, Country"
                        style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.03)",
                            border: focused === 'location' ? "1px solid rgba(129, 140, 248, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "0.75rem",
                            padding: "0.875rem 1rem",
                            color: "#fff",
                            fontSize: "1rem",
                            outline: "none",
                            transition: "all 0.3s",
                            boxShadow: focused === 'location' ? "0 0 20px rgba(129, 140, 248, 0.15)" : "none",
                        }}
                    />
                </div>

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
                        transition: "all 0.3s",
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
        </motion.div>
    );
};
