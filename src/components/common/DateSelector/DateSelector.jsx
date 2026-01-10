"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import holidays from "@/data/holiday.json";

export default function DateSelector({
  value,
  onChange,
  label = "Select Date",
}) {
  const today = new Date();

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(value ? new Date(value) : new Date());
  const [view, setView] = useState("date");

  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const formatDate = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const isToday = (y, m, d) =>
    today.getFullYear() === y &&
    today.getMonth() === m &&
    today.getDate() === d;

  const getHoliday = (y, m, d) => {
    const date = formatDate(y, m, d);
    return holidays.find((h) => h.date === date);
  };

  const isSunday = (y, m, d) => new Date(y, m, d).getDay() === 0;

  const isFutureDate = (y, m, d) => {
    const check = new Date(y, m, d);
    check.setHours(0, 0, 0, 0);
    const t = new Date(today);
    t.setHours(0, 0, 0, 0);
    return check > t;
  };

  const selectDate = (d) => {
    if (isFutureDate(year, month, d)) return;
    const selected = formatDate(year, month, d);
    onChange(selected);
    setOpen(false);
    setView("date");
  };

  const changeMonth = (dir) => {
    setCurrent(new Date(year, month + dir, 1));
  };

  const changeYear = (dir) => {
    setCurrent(new Date(year + dir, month, 1));
  };

  return (
    <div className="relative w-full">
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((p) => !p)}
        className="
          w-full flex items-center gap-3 cursor-pointer
          bg-white dark:bg-gray-900
          border border-gray-300 dark:border-gray-700
          rounded-xl px-4 py-3 shadow-sm
          hover:border-emerald-500
          transition-all
        "
      >
        <Calendar
          className="text-emerald-600 dark:text-emerald-400"
          size={22}
        />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="ml-auto text-sm text-gray-900 dark:text-white">
          {value || "YYYY-MM-DD"}
        </span>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="
              absolute z-30 mt-2 w-full
              bg-white dark:bg-gray-900
              border border-gray-300 dark:border-gray-700
              rounded-2xl shadow-xl p-4
            "
          >
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() =>
                  view === "year"
                    ? changeYear(-12)
                    : view === "month"
                    ? changeYear(-1)
                    : changeMonth(-1)
                }
              >
                <ChevronLeft size={18} />
              </button>

              <span
                onClick={() =>
                  setView(
                    view === "date"
                      ? "month"
                      : view === "month"
                      ? "year"
                      : "date"
                  )
                }
                className="font-semibold text-sm cursor-pointer hover:text-emerald-600"
              >
                {current.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </span>

              <button
                onClick={() =>
                  view === "year"
                    ? changeYear(12)
                    : view === "month"
                    ? changeYear(1)
                    : changeMonth(1)
                }
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {view === "date" && (
              <>
                <div className="grid grid-cols-7 text-xs text-center mb-2 text-gray-500">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-sm">
                  {[...Array(firstDay)].map((_, i) => (
                    <div key={`e-${i}`} />
                  ))}

                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;

                    const todayFlag = isToday(year, month, day);
                    const holidayObj = getHoliday(year, month, day);
                    const sunday = isSunday(year, month, day);
                    const future = isFutureDate(year, month, day);

                    const isRedDay = holidayObj || sunday;

                    return (
                      <button
                        key={day}
                        title={
                          holidayObj ? holidayObj.name : sunday ? "Sunday" : ""
                        }
                        onClick={() => selectDate(day)}
                        className={`
                          py-1.5 rounded-lg transition text-center
                          ${future ? "cursor-not-allowed opacity-60" : ""}
                          ${
                            isRedDay
                              ? "bg-red-100 text-red-600 hover:bg-red-200"
                              : todayFlag
                              ? "bg-emerald-100 text-emerald-700"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }
                        `}
                      >
                        <div>{day}</div>
                        {holidayObj && (
                          <div className="text-[9px] leading-3 truncate">
                            {holidayObj.name}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {view === "month" && (
              <div className="grid grid-cols-3 gap-2 text-sm">
                {Array.from({ length: 12 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrent(new Date(year, i, 1));
                      setView("date");
                    }}
                    className="py-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-gray-800"
                  >
                    {new Date(0, i).toLocaleString("default", {
                      month: "short",
                    })}
                  </button>
                ))}
              </div>
            )}

            {view === "year" && (
              <div className="grid grid-cols-3 gap-2 text-sm">
                {Array.from({ length: 12 }).map((_, i) => {
                  const y = year - 6 + i;
                  return (
                    <button
                      key={y}
                      onClick={() => {
                        setCurrent(new Date(y, month, 1));
                        setView("month");
                      }}
                      className="py-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-gray-800"
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex gap-4 text-xs mt-3">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-red-400 rounded-sm" /> Holiday /
                Sunday
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-emerald-400 rounded-sm" /> Today
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-gray-300 rounded-sm" /> Future
                Disabled
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
