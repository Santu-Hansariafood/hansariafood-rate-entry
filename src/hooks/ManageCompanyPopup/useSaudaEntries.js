"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { useToday } from "./useToday";

export function useSaudaEntries(company, rateMap, sellers, companyNameToId) {
  const today = useToday();
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(false);
  const normalize = useCallback((s) => s?.trim().toLowerCase() || "", []);

  // Seller name -> id map so persisted sauda rows can be keyed by Seller id.
  const sellerNameToId = useMemo(() => {
    const map = new Map();
    (sellers || []).forEach((seller) => {
      if (seller?.sellerName) map.set(seller.sellerName, seller._id);
    });
    return map;
  }, [sellers]);

  // Id -> seller name map used to render the persisted rows as values.
  const sellerIdToName = useMemo(() => {
    const map = new Map();
    (sellers || []).forEach((seller) => {
      if (seller?._id) map.set(seller._id, seller.sellerName);
    });
    return map;
  }, [sellers]);

  // Id -> company name map used to render the persisted rows as values.
  const companyIdToName = useMemo(() => {
    const map = new Map();
    companyNameToId?.forEach((id, name) => {
      if (id) map.set(id, name);
    });
    return map;
  }, [companyNameToId]);

  // Converts a persisted (name based) sauda row into an id based row used by
  // the UI. Falls back to the raw name when a matching record is not found so
  // that no data is lost.
  const toIdRow = useCallback(
    (entry, newRate) => ({
      tons: entry.tons || "",
      saudaNo: entry.saudaNo || "",
      finalRate: entry.finalRate ?? newRate,
      others: entry.others || "",
      sellerId: sellerNameToId.get(entry.sellerName) ?? entry.sellerName ?? "",
      sellerCompanyId:
        companyNameToId?.get(entry.sellerCompany) ??
        entry.sellerCompany ??
        "",
      deliveryDate: entry.deliveryDate || "",
    }),
    [sellerNameToId, companyNameToId]
  );

  const emptyRow = useCallback(
    (newRate = "") => ({
      tons: "",
      saudaNo: "",
      finalRate: newRate,
      others: "",
      sellerId: "",
      sellerCompanyId: "",
      deliveryDate: "",
    }),
    []
  );

  // Latest mapper kept in a ref so the initial fetch effect runs only when the
  // company/date/rate change, not when the seller/company maps load afterwards.
  const toIdRowRef = useRef(toIdRow);
  toIdRowRef.current = toIdRow;
  const emptyRowRef = useRef(emptyRow);
  emptyRowRef.current = emptyRow;

  useEffect(() => {
    if (!company) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(
          `/save-sauda?company=${company.name}&date=${today}`
        );
        const saved = data?.entry?.saudaEntries ?? {};

        if (!Object.keys(saved).length) {
          toast.info("No previous sauda data, starting fresh.");
        }

        const init = {};
        company.location.forEach((loc) =>
          company.commodities.forEach((comm) => {
            const k = `${loc}-${comm}`;
            const keyNorm = `${normalize(loc)}-${normalize(comm)}`;
            const newRate = rateMap?.[keyNorm]?.newRate ?? "";

            init[k] = saved[k]?.map((entry) => toIdRowRef.current(entry, newRate)) ?? [
              emptyRowRef.current(newRate),
            ];
          })
        );

        mounted && setEntries(init);
      } catch {
        toast.error("Failed to load sauda data");
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [company, today, rateMap, normalize]);

  // Upgrades rows that still hold name based values to their ids once the
  // seller/company maps are available. Purely local: it never refetches and
  // never rewrites rows that already hold ids, so it settles in a single pass.
  useEffect(() => {
    if (!sellerNameToId.size && !companyNameToId?.size) return;

    setEntries((prev) => {
      let changed = false;
      const next = {};

      Object.entries(prev).forEach(([key, list]) => {
        next[key] = (list || []).map((row) => {
          let sellerId = row.sellerId;
          let sellerCompanyId = row.sellerCompanyId;

          if (sellerId && !sellerIdToName.has(sellerId)) {
            const id = sellerNameToId.get(sellerId);
            if (id) {
              sellerId = id;
              changed = true;
            }
          }
          if (sellerCompanyId && !companyIdToName.has(sellerCompanyId)) {
            const id = companyNameToId?.get(sellerCompanyId);
            if (id) {
              sellerCompanyId = id;
              changed = true;
            }
          }

          return sellerId === row.sellerId &&
            sellerCompanyId === row.sellerCompanyId
            ? row
            : { ...row, sellerId, sellerCompanyId };
        });
      });

      return changed ? next : prev;
    });
  }, [sellerNameToId, sellerIdToName, companyIdToName, companyNameToId]);

  const handleChange = useCallback((key, idx, field, val) => {
    setEntries((prev) => {
      const list = [...prev[key]];
      const currentEntry = list[idx];
      if (field === "saudaNo" && currentEntry.saudaNo) {
        return prev;
      }

      list[idx] = { ...currentEntry, [field]: val };
      return { ...prev, [key]: list };
    });
  }, []);

  const addRow = useCallback(
    (key, defaultRate = "") =>
      setEntries((prev) => ({
        ...prev,
        [key]: [...prev[key], emptyRow(defaultRate)],
      })),
    [emptyRow]
  );

  const removeRow = useCallback((key, idx) => {
    setEntries((prev) => {
      const list = [...prev[key]];
      if (list.length > 1) {
        list.splice(idx, 1);
        return { ...prev, [key]: list };
      }
      return prev;
    });
  }, []);

  const totalTons = useCallback(
    (key) => entries[key]?.reduce((s, e) => s + (+e.tons || 0), 0),
    [entries]
  );

  const applyServerEntries = useCallback(
    (key, serverList) => {
      setEntries((prev) => {
        if (!prev[key]) return prev;
        const [loc, comm] = key.split("-");
        const keyNorm = `${normalize(loc)}-${normalize(comm)}`;
        const newRate = rateMap?.[keyNorm]?.newRate ?? "";
        const list = Array.isArray(serverList) ? serverList : [];
        const mapped =
          list.length > 0
            ? list.map((entry) => toIdRow(entry, newRate))
            : [emptyRow(newRate)];
        return { ...prev, [key]: mapped };
      });
    },
    [normalize, rateMap, toIdRow, emptyRow]
  );

  // Resolves the id based rows back to name based rows for display/export.
  const displayEntries = useMemo(() => {
    const resolved = {};
    Object.entries(entries).forEach(([key, list]) => {
      resolved[key] = (list || []).map((entry) => ({
        ...entry,
        sellerName:
          sellerIdToName.get(entry.sellerId) || entry.sellerId || "",
        sellerCompany:
          companyIdToName.get(entry.sellerCompanyId) ||
          entry.sellerCompanyId ||
          "",
      }));
    });
    return resolved;
  }, [entries, sellerIdToName, companyIdToName]);

  return {
    entries,
    displayEntries,
    sellerIdToName,
    companyIdToName,
    handleChange,
    addRow,
    removeRow,
    totalTons,
    applyServerEntries,
    loading,
  };
}
