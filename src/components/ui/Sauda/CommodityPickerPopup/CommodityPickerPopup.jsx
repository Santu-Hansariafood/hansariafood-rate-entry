"use client";

import { Suspense, useState } from "react";
import { X, XCircle, CheckCircle } from "lucide-react";
import Loading from "@/components/common/Loading/Loading";

export default function CommodityPickerPopup({
  options = [],
  onCancel,
  onDone,
}) {
  const [checked, setChecked] = useState(() => new Set(options));

  const toggle = (c) =>
    setChecked((s) => {
      const next = new Set(s);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

  return (
    <Suspense fallback={<Loading />}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="relative w-[22rem] rounded-lg bg-white dark:bg-gray-900 p-6 shadow-lg transition-colors">
          <button
            aria-label="Close"
            onClick={onCancel}
            className="absolute right-3 top-2 rounded-full p-1 text-gray-500 dark:text-gray-300 hover:text-red-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Select commodities
          </h2>
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {options.map((c) => (
              <label
                key={c}
                className="flex cursor-pointer items-center gap-2 text-gray-800 dark:text-gray-200"
              >
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
              className="flex items-center gap-1 rounded bg-gray-200 dark:bg-gray-700 px-3 py-1 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <XCircle className="h-4 w-4" /> Cancel
            </button>

            <button
              onClick={() => onDone([...checked])}
              disabled={checked.size === 0}
              className="flex items-center gap-1 rounded bg-green-600 px-4 py-1 text-sm text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle className="h-4 w-4" /> Continue
            </button>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
