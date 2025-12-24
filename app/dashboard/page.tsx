"use client";

import { useEffect, useState } from "react";
import { EtherealBackground } from "@/components/EtherealBackground";
import { motion } from "framer-motion";
import { COUNCIL_MEMBERS } from "@/lib/llm";
import { User, Volume2, AlertCircle, ArrowLeft, Star } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

const MEMBER_COLORS = ["#818cf8", "#a78bfa", "#f472b6"];

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("astrology_results");
        if (stored) {
            setData(JSON.parse(stored));
        } else {
            setError("No cosmic data found. Please return to the stars and enter your details.");
        }
    }, []);

    if (error) {
        return (
            <main className="relative min-h-screen flex items-center justify-center p-6">
                <EtherealBackground />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-10 text-center space-y-5 max-w-md"
                >
                    <AlertCircle className="mx-auto text-accent-rose" size={56} />
                    <h2 className="text-2xl font-bold text-white font-cinzel">Missing Data</h2>
                    <p className="text-gray-400">{error}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 mt-4 text-accent-indigo hover:text-accent-violet transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Return to Landing Page
                    </Link>
                </motion.div>
            </main>
        );
    }

    if (!data) return null;

    return (
        <main className="relative min-h-screen p-6 sm:p-10 lg:p-12 overflow-hidden">
            <EtherealBackground />

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 max-w-7xl mx-auto mb-10 flex items-center justify-between"
            >
                <Link
                    href="/"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                    <ArrowLeft size={16} />
                    <span>New Reading</span>
                </Link>
                <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-accent-gold" fill="currentColor" />
                    <span className="text-white font-cinzel text-lg tracking-wide">The Astrology Council</span>
                </div>
            </motion.header>

            <div className="z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Chart & Info */}
                <div className="lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-white font-cinzel tracking-tight">
                            Your <span className="text-gradient">Cosmic Blueprint</span>
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6 space-y-4"
                    >
                        <h3 className="text-sm font-semibold text-accent-indigo flex items-center gap-2 uppercase tracking-widest">
                            <User size={16} /> Native Details
                        </h3>
                        <div className="text-sm text-gray-400 space-y-2">
                            <p>Name: <span className="text-white font-medium">{data.userName}</span></p>
                            <p>Status: <span className="text-accent-gold">✦</span> <span className="text-accent-indigo">Divine Review Complete</span></p>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Council & Synthesis */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Master Synthesis */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-8 sm:p-10 ethereal-glow relative overflow-hidden"
                    >
                        <div className="absolute top-4 right-4 opacity-20 text-accent-gold text-4xl">
                            ✦
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-emerald to-accent-teal flex items-center justify-center shadow-glow-sm">
                                    <span className="text-white text-lg">✦</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-wider font-cinzel">
                                    The Master <span className="text-gradient">Decree</span>
                                </h2>
                            </div>
                            <button
                                onClick={() => {
                                    import('@/lib/voice').then(m => m.speak(data.synthesis));
                                }}
                                className="flex items-center gap-2 text-xs bg-accent-indigo/10 hover:bg-accent-indigo/20 border border-accent-indigo/30 px-4 py-2 rounded-full text-accent-indigo transition-all active:scale-95 whitespace-nowrap"
                            >
                                <Volume2 size={14} /> Listen
                            </button>
                        </div>
                        <div className="prose-cosmic prose prose-invert max-w-none text-gray-300 leading-relaxed">
                            <ReactMarkdown>{data.synthesis}</ReactMarkdown>
                        </div>
                    </motion.div>

                    {/* Council Deliberations */}
                    <div className="space-y-6">
                        <motion.h3
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-lg font-bold text-white uppercase tracking-[0.15em] border-l-4 border-accent-indigo pl-4 font-cinzel"
                        >
                            Council Deliberations
                        </motion.h3>
                        <div className="grid grid-cols-1 gap-5">
                            {data.reviews.map((review: any, i: number) => (
                                <motion.div
                                    key={review.modelId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                    className="glass-card p-6 sm:p-8 relative group"
                                    style={{
                                        borderTop: `2px solid ${MEMBER_COLORS[i]}30`,
                                    }}
                                >
                                    {/* Accent glow on hover */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                        style={{
                                            background: `radial-gradient(ellipse at top left, ${MEMBER_COLORS[i]}08 0%, transparent 50%)`,
                                        }}
                                    />

                                    <div className="flex items-start gap-4 mb-5">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                                            style={{
                                                backgroundColor: `${MEMBER_COLORS[i]}20`,
                                                border: `1px solid ${MEMBER_COLORS[i]}40`,
                                            }}
                                        >
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div
                                                className="text-xs font-bold uppercase tracking-widest mb-1"
                                                style={{ color: MEMBER_COLORS[i] }}
                                            >
                                                {COUNCIL_MEMBERS.find(m => m.id === review.modelId)?.name}
                                            </div>
                                            <div className="text-base text-white font-medium">{review.role}</div>
                                        </div>
                                    </div>
                                    <div className="prose-cosmic prose prose-invert max-w-none text-gray-300 leading-relaxed">
                                        <ReactMarkdown>{review.content}</ReactMarkdown>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Peer Reviews Section (Collapsible or just listed) */}
                    {data.peerReviews && data.peerReviews.length > 0 && (
                        <div className="space-y-6">
                            <motion.h3
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="text-lg font-bold text-white uppercase tracking-[0.15em] border-l-4 border-accent-rose pl-4 font-cinzel"
                            >
                                Peer Review Log
                            </motion.h3>
                            <div className="grid grid-cols-1 gap-5">
                                {data.peerReviews.map((review: any, i: number) => (
                                    <motion.div
                                        key={`peer-${i}`}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.8 + i * 0.1 }}
                                        className="glass-card p-6 bg-opacity-40 border-accent-rose/20"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <AlertCircle className="text-accent-rose w-5 h-5" />
                                            <span className="text-accent-rose font-bold uppercase tracking-wider text-sm">
                                                Critique by {review.reviewerName}
                                            </span>
                                        </div>
                                        <div className="prose-cosmic prose prose-sm prose-invert max-w-none text-gray-400">
                                            <ReactMarkdown>{review.rankings}</ReactMarkdown>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="z-10 max-w-7xl mx-auto mt-16 text-center text-xs text-gray-600 uppercase tracking-widest"
            >
                ✦ Powered by AI Wisdom ✦
            </motion.footer>
        </main>
    );
}
