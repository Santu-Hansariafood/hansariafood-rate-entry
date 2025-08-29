"use client";

export default function KPIItem({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
      <div className="text-slate-500 text-sm mb-1 dark:text-slate-400">
        {label}
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value}
      </div>
      {sub ? (
        <div className="text-xs mt-1 text-slate-500 dark:text-slate-400">
          {sub}
        </div>
      ) : null}
    </div>
  );
}
