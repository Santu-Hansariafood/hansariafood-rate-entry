"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Copy, Mic, MicOff, Trash2, Zap, TrendingUp, Users, PieChart, Building2 } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "../../Loading/Loading";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import debounce from "lodash.debounce";

const SariaAI = () => {
  const { data: session } = useSession();
  const { mobile } = useUser();

  if (!session) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [greeting, setGreeting] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // Company auto-suggestion state
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [companySuggestionsLoading, setCompanySuggestionsLoading] = useState(false);
  const suggestionDropdownRef = useRef(null);
  const autoClearTimerRef = useRef(null);
  const AUTO_CLEAR_DELAY = 10 * 60 * 1000; // 10 minutes in milliseconds

  // Quick prompts
  const quickPrompts = [
    { text: "Show today's rates", icon: <Zap size={14} />, color: "from-yellow-400 to-orange-500" },
    { text: "Top sellers this week", icon: <TrendingUp size={14} />, color: "from-blue-400 to-cyan-500" },
    { text: "Company performance", icon: <Users size={14} />, color: "from-purple-400 to-pink-500" },
    { text: "Summary report", icon: <PieChart size={14} />, color: "from-green-400 to-emerald-500" },
  ];

  // Fetch company suggestions with debounce
  const fetchCompanySuggestions = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm || searchTerm.length < 2) {
        setCompanySuggestions([]);
        setShowCompanySuggestions(false);
        return;
      }

      setCompanySuggestionsLoading(true);
      try {
        const response = await axiosInstance.get("/managecompany", {
          params: { q: searchTerm, page: 1, limit: 10 },
        });
        const companies = response.data.companies || [];
        setCompanySuggestions(companies);
        setShowCompanySuggestions(companies.length > 0);
      } catch (error) {
        console.error("Failed to fetch company suggestions:", error);
        setCompanySuggestions([]);
      } finally {
        setCompanySuggestionsLoading(false);
      }
    }, 300),
    []
  );

  // Handle company selection
  const handleCompanySelect = useCallback((companyName) => {
    setInput(companyName);
    setShowCompanySuggestions(false);
  }, []);

  // Auto-clear timer functions
  const startAutoClearTimer = useCallback(() => {
    if (autoClearTimerRef.current) {
      clearTimeout(autoClearTimerRef.current);
    }
    autoClearTimerRef.current = setTimeout(() => {
      // Auto-clear chat
      setMessages([]);
      localStorage.removeItem("sariaai_chat");
      toast.info("Chat history cleared after inactivity.");
    }, AUTO_CLEAR_DELAY);
  }, []);

  const resetAutoClearTimer = useCallback(() => {
    startAutoClearTimer();
  }, [startAutoClearTimer]);

  const handleClearChat = useCallback(() => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      setMessages([]);
      localStorage.removeItem("sariaai_chat");
      if (autoClearTimerRef.current) {
        clearTimeout(autoClearTimerRef.current);
      }
      startAutoClearTimer();
      toast.success("Chat history cleared!");
    }
  }, [startAutoClearTimer]);

  const handleQuickPrompt = useCallback((text) => {
    setInput(text);
    resetAutoClearTimer();
  }, [resetAutoClearTimer]);

  const handleSend = useCallback(async (queryOverride = null, page = 1) => {
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
    setShowCompanySuggestions(false);
    resetAutoClearTimer();

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
        topSellers: data.topSellers,
        hasMore: data.hasMore,
        nextPage: page + 1,
        originalQuery: query
      };

      setMessages((prev) => {
        if (queryOverride) {
          // Replace last message for pagination
          return prev.map((msg, idx) => {
            if (idx === prev.length - 1) {
              const existingData = msg.data || [];
              const newData = data.data || [];
              return {
                ...msg,
                data: [...existingData, ...newData],
                topSellers: data.topSellers || msg.topSellers,
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
      const errorMessage = error.response?.data?.message || "Failed to get response from Saria AI";
      toast.error(errorMessage);
      
      // Add error message to chat
      const errorMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Sorry, I couldn't process that. ${errorMessage}`,
        data: null
      };
      setMessages((prev) => [...prev, errorMsg]);
      
      console.error("Saria AI error:", error);
    } finally {
      setLoading(false);
    }
  }, [input, resetAutoClearTimer]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      toast.error("Voice recognition is not supported in your browser.");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleCopy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  }, []);

  const formatDataForCopy = useCallback((data, topSellers) => {
    let result = "";
    
    if (Array.isArray(data) && data.length > 0) {
      result += data.map((item, index) => {
        let lines = [`--- Item ${index + 1} ---`];
        
        Object.entries(item).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            lines.push(`${formattedKey}: ${value}`);
          }
        });
        
        return lines.join("\n");
      }).join("\n\n");
    }
    
    if (Array.isArray(topSellers) && topSellers.length > 0) {
      result += "\n\n--- Top Sellers ---\n";
      result += topSellers.map((seller, index) => {
        let line = `${index + 1}. ${seller.sellerName}: ${seller.companies}`;
        if (seller.totalTons !== undefined) {
          line += ` (${seller.totalTons} tons, ${seller.saudaCount} saudas)`;
        }
        return line;
      }).join("\n");
    }
    
    return result;
  }, []);

  // Memoized: Get user name and set greeting
  const userData = useMemo(() => {
    const hour = new Date().getHours();
    let newGreeting;
    if (hour < 12) newGreeting = "Good morning";
    else if (hour < 18) newGreeting = "Good afternoon";
    else newGreeting = "Good evening";

    const sessionName = session?.user?.name;
    const storedName = typeof window !== "undefined" ? localStorage.getItem("userName") : null;
    const name = sessionName || storedName || "Guest";
    const formattedName = name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    return { greeting: newGreeting, userName: formattedName };
  }, [session?.user?.name]);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("sariaai_chat");
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (e) {
        console.error("Failed to load saved messages:", e);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("sariaai_chat", JSON.stringify(messages));
    }
  }, [messages]);

  // Update state when userData changes
  useEffect(() => {
    setGreeting(userData.greeting);
    setUserName(userData.userName);
  }, [userData]);

  // Initialize messages with greeting only when chat opens and no saved messages
  useEffect(() => {
    if (isOpen && greeting && userName && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        role: "assistant",
        content: `${greeting}, ${userName}! I'm Saria AI. How can I help you today?`,
        data: null
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, greeting, userName, messages.length]);

  // Update suggestions when input changes
  useEffect(() => {
    fetchCompanySuggestions(input);
  }, [input, fetchCompanySuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionDropdownRef.current &&
        !suggestionDropdownRef.current.contains(event.target)
      ) {
        setShowCompanySuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Manage auto-clear timer when chat opens/closes
  useEffect(() => {
    if (isOpen) {
      startAutoClearTimer();
    } else if (autoClearTimerRef.current) {
      clearTimeout(autoClearTimerRef.current);
    }
    return () => {
      if (autoClearTimerRef.current) {
        clearTimeout(autoClearTimerRef.current);
      }
    };
  }, [isOpen, startAutoClearTimer]);

  // Reset timer when user interacts with chat
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      resetAutoClearTimer();
    }
  }, [messages, isOpen, resetAutoClearTimer]);

  // Setup voice recognition only when chat is first opened
  useEffect(() => {
    if (!isOpen || recognition) return;

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
      recognitionRef.current = rec;
    }
  }, [isOpen, recognition]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <Suspense fallback={null}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-28 right-4 sm:bottom-32 sm:right-6 z-[60] flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-500 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.3)] border border-white/20 backdrop-blur-sm transition-all duration-300"
        title="Saria AI Assistant"
      >
        <Bot size={24} strokeWidth={2} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-44 right-4 sm:bottom-48 sm:right-6 z-50 w-[calc(100%-32px)] sm:w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[550px]"
          >
            <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Saria AI</h3>
                  <p className="text-xs text-emerald-100">Your AI Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleClearChat}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition"
                  title="Clear chat"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50 dark:bg-gray-950/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] p-3 sm:p-4 rounded-2xl relative ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-md shadow-lg"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-700 shadow-sm"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    
                    {msg.data && Array.isArray(msg.data) && msg.data.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {msg.data.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs space-y-1"
                          >
                            {Object.entries(item).map(([key, value]) => {
                              if (value === null || value === undefined || value === "") {
                                return null;
                              }
                              const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                              return (
                                <div key={key} className="flex justify-between">
                                  <span className="font-medium">{formattedKey}:</span>
                                  <span className="text-gray-700 dark:text-gray-300">{value}</span>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                        
                        {msg.topSellers && msg.topSellers.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-xs">
                            <p className="font-medium text-blue-700 dark:text-blue-300 mb-2">Top Sellers:</p>
                            <div className="space-y-1">
                              {msg.topSellers.map((seller, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="font-medium">{seller.sellerName}:</span>
                                    <span className="text-gray-700 dark:text-gray-300">{seller.companies}</span>
                                  </div>
                                  {seller.totalTons !== undefined && (
                                    <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                                      <span>Total Tons:</span>
                                      <span>{seller.totalTons} tons</span>
                                    </div>
                                  )}
                                  {seller.saudaCount !== undefined && (
                                    <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                                      <span>Sauda Count:</span>
                                      <span>{seller.saudaCount}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(`${msg.content}\n\n${formatDataForCopy(msg.data, msg.topSellers)}`)}
                            className="mt-2 text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                          >
                            <Copy size={14} /> Copy Report
                          </button>
                        </div>

                        {msg.hasMore && (
                          <button
                            onClick={() => handleSend(msg.originalQuery, msg.nextPage)}
                            disabled={loading}
                            className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50"
                          >
                            See More
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Quick prompts when chat starts */}
              {messages.length <= 1 && !loading && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {quickPrompts.map((prompt, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleQuickPrompt(prompt.text)}
                      className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-700 dark:text-gray-300 hover:shadow-md transition-all flex items-center gap-2"
                    >
                      <div className={`p-1 rounded-full bg-gradient-to-r ${prompt.color} text-white`}>
                        {prompt.icon}
                      </div>
                      <span className="font-medium truncate">{prompt.text}</span>
                    </motion.button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl rounded-bl-none border border-gray-200 dark:border-gray-700">
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

            <div className="p-3 sm:p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
              <div className="flex gap-2 items-end relative">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-full transition flex-shrink-0 ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <div className="flex-1 relative" ref={suggestionDropdownRef}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => {
                      if (companySuggestions.length > 0) {
                        setShowCompanySuggestions(true);
                      }
                    }}
                    placeholder={isListening ? "Listening..." : "Ask SariaAI..."}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setShowCompanySuggestions(false);
                        handleSend();
                      }
                    }}
                    className="w-full px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full border-none focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                  
                  {/* Company suggestions dropdown */}
                  <AnimatePresence>
                    {showCompanySuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto z-10"
                      >
                        {companySuggestionsLoading ? (
                          <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                            <Loading />
                          </div>
                        ) : (
                          companySuggestions.map((company, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleCompanySelect(company.name)}
                              className="w-full px-4 py-2 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 last:border-0 first:rounded-t-xl last:rounded-b-xl"
                            >
                              <Building2 size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                  {company.name}
                                </p>
                                {company.category && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {company.category}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={loading}
                  className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 transition flex-shrink-0"
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
