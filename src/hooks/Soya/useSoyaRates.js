"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { useSocket } from "@/context/SocketContext";

const COMMODITIES = [
  "SBM 46%",
  "SBM 47%",
  "SBM 48%",
  "SBM 49%",
  "SBM 50%",
  "SBM 51%",
];

const Diff = ({ value }) => {
  if (value === 0 || value === null || value === undefined) return null;

  return (
    <span
      className={`ml-1 text-xs font-semibold ${
        value > 0 ? "text-green-600" : "text-red-600"
      }`}
    >
      ({value > 0 ? `+${value}` : value})
    </span>
  );
};

const renderRateWithTemps = ({ oldRate, tempRates, finalRate }) => {
  if (!finalRate && (!tempRates || tempRates.length === 0)) return "-";

  const prevDay = oldRate || 0;
  let lastRate = finalRate ?? prevDay;

  return (
    <div className="space-y-1">
      {finalRate !== null && finalRate !== undefined && (
        <div className="font-semibold text-gray-900 flex items-center">
          <span>{finalRate}</span>
          <Diff value={finalRate - prevDay} />
        </div>
      )}

      {tempRates?.length > 0 && (
        <div className="space-y-0.5">
          {tempRates.map((t, i) => {
            const diff = t.rate - lastRate;
            lastRate = t.rate;

            return (
              <div
                key={i}
                className="text-xs text-gray-600 flex items-center gap-1"
              >
                <span>{t.rate}</span>
                <Diff value={diff} />
                <span className="text-[10px] text-gray-400">{t.time}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const buildRateText = ({ oldRate, tempRates, finalRate }) => {
  if (!finalRate && (!tempRates || tempRates.length === 0)) return "-";

  let prev = oldRate || 0;
  const parts = [];

  if (finalRate !== null && finalRate !== undefined) {
    const diff = finalRate - prev;
    parts.push(
      diff === 0
        ? `${finalRate}`
        : `${finalRate} (${diff > 0 ? "+" : ""}${diff})`
    );
    prev = finalRate;
  }

  if (tempRates?.length) {
    tempRates.forEach((t) => {
      const diff = t.rate - prev;
      parts.push(
        `${t.rate} (${diff > 0 ? "+" : ""}${diff}) @ ${t.time}`
      );
      prev = t.rate;
    });
  }

  return parts.join(" | ");
};

export default function useSoyaRates(date, search) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastFetchedDateRef = useRef(null);
  const socket = useSocket();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const companyRes = await axiosInstance.get("/soyacompany");
      const companies = companyRes.data?.companies || [];

      const tableRows = [];

      for (const company of companies) {
        const rateRes = await axiosInstance.get(
          `/ratehistory/${company._id}?date=${date}`
        );

        const history = rateRes.data || [];
        const locationMap = {};

        history.forEach((r) => {
          if (!locationMap[r.location]) locationMap[r.location] = {};
          locationMap[r.location][r.commodity] = {
            ...r,
            newRate: r.newRate ?? r.finalRate,
          };
        });

        Object.entries(locationMap).forEach(([location, rates]) => {
          const row = { company: company.name, location };
          let hasAnyRate = false;

          COMMODITIES.forEach((c) => {
            const rateObj = rates[c];

            if (rateObj?.newRate || rateObj?.tempRates?.length) {
              hasAnyRate = true;

              const jsxValue = renderRateWithTemps({
                oldRate: rateObj.oldRate,
                tempRates: rateObj.tempRates,
                finalRate: rateObj.newRate,
              });

              const textValue = buildRateText({
                oldRate: rateObj.oldRate,
                tempRates: rateObj.tempRates,
                finalRate: rateObj.newRate,
              });

              row[c] = jsxValue;
              row[`${c}__text`] = textValue;
            } else {
              row[c] = "-";
              row[`${c}__text`] = "-";
            }
          });

          if (hasAnyRate) tableRows.push(row);
        });
      }

      setRows(tableRows);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Soya rates");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchData();

    if (!socket) return;

    const handleNotification = (payload) => {
      if (payload.type === 'rate') {
        fetchData();
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [fetchData, socket]);

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    return rows.filter(
      (r) =>
        r.company.toLowerCase().includes(search.toLowerCase()) ||
        r.location.toLowerCase().includes(search.toLowerCase())
    );
  }, [rows, search]);

  return {
    loading,
    rows: filteredRows,
    rawRows: rows,
    commodities: COMMODITIES,
  };
}
