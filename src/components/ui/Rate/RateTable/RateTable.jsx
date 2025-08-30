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

export default function RateTable({ selectedCompany, onClose, commodity }) {
  const { mobile } = useUser();
  const [rates, setRates] = useState([]);
  const [allRates, setAllRates] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [availableCommodities, setAvailableCommodities] = useState([]);
  const [selectedCommodities, setSelectedCommodities] = useState([]);
  const [isPending, startTransition] = useTransition();

  const allRatesFilled = rates.every((rate) => rate.newRate && rate.newRate.toString().trim());

  const fetchRates = useCallback(async () => {
    try {
      const [{ data: companyData }, { data: locationData }] = await Promise.all(
        [
          axiosInstance.get("/managecompany?limit=1000"),
          axiosInstance.get("/location?limit=1000"),
        ]
      );

      const locationMap = {};
      locationData.locations.forEach((loc) => {
        locationMap[loc.name.trim().toUpperCase()] = loc.state;
      });

      const company = companyData.companies.find(
        (c) => c.name.trim() === selectedCompany.trim()
      );

      if (!company) {
        toast.error("Company not found");
        return;
      }

      const commoditySet = new Set();
      const initialRates = [];

      await Promise.all(
        company.commodities.map(async (cmd) => {
          const { data: cmdRates } = await axiosInstance.get(
            `/rate?company=${encodeURIComponent(
              selectedCompany.trim()
            )}&commodity=${encodeURIComponent(cmd)}`
          );

          commoditySet.add(cmd);

          company.location.forEach((loc) => {
            const cleanLoc = loc.trim();
            const matched = cmdRates.find(
              (r) => r.location.trim() === cleanLoc && r.commodity === cmd
            );

            const mobileMatch = company.mobileNumbers?.find(
              (entry) =>
                entry.location.trim() === cleanLoc && entry.commodity === cmd
            );

            initialRates.push({
              location: cleanLoc,
              state: locationMap[cleanLoc.toUpperCase()] || "Unknown",
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
        })
      );

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
  }, [selectedCompany]);

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
