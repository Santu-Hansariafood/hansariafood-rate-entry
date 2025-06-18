"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function CommodityPickerPopup({ options = [], onCancel, onDone }) {
  const [checked, setChecked] = useState(() => new Set(options));

  const toggle = (c) => {
    setChecked((s) => {
      const copy = new Set(s);
      copy.has(c) ? copy.delete(c) : copy.add(c);
      return copy;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-[22rem] rounded-lg bg-white p-6 shadow-lg">
        <button aria-label="Close" onClick={onCancel}
                className="absolute right-3 top-2 rounded-full p-1 text-gray-500 hover:text-red-500">
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-lg font-semibold">Select commodities</h2>
        <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
          {options.map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-green-600"
                checked={checked.has(c)}
                onChange={() => toggle(c)}
              />
              {c}
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onDone([...checked])}
            className="rounded bg-green-600 px-4 py-1 text-sm text-white hover:bg-green-700 disabled:opacity-50"
            disabled={checked.size === 0}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
