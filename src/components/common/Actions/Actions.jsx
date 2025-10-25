"use client";
import React, { useState } from "react";
import { Eye, Edit, Trash2, X } from "lucide-react";

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

  return (
    <div className="flex items-center gap-3">
      {[
        {
          type: "view",
          icon: Eye,
          color: "from-green-400 to-emerald-500 hover:shadow-green-400/40",
        },
        {
          type: "edit",
          icon: Edit,
          color: "from-blue-400 to-indigo-500 hover:shadow-blue-400/40",
        },
        {
          type: "delete",
          icon: Trash2,
          color: "from-red-400 to-rose-500 hover:shadow-red-400/40",
        },
      ].map(({ type, icon: Icon, color }) => (
        <button
          key={type}
          onClick={() => openModal(type)}
          className={`p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg bg-gradient-to-br ${color} text-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-transparent`}
          title={type.charAt(0).toUpperCase() + type.slice(1)}
        >
          <Icon size={18} className="drop-shadow-sm" />
        </button>
      ))}

      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fadeIn"
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md transform transition-all duration-500 animate-scaleUp rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(315deg, rgba(255,255,255,0.1) 25%, transparent 25%)",
              backgroundSize: "20px 20px",
            }}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition transform hover:rotate-90 duration-300"
            >
              <X size={22} />
            </button>

            {/* Modal Content */}
            <div className="p-6">
              <h2 className="text-xl font-semibold capitalize mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                {modal.type}
                {modal.type !== "view" && " Confirmation"}
              </h2>

              {modal.type === "view" ? (
                <div className="bg-gray-50/60 dark:bg-gray-800/60 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 backdrop-blur-md shadow-inner">
                  <p>
                    <strong>ID:</strong> {item.id}
                  </p>
                  <p>
                    <strong>Title:</strong> {item.title}
                  </p>
                  {item.description && (
                    <p className="mt-2 line-clamp-3">{item.description}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to{" "}
                  <strong className="capitalize text-red-500 dark:text-red-400">
                    {modal.type}
                  </strong>{" "}
                  this item?
                </p>
              )}

              {modal.type !== "view" && (
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg bg-gray-200/70 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAction}
                    className={`px-4 py-2 rounded-lg text-white font-medium shadow-md transition-transform duration-300 hover:scale-105 ${
                      modal.type === "delete"
                        ? "bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-red-400/40"
                        : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-blue-400/40"
                    }`}
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Actions;
