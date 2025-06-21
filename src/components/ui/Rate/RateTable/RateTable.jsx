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
  const [allRates, setAllRates] = useState([]); // ✅ Full unfiltered list
  const [editIndex, setEditIndex] = useState(null);
  const [availableCommodities, setAvailableCommodities] = useState([]); // ✅ Checkbox list
  const [selectedCommodities, setSelectedCommodities] = useState([]); // ✅ Checked items
  const [isPending, startTransition] = useTransition();

  const allRatesFilled = rates.every((rate) => rate.newRate.toString().trim());

  const fetchRates = useCallback(async () => {
    try {
      const [
        { data: companyData },
        { data: existingRates },
        { data: locationData },
      ] = await Promise.all([
        axiosInstance.get("/managecompany?limit=100"),
        axiosInstance.get(
          `/rate?company=${encodeURIComponent(
            selectedCompany.trim()
          )}&commodity=${encodeURIComponent(commodity)}`
        ),
        axiosInstance.get("/location?limit=1000"),
      ]);

      const locationMap = {};
      locationData.locations.forEach((loc) => {
        locationMap[loc.name.trim().toUpperCase()] = loc.state;
      });

      const company = companyData.companies.find(
        (c) => c.name.trim() === selectedCompany.trim()
      );

      if (company) {
        const initialRates = [];
        const commoditySet = new Set();

        company.commodities.forEach((cmd) => {
          commoditySet.add(cmd);
          company.location.forEach((location) => {
            const cleanLocation = location.trim();
            const foundRate = existingRates.find(
              (rate) =>
                rate.location.trim() === cleanLocation && rate.commodity === cmd
            );
            const matchedMobile = company.mobileNumbers?.find(
              (entry) =>
                entry.location.trim() === cleanLocation &&
                entry.commodity === cmd
            );
            initialRates.push({
              location: cleanLocation,
              commodity: cmd,
              state: locationMap[cleanLocation.toUpperCase()] || "Unknown",
              oldRate: foundRate?.oldRates?.at(-1) || "—",
              newRate: foundRate?.newRate ?? "",
              isUpdated: !!foundRate?.newRate,
              lastUpdated: foundRate?.oldRates?.at(-1)
                ? new Date(
                    foundRate.oldRates[foundRate.oldRates.length - 1]
                      .split("(")[1]
                      .split(")")[0]
                  )
                : null,
              primaryMobile: matchedMobile?.primaryMobile || "N/A",
              contactPerson: matchedMobile?.contactPerson || "N/A",
            });
          });
        });

        const sortedRates = initialRates.sort((a, b) => {
          if (!a.isUpdated && b.isUpdated) return -1;
          if (a.isUpdated && !b.isUpdated) return 1;
          return b.lastUpdated - a.lastUpdated;
        });

        startTransition(() => {
          setAllRates(sortedRates); // ✅ store full list
          setRates(sortedRates); // ✅ default show all
          setAvailableCommodities([...commoditySet]); // ✅ get unique commodities
        });
      } else {
        toast.error("Company not found in the database.");
      }
    } catch (error) {
      toast.error("Failed to fetch locations or rates");
      console.error("Error fetching rates:", error);
    }
  }, [selectedCompany, commodity]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  useEffect(() => {
    // ✅ Filter rates based on selected commodities
    if (selectedCommodities.length === 0) {
      setRates(allRates); // no filters
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
      toast.error("Please enter a valid numeric rate.");
      return;
    }

    try {
      const newOldRate = `${parsedRate} (${new Date().toLocaleDateString(
        "en-GB"
      )})`;

      await axiosInstance.post("/rate", {
        company: selectedCompany,
        location: rateToSave.location,
        newRate: parsedRate,
        oldRates: [newOldRate],
        mobile,
        commodity: rateToSave.commodity,
      });

      toast.success("Rate updated successfully!");
      setEditIndex(null);

      await fetchRates();
    } catch (error) {
      toast.error("Error updating rate.");
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
