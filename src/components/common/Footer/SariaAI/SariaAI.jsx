"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Search, TrendingUp, Building, MapPin, User } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "../../Loading/Loading";
import { toast } from "react-toastify";

const SariaAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input.trim()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axiosInstance.post("/sariaai", {
        query: userMessage.content
      });

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
        data: data.data
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast.error("Failed to get response from SariaAI");
      console.error("SariaAI error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 right-6 z-[60] flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-500 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.3)] border border-white/20 backdrop-blur-sm transition-all duration-300"
        title="SariaAI Assistant"
      >
        <Bot size={26} strokeWidth={2} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-40 right-6 z-50 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[550px]"
          >
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">SariaAI</h3>
                  <p className="text-xs text-emerald-100">Your AI Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-2 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950">
              <button
                onClick={() => setInput("top rate")}
                className="flex-1 px-3 py-2 text-xs font-medium bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-300 transition flex items-center justify-center gap-1"
              >
                <TrendingUp size={12} /> Top Rate
              </button>
              <button
                onClick={() => setInput("top 10 company rate with location")}
                className="flex-1 px-3 py-2 text-xs font-medium bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-300 transition flex items-center justify-center gap-1"
              >
                <Building size={12} /> Companies
              </button>
              <button
                onClick={() => setInput("top 10 seller name")}
                className="flex-1 px-3 py-2 text-xs font-medium bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-300 transition flex items-center justify-center gap-1"
              >
                <User size={12} /> Sellers
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950/50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-10">
                  <Bot size={48} className="mx-auto mb-4 text-emerald-500 opacity-50" />
                  <p>Hi! I'm SariaAI. Ask me about rates, companies, or sellers!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-xl ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-700"
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      
                      {msg.data && Array.isArray(msg.data) && msg.data.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.data.map((item, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs">
                              {Object.entries(item).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="font-medium capitalize">{key}:</span>
                                  <span>{value}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl rounded-bl-none border border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-emerald-500 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask SariaAI..."
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full border-none focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Suspense>
  );
};

export default SariaAI;
