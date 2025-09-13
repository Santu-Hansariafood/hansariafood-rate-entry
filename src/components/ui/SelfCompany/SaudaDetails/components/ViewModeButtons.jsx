import React from "react";

const ViewModeButtons = ({ viewMode, onViewModeChange }) => {
  const modes = [
    { key: "purchase", label: "Purchase", color: "green" },
    { key: "sales", label: "Sales", color: "yellow" },
    { key: "combined", label: "Combined", color: "blue" },
  ];

  return (
    <div className="flex items-center gap-2 ml-auto">
      {modes.map((mode) => (
        <button
          key={mode.key}
          type="button"
          onClick={() => onViewModeChange(mode.key)}
          className={`text-xs px-3 py-1 rounded border ${
            viewMode === mode.key
              ? `bg-${mode.color}-600 text-white border-${mode.color}-700`
              : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
};

export default ViewModeButtons;
