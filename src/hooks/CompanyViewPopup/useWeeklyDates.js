import { useMemo } from "react";
import { startOfWeek, addDays } from "date-fns";

export default function useWeeklyDates(date = new Date()) {
  return useMemo(() => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [date]);
}
