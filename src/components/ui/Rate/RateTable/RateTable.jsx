"use client";

import {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useTransition,
} from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";
import { useUser } from "@/context/UserContext";

const RateTableModal = dynamic(
  () => import("./RateTableModal/RateTableModal"),
  { loading: () => <Loading /> }
);

export default function RateTable({
  selectedCompany,
  onClose,
  selectedCompanyObj,
  commodity,
}) {
  const { mobile } = useUser();
  const [rates, setRates] = useState([]);
  const [allRates, setAllRates] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [availableCommodities, setAvailableCommodities] = useState([]);
  const [selectedCommodities, setSelectedCommodities] = useState([]);
  const [isPending, startTransition] = useTransition();

  const allRatesFilled = rates.every(
    (rate) => rate.newRate && rate.newRate.toString().trim()
  );

  const fetchRates = useCallback(async () => {
    if (!selectedCompany) return;

    try {
      const { data } = await axiosInstance.get("/managecompany", {
        params: {
          search: selectedCompany.trim(),
          type: "buyer",
        },
      });

      const list = Array.isArray(data?.companies) ? data.companies : [];
      const normalizedName = selectedCompany.trim().toLowerCase();

      let companies = list.filter(
        (c) =>
          c.name && c.name.trim().toLowerCase() === normalizedName
      );

      if (!companies.length && selectedCompanyObj) {
        companies = [selectedCompanyObj];
      }

      if (!companies.length) {
        toast.error("Company not found");
        return;
      }

      const { data: allCompanyRates } = await axiosInstance.get(
        `/rate?company=${encodeURIComponent(
          selectedCompany.trim()
        )}&commodity=all`
      );

      const rateMap = new Map();
      (Array.isArray(allCompanyRates) ? allCompanyRates : []).forEach((r) => {
        if (!r || !r.location || !r.commodity) return;
        const key = `${r.location.trim()}|||${r.commodity}`;
        rateMap.set(key, r);
      });

      const commoditySet = new Set();
      const initialRates = [];

      companies.forEach((company) => {
        const companyLocations = Array.isArray(company.location)
          ? company.location
          : [];
        const companyCommodities = Array.isArray(company.commodities)
          ? company.commodities
          : [];
        const companyMobiles = Array.isArray(company.mobileNumbers)
          ? company.mobileNumbers
          : [];

        companyCommodities.forEach((cmd) => {
          commoditySet.add(cmd);

          companyLocations.forEach((loc) => {
            const cleanLoc =
              typeof loc === "string"
                ? loc.trim()
                : (loc?.name || "").toString().trim();

            if (!cleanLoc) return;

            const rowState =
              typeof loc === "string"
                ? company.state || "Unknown"
                : loc?.state || company.state || "Unknown";

            const key = `${cleanLoc}|||${cmd}`;
            const matched = rateMap.get(key);

            const mobileMatch = companyMobiles.find(
              (entry) =>
                entry.location &&
                entry.location.trim() === cleanLoc &&
                entry.commodity === cmd
            );

            initialRates.push({
              location: cleanLoc,
              state: rowState,
              commodity: cmd,
              oldRate: matched?.oldRates?.at(-1) || "—",
              newRate: matched?.newRate ?? "",
              quantity: matched?.quantity ?? "",
              payment: matched?.payment ?? "",
              others: matched?.others ?? "",
              isUpdated: !!matched?.newRate,
              lastUpdated: matched?.lastUpdated
                ? new Date(matched.lastUpdated)
                : null,
              primaryMobile: mobileMatch?.primaryMobile || "N/A",
              contactPerson: mobileMatch?.contactPerson || "N/A",
            });
          });
        });
      });

      const sortedRates = initialRates.sort((a, b) => {
        if (!a.isUpdated && b.isUpdated) return -1;
        if (a.isUpdated && !b.isUpdated) return 1;
        return (b.lastUpdated || 0) - (a.lastUpdated || 0);
      });

      startTransition(() => {
        setAllRates(sortedRates);
        setRates(sortedRates);
        setAvailableCommodities([...commoditySet]);
      });
    } catch (err) {
      toast.error("Failed to fetch rates");
      console.error("fetchRates error:", err);
    }
  }, [selectedCompany, selectedCompanyObj]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  useEffect(() => {
    if (selectedCommodities.length === 0) {
      setRates(allRates);
    } else {
      const filtered = allRates.filter((rate) =>
        selectedCommodities.includes(rate.commodity)
      );
      setRates(filtered);
    }
  }, [selectedCommodities, allRates]);

  const handleEdit = (index) => setEditIndex(index);

  const handleSave = async (index) => {
    const rateToSave = rates[index];
    const parsedRate = parseFloat(rateToSave.newRate);

    if (!rateToSave.newRate || isNaN(parsedRate)) {
      toast.error("Enter a valid rate.");
      return;
    }

    try {
      await axiosInstance.post("/rate", {
        company: selectedCompany,
        location: rateToSave.location,
        newRate: parsedRate,
        mobile,
        commodity: rateToSave.commodity,
        quantity: rateToSave.quantity || 0,
        payment: rateToSave.payment || 0,
        others: rateToSave.others || "",
      });

      toast.success("Rate saved!");
      setEditIndex(null);
      // Trigger notification update
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("rates-updated"));
      }
      await fetchRates();
    } catch (error) {
      toast.error("Save failed.");
      console.error("Error saving rate:", error);
    }
  };

  const toggleCommodity = (cmd) => {
    setSelectedCommodities((prev) =>
      prev.includes(cmd) ? prev.filter((c) => c !== cmd) : [...prev, cmd]
    );
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="px-4 py-2 bg-white rounded-t-md border-b">
        <h4 className="font-semibold text-gray-700 mb-2">
          Filter by Commodity:
        </h4>
        <div className="flex flex-wrap gap-3">
          {availableCommodities.map((cmd) => (
            <label key={cmd} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={selectedCommodities.includes(cmd)}
                onChange={() => toggleCommodity(cmd)}
              />
              <span>{cmd}</span>
            </label>
          ))}
        </div>
      </div>

      <RateTableModal
        selectedCompany={selectedCompany}
        onClose={onClose}
        rates={rates}
        allRatesFilled={allRatesFilled}
        editIndex={editIndex}
        handleEdit={handleEdit}
        handleSave={handleSave}
        setRates={setRates}
        actualStartIndex={0}
        commodity={commodity}
        selectedCommodities={selectedCommodities}
        availableCommodities={availableCommodities}
        onCommodityToggle={toggleCommodity}
      />
    </Suspense>
  );
}
