"use client";
import React, { useState } from "react";
import { Eye, Edit, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Actions = ({ item }) => {
  const [modal, setModal] = useState({ open: false, type: "" });

  const openModal = (type) => setModal({ open: true, type });
  const closeModal = () => setModal({ open: false, type: "" });

  const handleAction = () => {
    if (modal.type === "view") item.onView(item.id);
    else if (modal.type === "edit") item.onEdit(item);
    else if (modal.type === "delete") item.onDelete(item.id);
    closeModal();
  };

  const buttons = [
    {
      type: "edit",
      icon: Edit,
      color: "from-blue-400 to-indigo-500",
      glow: "shadow-blue-400/50",
    },
    {
      type: "view",
      icon: Eye,
      color: "from-green-400 to-emerald-500",
      glow: "shadow-green-400/50",
    },
    {
      type: "delete",
      icon: Trash2,
      color: "from-red-400 to-rose-500",
      glow: "shadow-red-400/50",
    },
  ];

  return (
    <div className="flex items-center gap-3">
      {buttons.map(({ type, icon: Icon, color, glow }) => (
        <motion.button
          key={type}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openModal(type)}
          className={`
            p-2 rounded-full text-white
            bg-gradient-to-br ${color}
            shadow-lg ${glow}
            transition-all
          `}
          title={type}
        >
          <Icon size={18} />
        </motion.button>
      ))}

      <AnimatePresence>
        {modal.open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="
                relative w-full max-w-md rounded-2xl
                bg-white/70 dark:bg-gray-900/70
                border border-white/30 dark:border-gray-700
                shadow-2xl backdrop-blur-xl p-6
              "
            >
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
              >
                <X size={22} />
              </button>

              <h2 className="text-xl font-bold capitalize mb-4 text-gray-900 dark:text-white">
                {modal.type} {modal.type !== "view" && "Confirmation"}
              </h2>

              {modal.type === "view" ? (
                <div className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                  <p>
                    <b>ID:</b> {item.id}
                  </p>
                  <p>
                    <b>Title:</b> {item.title}
                  </p>
                  {item.description && <p>{item.description}</p>}
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Are you sure you want to{" "}
                  <span className="font-bold text-red-500 capitalize">
                    {modal.type}
                  </span>{" "}
                  this item?
                </p>
              )}

              {modal.type !== "view" && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                  >
                    Cancel
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleAction}
                    className={`
                      px-4 py-2 rounded-lg text-white font-semibold
                      ${
                        modal.type === "delete"
                          ? "bg-gradient-to-r from-red-500 to-rose-600"
                          : "bg-gradient-to-r from-blue-500 to-indigo-600"
                      }
                    `}
                  >
                    Confirm
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Actions;
