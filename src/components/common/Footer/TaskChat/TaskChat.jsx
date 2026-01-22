"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, CheckCircle, AlertCircle, X, User } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";

const TaskChat = () => {
  const userContext = useUser();
  const mobile = userContext?.mobile;
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedReceivers, setSelectedReceivers] = useState([]);
  const [activeTab, setActiveTab] = useState("inbox"); // 'inbox' (assigned to me) | 'sent' (assigned by me)
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Fetch Users for Mentions
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axiosInstance.get("/auth/register");
        const userList = Array.isArray(data?.users) ? data.users : Array.isArray(data) ? data : [];
        setUsers(userList);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    fetchUsers();
  }, []);

  // Poll Tasks
  const fetchTasks = useCallback(async () => {
    if (!mobile) return;
    try {
      const { data } = await axiosInstance.get(`/tasks?mobile=${mobile}`);
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  }, [mobile]);

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
      const interval = setInterval(fetchTasks, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [isOpen, fetchTasks]);

  // Handle Input Change (Detect @)
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    const lastWord = val.split(" ").pop();
    if (lastWord.startsWith("@")) {
      setShowMentions(true);
      setMentionQuery(lastWord.slice(1).toLowerCase());
    } else {
      setShowMentions(false);
    }
  };

  // Select User from Mention List
  const handleSelectUser = (user) => {
    const words = input.split(" ");
    words.pop(); // Remove the incomplete @mention
    const newValue = words.join(" ") + ` @${user.name} `;
    setInput(newValue);
    setSelectedReceivers((prev) => [...prev, { mobile: user.mobile, name: user.name }]);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  // Send Task
  const handleSend = async () => {
    if (!input.trim() || selectedReceivers.length === 0) {
      toast.warning("Please mention a user (@name) to assign the task.");
      return;
    }

    setLoading(true);
    try {
        // Check for "important" keyword
      const isImportant = input.toLowerCase().includes("important");
      const senderName = localStorage.getItem("userName") || "Unknown";

      await axiosInstance.post("/tasks", {
        sender: mobile,
        senderName,
        receivers: selectedReceivers,
        content: input,
        isImportant
      });

      setInput("");
      setSelectedReceivers([]);
      fetchTasks();
      toast.success("Task assigned!");
    } catch (error) {
      toast.error("Failed to assign task");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async (taskId) => {
    try {
      const userName = localStorage.getItem("userName") || "Unknown";
      await axiosInstance.put("/tasks", {
        taskId,
        status: "done",
        completedBy: userName
      });
      fetchTasks();
      toast.success("Task marked as done!");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  // Filter Tasks
  const myTasks = mobile ? tasks.filter(t => t.receivers.some(r => String(r.mobile) === String(mobile))) : [];
  const sentTasks = mobile ? tasks.filter(t => String(t.sender) === String(mobile)) : [];

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(mentionQuery) || 
    String(u.mobile).includes(mentionQuery)
  );

  const pendingCount = myTasks.filter(t => t.status === 'pending').length;

  if (!mobile) return null;

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 right-6 z-50 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all"
      >
        <MessageSquare size={24} />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 animate-pulse">
            {pendingCount > 9 ? "9+" : pendingCount}
          </span>
        )}
      </motion.button>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-40 right-6 z-50 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[500px]"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Team Tasks</h3>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("inbox")}
                className={`flex-1 py-3 text-sm font-medium transition ${
                  activeTab === "inbox"
                    ? "text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                }`}
              >
                Assigned to Me ({myTasks.filter(t => t.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveTab("sent")}
                className={`flex-1 py-3 text-sm font-medium transition ${
                  activeTab === "sent"
                    ? "text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                }`}
              >
                Assigned by Me
              </button>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950/50">
              {(activeTab === "inbox" ? myTasks : sentTasks).length === 0 ? (
                <div className="text-center text-gray-400 py-10">No tasks found</div>
              ) : (
                (activeTab === "inbox" ? myTasks : sentTasks).map((task) => (
                  <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border ${
                      task.status === "done"
                        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                        : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                    } shadow-sm`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {task.isImportant && (
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <AlertCircle size={12} /> Important
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(task.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {task.status === "done" && (
                        <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                          <CheckCircle size={12} /> Done
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">{task.content}</p>

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>
                        {activeTab === "inbox" 
                          ? `From: ${task.senderName || task.sender}`
                          : `To: ${task.receivers.map(r => r.name).join(", ")}`
                        }
                      </span>
                      
                      {activeTab === "inbox" && task.status === "pending" && (
                        <button
                          onClick={() => handleMarkDone(task._id)}
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-xs font-semibold"
                        >
                          Mark Done
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 relative">
              {showMentions && (
                <div className="absolute bottom-full left-4 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <User size={14} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.mobile}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type @name to assign..."
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 ml-2">
                Tip: Type "important" to mark high priority.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TaskChat;
