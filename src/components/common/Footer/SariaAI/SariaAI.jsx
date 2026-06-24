"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Copy, Mic, MicOff } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "../../Loading/Loading";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";

const SariaAI = () => {
  const { data: session } = useSession();
  const { mobile } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [greeting, setGreeting] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const messagesEndRef = useRef(null);

  // Get user name and set greeting
  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    let newGreeting;
    if (hour < 12) newGreeting = "Good morning";
    else if (hour < 18) newGreeting = "Good afternoon";
    else newGreeting = "Good evening";
    setGreeting(newGreeting);

    // Get user name
    const sessionName = session?.user?.name;
    const storedName = localStorage.getItem("userName");
    const name = sessionName || storedName || "Guest";
    // Format name
    const formattedName = name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    setUserName(formattedName);
  }, [session?.user?.name]);

  // Initialize messages with greeting
  useEffect(() => {
    if (greeting && userName && messages.length === 0) {
      setMessages([
        {
          id: 1,
          role: "assistant",
          content: `${greeting}, ${userName}! I'm SariaAI. How can I help you today?`,
          data: null
        }
      ]);
    }
  }, [greeting, userName]);

  // Setup voice recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        toast.error("Voice recognition failed. Please try again.");
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    } else {
      toast.error("Voice recognition is not supported in your browser.");
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const formatDataForCopy = (data) => {
    if (!Array.isArray(data)) return "";
    return data.map((item, idx) => {
      return `${idx + 1}. ` + Object.entries(item).map(([key, value]) => `${key}: ${value}`).join(", ");
    }).join("\n");
  };

  const handleSend = async (queryOverride = null, page = 1) => {
    const query = queryOverride || input.trim();
    if (!query) return;

    if (!queryOverride) {
      const userMessage = {
        id: Date.now(),
        role: "user",
        content: query
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
    }
    setLoading(true);

    try {
      const { data } = await axiosInstance.post("/sariaai", {
        query,
        page
      });

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
        data: data.data,
        hasMore: data.hasMore,
        nextPage: page + 1,
        originalQuery: query
      };

      setMessages((prev) => {
        if (queryOverride) {
          // Replace last message for pagination
          return prev.map((msg, idx) => {
            if (idx === prev.length - 1) {
              return {
                ...msg,
                data: [...(msg.data || []), ...(data.data || [])],
                hasMore: data.hasMore,
                nextPage: page + 1
              };
            }
            return msg;
          });
        }
        return [...prev, aiMessage];
      });
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

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-xl relative ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-700"
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    
                    {msg.data && Array.isArray(msg.data) && msg.data.length > 0 && (
                      <>
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
                        <button
                          onClick={() => handleCopy(`${msg.content}\n\n${formatDataForCopy(msg.data)}`)}
                          className="mt-3 text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                        >
                          <Copy size={14} /> Copy
                        </button>
                        {msg.hasMore && (
                          <button
                            onClick={() => handleSend(msg.originalQuery, msg.nextPage)}
                            disabled={loading}
                            className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50"
                          >
                            See More
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}

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
              <div className="flex gap-2 items-center">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-full transition ${
                    isListening 
                      ? "bg-red-500 text-white animate-pulse" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Ask SariaAI..."}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full border-none focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
                <button
                  onClick={() => handleSend()}
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