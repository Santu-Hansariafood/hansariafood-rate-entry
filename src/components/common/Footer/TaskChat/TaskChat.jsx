"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Send, CheckCircle, AlertCircle, X, User, ListTodo } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Loading from "../../Loading/Loading";

const TaskChat = () => {
  const userContext = useUser();
  const { data: session } = useSession();
  const mobile = userContext?.mobile || session?.user?.mobile;
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
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [fetchTasks]);

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

  const handleSelectUser = (user) => {
    const words = input.split(" ");
    words.pop();
    const newValue = words.join(" ") + ` @${user.name} `;
    setInput(newValue);
    setSelectedReceivers((prev) => [...prev, { mobile: user.mobile, name: user.name }]);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!input.trim() || selectedReceivers.length === 0) {
      toast.warning("Please mention a user (@name) to assign the task.");
      return;
    }

    setLoading(true);
    try {
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
      const userName = session?.user?.name || localStorage.getItem("userName") || "Unknown";
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

  const myTasks = mobile ? tasks.filter(t => t.receivers.some(r => String(r.mobile) === String(mobile))) : [];
  const sentTasks = mobile ? tasks.filter(t => String(t.sender) === String(mobile)) : [];

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(mentionQuery) || 
    String(u.mobile).includes(mentionQuery)
  );

  const pendingCount = myTasks.filter((t) => {
    if (t.status !== "pending") return false;
    const taskDate = new Date(t.createdAt).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    return taskDate === today;
  }).length;

  if (!mobile) return null;

  return (
    <Suspense fallback={<Loading />}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 right-6 z-[60] flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.3)] border border-white/20 backdrop-blur-sm transition-all duration-300"
        title="Assign Tasks"
      >
        <ListTodo size={26} strokeWidth={2} />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 animate-bounce">
            {pendingCount > 9 ? "9+" : pendingCount}
          </span>
        )}
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-40 right-6 z-50 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[500px]"
          >
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Team Tasks</h3>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>

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
                    } shadow-sm group hover:shadow-md transition-shadow duration-200`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                            activeTab === "inbox" ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-purple-500 to-pink-600"
                        }`}>
                            {activeTab === "inbox" 
                                ? (task.senderName?.[0] || task.sender?.[0] || "U").toUpperCase()
                                : (task.receivers[0]?.name?.[0] || "U").toUpperCase()
                            }
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {activeTab === "inbox" 
                                    ? (task.senderName || task.sender)
                                    : `To: ${task.receivers.map(r => r.name).join(", ")}`
                                }
                            </p>
                            <span className="text-[10px] text-gray-400">
                                {new Date(task.createdAt).toLocaleString()}
                            </span>
                        </div>
                      </div>
                      
                      {task.status === "done" && (
                        <span className="text-green-600 text-xs font-bold flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          <CheckCircle size={12} /> Done
                        </span>
                      )}
                    </div>

                    <div className="pl-11">
                        {task.isImportant && (
                            <div className="mb-2">
                                <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                                    <AlertCircle size={10} /> Important
                                </span>
                            </div>
                        )}
                        <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 leading-relaxed">
                            {task.content}
                        </p>
                    </div>

                    <div className="flex justify-end items-center text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                      {activeTab === "inbox" && task.status === "pending" && (
                        <button
                          onClick={() => handleMarkDone(task._id)}
                          className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm hover:shadow transition-all text-xs font-medium flex items-center gap-1"
                        >
                          <CheckCircle size={12} /> Mark Done
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

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
    </Suspense>
  );
};

export default TaskChat;
