import { useMemo, useCallback } from "react";

function parseOldRate(s) {
  if (!s) return { rate: null, date: null };
  const ratePart = String(s).split(" ")[0];
  const rateNum = Number(ratePart.replace(/[^0-9.\-]/g, ""));
  const dateMatch = s.match(/\(([^)]+)\)/);
  const dateStr = dateMatch ? dateMatch[1] : null;
  return { rate: isNaN(rateNum) ? null : rateNum, date: dateStr };
}

export default function useRateAnalysis({
  allRates,
  scopedRates,
  companies,
  selectedCompany,
  selectedCommodity,
  selectedLocation,
  searchTerm,
  filterType,
}) {
  const getCompanyStats = useCallback(() => {
    const now = new Date();
    const byCompany = {};
    for (const r of allRates) {
      let lastDate = r.lastUpdated ? new Date(r.lastUpdated) : null;
      if (!lastDate) {
        const lastOld = (r.oldRates || []).at(-1);
        if (lastOld) {
          const m = /\(([^)]+)\)/.exec(lastOld);
          if (m) {
            const [dd, mm, yyyy] = m[1].split("/");
            lastDate = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
          }
        }
      }
      const diffDays = lastDate
        ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))
        : null;
      const latestRate =
        r.hasNewRateToday && r.newRate !== ""
          ? Number(r.newRate)
          : (() => {
              const lastOld = (r.oldRates || []).at(-1);
              return lastOld ? Number(String(lastOld).split(" ")[0]) : null;
            })();
      const existing = byCompany[r.company] || {
        latestRate: null,
        freshnessDays: null,
      };
      const pick = (a, b) => (a == null ? b : b == null ? a : Math.max(a, b));
      byCompany[r.company] = {
        latestRate: pick(existing.latestRate, latestRate),
        freshnessDays:
          existing.freshnessDays == null
            ? diffDays
            : Math.min(existing.freshnessDays, diffDays ?? Infinity),
      };
    }
    return byCompany;
  }, [allRates]);

  const companyStats = useMemo(() => getCompanyStats(), [getCompanyStats]);

  const getFilteredCompanies = useCallback(() => {
    const term = (searchTerm || "").trim().toLowerCase();
    const filterLower = (filterType || "").toLowerCase();

    const list = companies.filter((company) => {
      const types = Array.isArray(company.type)
        ? company.type
        : company.type
        ? [company.type]
        : [];

      const matchesType =
        filterLower === "all" ||
        types.some(
          (t) => (t || "").toString().toLowerCase() === filterLower
        );

      const matchesSearch =
        term === "" || (company.name || "").toLowerCase().includes(term);

      const stats = companyStats[company.name];
      const hasRates =
        stats && (stats.latestRate != null || stats.freshnessDays != null);

      return matchesType && matchesSearch && hasRates;
    });
    const score = (c) => {
      const stats = companyStats[c.name] || {};
      const freshness = stats.freshnessDays;
      let freshnessScore = 1;
      if (freshness != null) {
        if (freshness <= 3) freshnessScore = 2;
        else if (freshness > 7) freshnessScore = 0;
      }
      return { freshnessScore, latestRate: stats.latestRate ?? -Infinity };
    };
    return list.slice().sort((a, b) => {
      const sa = score(a);
      const sb = score(b);
      if (sb.freshnessScore !== sa.freshnessScore)
        return sb.freshnessScore - sa.freshnessScore;
      return (sb.latestRate || -Infinity) - (sa.latestRate || -Infinity);
    });
  }, [companies, searchTerm, filterType, companyStats]);

  const filteredCompanies = useMemo(
    () => getFilteredCompanies(),
    [getFilteredCompanies]
  );

  const getTopRatesByCommodity = useCallback(() => {
    const now = new Date();
    const grouped = {};
    if (!Array.isArray(allRates)) return {};

    for (const r of allRates) {
      if (!r || !r.commodity) continue;

      const commodity = r.commodity || "N.A";
      const lastDate = r.lastUpdated ? new Date(r.lastUpdated) : null;
      let freshnessDays = null;
      if (lastDate)
        freshnessDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
      const old = Array.isArray(r.oldRates) ? r.oldRates : [];
      const lastOldParsed =
        old.length > 0
          ? parseOldRate(old[old.length - 1])
          : { rate: null, date: null };
      const prevOldParsed =
        old.length > 1
          ? parseOldRate(old[old.length - 2])
          : { rate: null, date: null };
      const latest =
        r.hasNewRateToday && r.newRate !== ""
          ? Number(r.newRate)
          : lastOldParsed.rate;
      const previous = r.hasNewRateToday
        ? lastOldParsed.rate
        : prevOldParsed.rate;
      let changeAbs = null;
      let changePct = null;
      if (
        typeof latest === "number" &&
        typeof previous === "number" &&
        previous !== 0
      ) {
        changeAbs = latest - previous;
        changePct = (changeAbs / previous) * 100;
      }
      if (!grouped[commodity]) grouped[commodity] = [];
      grouped[commodity].push({
        company: r.company,
        commodity,
        latestRate: latest,
        freshnessDays,
        changeAbs,
        changePct,
      });
    }
    const sorted = {};
    Object.entries(grouped).forEach(([com, items]) => {
      const validItems = items
        .filter((i) => i.latestRate != null)
        .sort((a, b) => {
          const fa = a.freshnessDays;
          const fb = b.freshnessDays;
          const sa = fa == null ? 1 : fa <= 3 ? 2 : fa > 7 ? 0 : 1;
          const sb = fb == null ? 1 : fb <= 3 ? 2 : fb > 7 ? 0 : 1;
          if (sb !== sa) return sb - sa;
          return (b.latestRate ?? -Infinity) - (a.latestRate ?? -Infinity);
        })
        .slice(0, 5);
      
      if (validItems.length > 0) {
        sorted[com] = validItems;
      }
    });
    return sorted;
  }, [allRates]);

  const topRatesByCommodity = useMemo(
    () => getTopRatesByCommodity(),
    [getTopRatesByCommodity]
  );

  const getAvailableCommodities = useCallback(() => {
    if (!selectedCompany) return [];
    const companyData = companies.find(
      (company) => company.name === selectedCompany
    );
    if (companyData && Array.isArray(companyData.commodities))
      return companyData.commodities;
    return Array.from(
      new Set(
        scopedRates
          .filter((d) => d.company === selectedCompany)
          .map((d) => d.commodity)
      )
    );
  }, [companies, selectedCompany, scopedRates]);

  const availableCommodities = useMemo(
    () => getAvailableCommodities(),
    [getAvailableCommodities]
  );

  const getAvailableLocations = useCallback(() => {
    if (!selectedCompany) return [];
    const companyData = companies.find(
      (company) => company.name === selectedCompany
    );
    if (companyData && Array.isArray(companyData.location))
      return companyData.location;
    return Array.from(
      new Set(
        scopedRates
          .filter(
            (d) =>
              d.company === selectedCompany &&
              (!selectedCommodity || d.commodity === selectedCommodity)
          )
          .map((d) => d.location)
      )
    );
  }, [companies, selectedCompany, selectedCommodity, scopedRates]);

  const availableLocations = useMemo(
    () => getAvailableLocations(),
    [getAvailableLocations]
  );

  const selectedEntry = useMemo(() => {
    return scopedRates.find(
      (d) =>
        d.company === selectedCompany &&
        d.commodity === selectedCommodity &&
        d.location === selectedLocation
    );
  }, [scopedRates, selectedCompany, selectedCommodity, selectedLocation]);

  const getAnalysis = useCallback(() => {
    if (!selectedEntry) return null;
    const old = Array.isArray(selectedEntry.oldRates)
      ? selectedEntry.oldRates
      : [];
    const lastOld =
      old.length > 0
        ? parseOldRate(old[old.length - 1])
        : { rate: null, date: null };
    const prevOld =
      old.length > 1
        ? parseOldRate(old[old.length - 2])
        : { rate: null, date: null };
    const hasNewToday = !!selectedEntry.hasNewRateToday;
    const latestRate =
      hasNewToday && selectedEntry.newRate !== ""
        ? Number(selectedEntry.newRate)
        : lastOld.rate;
    const previousRate = hasNewToday ? lastOld.rate : prevOld.rate;
    let changeAbs = null;
    let changePct = null;
    if (
      typeof latestRate === "number" &&
      typeof previousRate === "number" &&
      previousRate !== 0
    ) {
      changeAbs = latestRate - previousRate;
      changePct = (changeAbs / previousRate) * 100;
    }
    const lastUpdated = selectedEntry.lastUpdated
      ? new Date(selectedEntry.lastUpdated)
      : null;
    return {
      latestRate: typeof latestRate === "number" ? latestRate : null,
      previousRate: typeof previousRate === "number" ? previousRate : null,
      changeAbs,
      changePct,
      hasNewToday,
      lastUpdated,
      quantity: selectedEntry.quantity ?? "",
      updatesCount: old.length + (hasNewToday ? 1 : 0),
    };
  }, [selectedEntry]);

  const analysis = useMemo(() => getAnalysis(), [getAnalysis]);

  const getDateWiseRates = useCallback(() => {
    if (!selectedEntry) return [];
    const rows = [];
    if (selectedEntry.hasNewRateToday && selectedEntry.newRate !== "") {
      const d = selectedEntry.lastUpdated
        ? new Date(selectedEntry.lastUpdated)
        : new Date();
      rows.push({
        date: d,
        rate: Number(selectedEntry.newRate),
        type: "New",
        quantity: selectedEntry.quantity ?? "",
        mobile: selectedEntry.mobile ?? "",
      });
    }
    const old = Array.isArray(selectedEntry.oldRates)
      ? selectedEntry.oldRates
      : [];
    old.forEach((s) => {
      const parsed = parseOldRate(s);
      if (parsed.rate && parsed.date) {
        const [dd, mm, yyyy] = parsed.date.split("/");
        const iso = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
        rows.push({
          date: iso,
          rate: parsed.rate,
          type: "Old",
          quantity: "",
          mobile: "",
        });
      }
    });
    rows.sort((a, b) => b.date - a.date);
    return rows;
  }, [selectedEntry]);

  const dateWiseRates = useMemo(() => getDateWiseRates(), [getDateWiseRates]);

  return {
    companyStats,
    filteredCompanies,
    topRatesByCommodity,
    availableCommodities,
    availableLocations,
    selectedEntry,
    analysis,
    dateWiseRates,
  };
}
