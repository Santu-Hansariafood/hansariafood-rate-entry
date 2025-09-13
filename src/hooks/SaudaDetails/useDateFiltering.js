import { useMemo } from "react";

export const useDateFiltering = (data, startDate, endDate) => {
  const orderedDays = useMemo(() => {
    const monthMap = {
      jan: 0,
      january: 0,
      feb: 1,
      february: 1,
      mar: 2,
      march: 2,
      apr: 3,
      april: 3,
      may: 4,
      jun: 5,
      june: 5,
      jul: 6,
      july: 6,
      aug: 7,
      august: 7,
      sep: 8,
      sept: 8,
      september: 8,
      oct: 9,
      october: 9,
      nov: 10,
      november: 10,
      dec: 11,
      december: 11,
    };

    const toTimestamp = (value) => {
      const s = String(value).trim();
      if (!s) return -Infinity;
      const native = Date.parse(s);
      if (!Number.isNaN(native)) return native;
      
      let m = /^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})$/.exec(s);
      if (m) {
        const yyyy = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10) - 1;
        const dd = parseInt(m[3], 10);
        return new Date(yyyy, mm, dd).getTime();
      }
      
      m = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/.exec(s);
      if (m) {
        const dd = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10) - 1;
        const yyyy = parseInt(m[3].length === 2 ? `20${m[3]}` : m[3], 10);
        return new Date(yyyy, mm, dd).getTime();
      }
      
      m = /^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{2,4})$/.exec(s);
      if (m) {
        const dd = parseInt(m[1], 10);
        const mon = monthMap[m[2].toLowerCase()];
        const yyyy = parseInt(m[3].length === 2 ? `20${m[3]}` : m[3], 10);
        if (mon !== undefined) return new Date(yyyy, mon, dd).getTime();
      }
      
      m = /^([A-Za-z]{3,})\s+(\d{1,2}),?\s+(\d{2,4})$/.exec(s);
      if (m) {
        const mon = monthMap[m[1].toLowerCase()];
        const dd = parseInt(m[2], 10);
        const yyyy = parseInt(m[3].length === 2 ? `20${m[3]}` : m[3], 10);
        if (mon !== undefined) return new Date(yyyy, mon, dd).getTime();
      }

      return -Infinity;
    };

    const startTs = startDate ? toTimestamp(startDate) : -Infinity;
    const endTs = endDate ? toTimestamp(endDate) : Infinity;

    const withinRange = (d) => {
      const ts = toTimestamp(d.date);
      return ts >= startTs && ts <= endTs;
    };

    const filtered = data.filter(withinRange);
    return [...filtered].sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date));
  }, [data, startDate, endDate]);

  return { orderedDays };
};
