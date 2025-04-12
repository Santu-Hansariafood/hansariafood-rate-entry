"use client";

import {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useTransition,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";

const RateTableModal = dynamic(
  () => import("./RateTableModal/RateTableModal"),
  { loading: () => <Loading /> }
);

export default function RateTable({ selectedCompany, onClose }) {
  const [rates, setRates] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isPending, startTransition] = useTransition();

  const allRatesFilled = rates.every((rate) => rate.newRate.toString().trim());

  const fetchRates = useCallback(async () => {
    try {
      const [
        { data: companyData },
        { data: existingRates },
        { data: locationData },
      ] = await Promise.all([
        axios.get("/api/managecompany?limit=100"),
        axios.get(
          `/api/rate?company=${encodeURIComponent(selectedCompany.trim())}`
        ),
        axios.get("/api/location?limit=1000"),
      ]);

      const locationMap = {};
      locationData.locations.forEach((loc) => {
        locationMap[loc.name.trim().toUpperCase()] = loc.state;
      });

      const company = companyData.companies.find(
        (c) => c.name.trim() === selectedCompany.trim()
      );

      if (company) {
        const initialRates = company.location.map((location) => {
          const cleanLocation = location.trim();
          const foundRate = existingRates.find(
            (rate) => rate.location.trim() === cleanLocation
          );

          return {
            location: cleanLocation,
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
          };
        });

        const sortedRates = initialRates.sort((a, b) => {
          if (!a.isUpdated && b.isUpdated) return -1;
          if (a.isUpdated && !b.isUpdated) return 1;
          return b.lastUpdated - a.lastUpdated;
        });

        startTransition(() => {
          setRates(sortedRates);
        });
      } else {
        toast.error("Company not found in the database.");
      }
    } catch (error) {
      toast.error("Failed to fetch locations or rates");
      console.error("Error fetching rates:", error);
    }
  }, [selectedCompany]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

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

      await axios.post("/api/rate", {
        company: selectedCompany,
        location: rateToSave.location,
        newRate: parsedRate,
        oldRates: [newOldRate],
      });

      toast.success("Rate updated successfully!");
      setEditIndex(null);

      setRates((prevRates) =>
        prevRates
          .map((rate, idx) =>
            idx === index
              ? {
                  ...rate,
                  oldRate: newOldRate,
                  newRate: parsedRate,
                  isUpdated: true,
                  lastUpdated: new Date(),
                }
              : rate
          )
          .sort((a, b) => {
            if (!a.isUpdated && b.isUpdated) return -1;
            if (a.isUpdated && !b.isUpdated) return 1;
            return b.lastUpdated - a.lastUpdated;
          })
      );
    } catch (error) {
      toast.error("Error updating rate.");
    }
  };

  return (
    <Suspense fallback={<Loading />}>
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
      />
    </Suspense>
  );
}
