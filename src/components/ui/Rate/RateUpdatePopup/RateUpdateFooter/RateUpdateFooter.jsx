"use client";

const RateUpdateFooter = ({ onCancel, onSave, saving }) => {
  return (
    <div
      className="sticky bottom-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 px-6 py-4 
                 bg-gray-100 dark:bg-gray-900 
                 border-t border-gray-300 dark:border-gray-700 z-10"
    >
      <button
        onClick={onCancel}
        className="w-full sm:w-auto px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 
                   text-gray-700 dark:text-gray-200 hover:bg-gray-300 
                   dark:hover:bg-gray-600 transition"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="w-full sm:w-auto px-5 py-2 rounded-lg bg-blue-600 dark:bg-indigo-600 
                   text-white font-medium shadow-md hover:scale-105 
                   hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
};

export default RateUpdateFooter;
