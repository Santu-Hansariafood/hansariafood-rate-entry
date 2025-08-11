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
    <div className="flex items-center gap-2">
      {[
        { type: "view", icon: Eye, color: "text-green-500 hover:bg-green-100" },
        { type: "edit", icon: Edit, color: "text-blue-500 hover:bg-blue-100" },
        { type: "delete", icon: Trash2, color: "text-red-500 hover:bg-red-100" },
      ].map(({ type, icon: Icon, color }) => (
        <button
          key={type}
          onClick={() => openModal(type)}
          className={`p-2 rounded-full transition-all duration-200 hover:scale-110 hover:shadow-md ${color}`}
          title={type.charAt(0).toUpperCase() + type.slice(1)}
        >
          <Icon size={18} />
        </button>
      ))}

      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fadeIn"
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 relative w-full max-w-md transform transition-all duration-300 animate-scaleUp border border-gray-200 dark:border-gray-700 backdrop-blur-lg"
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition"
            >
              <X size={22} />
            </button>
            <h2 className="text-xl font-semibold capitalize mb-4 text-gray-800 dark:text-white flex items-center gap-2">
              {modal.type}
              {modal.type !== "view" && " Confirmation"}
            </h2>
            {modal.type === "view" ? (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                <p><strong>ID:</strong> {item.id}</p>
                <p><strong>Title:</strong> {item.title}</p>
                {item.description && (
                  <p className="mt-2">{item.description}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to <strong>{modal.type}</strong> this item?
              </p>
            )}
            {modal.type !== "view" && (
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition ${
                    modal.type === "delete"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Actions;
