"use client";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import useRateTaken from "@/hooks/RateTaken/useRateTaken";
import Loading from "@/components/common/Loading/Loading";
import { Suspense } from "react";

const categoryChipClass = (active) =>
  [
    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
    active
      ? "border-transparent bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25"
      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-300",
  ].join(" ");

const companyChipClass = (status) =>
  status === "taken"
    ? "group inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-md hover:shadow-emerald-500/10 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/20"
    : "group inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-100 hover:shadow-md hover:shadow-sky-500/10 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:border-sky-500/40 dark:hover:bg-sky-500/20";

export default function RateTakenSection() {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    tracker,
    takenCompanies,
    pendingCompanies,
    totalCompanies,
    takenCount,
    pendingCount,
    progress,
    loadingCompanies,
    loadingCategories,
    loadingTaken,
    savingIds,
    companiesError,
    categoriesError,
    statusError,
    actionsDisabled,
    fetchCompanies,
    fetchCategories,
    reloadStatus,
    toggleTaken,
  } = useRateTaken();

  return (
    <Suspense fallback={<Loading />}>
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/70 dark:shadow-black/40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-400/30 to-violet-500/20 blur-3xl dark:from-indigo-500/20 dark:to-violet-600/10"
      />

      <div className="relative p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <ClipboardList size={21} />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Rate Taken
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track the companies you have taken rates for today
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <CalendarDays
                size={14}
                className="text-indigo-500 dark:text-indigo-400"
              />
              {tracker.date
                ? new Date(`${tracker.date}T00:00:00.000Z`).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "UTC",
                    }
                  )
                : "—"}
            </span>
            <button
              type="button"
              onClick={fetchCompanies}
              disabled={loadingCompanies}
              aria-label="Refresh companies"
              className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-indigo-500/40 dark:hover:text-indigo-300"
            >
              <RefreshCw
                size={16}
                className={
                  loadingCompanies
                    ? "animate-spin"
                    : "transition group-hover:rotate-90"
                }
              />
            </button>
          </div>
        </div>

        {companiesError ? (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle size={16} className="shrink-0" />
            <p className="flex-1">{companiesError}</p>
            <button
              type="button"
              onClick={fetchCompanies}
              className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : loadingCompanies || loadingTaken ? (
          <Loading />
        ) : (
          <>
            {statusError && (
              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                <AlertCircle size={16} className="shrink-0" />
                <p className="flex-1">{statusError}</p>
                <button
                  type="button"
                  onClick={reloadStatus}
                  className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Daily progress
                </p>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {progress}%
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {takenCount}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  of {totalCompanies} companies taken
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Category
                </p>
                {selectedCategory && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("")}
                    className="text-[11px] font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="scrollbar-hidden flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("")}
                  className={categoryChipClass(selectedCategory === "")}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => setSelectedCategory(category.name)}
                    className={categoryChipClass(
                      selectedCategory.trim().toLowerCase() ===
                        category.name.trim().toLowerCase()
                    )}
                  >
                    {category.name}
                  </button>
                ))}
                {loadingCategories && (
                  <span className="inline-flex items-center gap-2 px-2 py-1.5 text-xs text-slate-400 dark:text-slate-500">
                    <Loader2 size={13} className="animate-spin" />
                    Loading categories...
                  </span>
                )}
              </div>
              {categoriesError && (
                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  <AlertCircle size={15} className="shrink-0" />
                  <p className="flex-1">{categoriesError}</p>
                  <button
                    type="button"
                    onClick={fetchCategories}
                    className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {totalCompanies === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-400 dark:border-white/10 dark:text-slate-500">
                No companies found
                {selectedCategory ? ` for “${selectedCategory}”` : ""}.
              </div>
            ) : (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <span className="h-2 w-2 rounded-full bg-sky-500" />
                      Rates to Take
                    </h3>
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                      {pendingCount}
                    </span>
                  </div>
                  {pendingCount ? (
                    <div className="flex flex-wrap gap-2">
                      {pendingCompanies.map((company) => {
                        const isSaving = savingIds.includes(company._id);
                        return (
                          <button
                            key={company._id}
                            type="button"
                            onClick={() => toggleTaken(company._id)}
                            disabled={actionsDisabled || isSaving}
                            className={companyChipClass("pending")}
                          >
                            {isSaving ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Plus
                                size={13}
                                className="opacity-60 transition group-hover:opacity-100"
                              />
                            )}
                            {company.name}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      All companies are marked as taken.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Rate Taken
                    </h3>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                      {takenCount}
                    </span>
                  </div>
                  {takenCount ? (
                    <div className="flex flex-wrap gap-2">
                      {takenCompanies.map((company) => {
                        const isSaving = savingIds.includes(company._id);
                        return (
                          <button
                            key={company._id}
                            type="button"
                            onClick={() => toggleTaken(company._id)}
                            disabled={actionsDisabled || isSaving}
                            title="Click to move this company back to Rates to Take"
                            className={companyChipClass("taken")}
                          >
                            {isSaving ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={13} />
                            )}
                            {company.name}
                            <RotateCcw
                              size={12}
                              className="opacity-40 transition group-hover:opacity-80"
                            />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      No companies marked yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
    </Suspense>
  );
}
