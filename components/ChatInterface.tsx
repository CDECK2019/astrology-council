"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Sparkles } from "lucide-react";

interface Message {
    role: "user" | "council";
    content: string;
}

export const ChatInterface = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: "council", content: "The Council is listening. What deeper aspects of your celestial alignment do you wish to explore?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        // Mock response for now
        setTimeout(() => {
            setMessages(prev => [...prev, { role: "council", content: "The alignment of Jupiter in your 9th house suggest a period of significant spiritual growth..." }]);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="glass-card flex flex-col h-[600px] overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="text-white font-medium flex items-center gap-2">
                    <Sparkles size={18} className="text-accent-gold" />
                    Council Dialogue
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[80%] flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-indigo-600" : "bg-white/10"
                                    }`}>
                                    {msg.role === "user" ? <User size={16} /> : <Sparkles size={16} className="text-accent-gold" />}
                                </div>
                                <div className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${msg.role === "user"
                                        ? "bg-indigo-600/20 border border-indigo-500/30 text-white"
                                        : "bg-white/5 border border-white/10 text-gray-300"
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-xs text-gray-500 italic">
                            Consulting the spheres...
                        </div>
                    </motion.div>
                )}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10">
                <div className="relative">
                    <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        placeholder="Ask the council..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
};
