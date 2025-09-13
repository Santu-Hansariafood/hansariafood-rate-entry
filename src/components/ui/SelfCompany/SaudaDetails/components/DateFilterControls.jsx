import React from "react";

const DateFilterControls = ({ startDate, endDate, onStartDateChange, onEndDateChange, onClear }) => {
  return (
    <div className="flex flex-wrap items-end gap-3 sticky top-0 bg-gray-50 dark:bg-gray-800/50 py-2 z-10">
      <div className="flex flex-col">
        <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">From</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">To</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1"
        />
      </div>
      {(startDate || endDate) && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs px-3 py-1 rounded bg-red-200 dark:bg-red-700 text-gray-800 dark:text-gray-200"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default DateFilterControls;
