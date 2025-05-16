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
        const initialRates = company.location.map((location) => {
          const cleanLocation = location.trim();

          const foundRate = existingRates.find(
            (rate) => 
              rate.location.trim() === cleanLocation && 
              rate.commodity === commodity
          );

          const matchedMobile = company.mobileNumbers?.find(
            (entry) =>
              entry.location.trim() === cleanLocation &&
              entry.commodity === commodity
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
            primaryMobile: matchedMobile?.primaryMobile || "N/A",
            contactPerson: matchedMobile?.contactPerson || "N/A",
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
  }, [selectedCompany, commodity]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  useEffect(() => {
    if (commodity) {
      console.log("Commodity received in RateTable:", commodity);
    }
  }, [commodity]);

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
        commodity,
      });

      toast.success("Rate updated successfully!");
      setEditIndex(null);

      await fetchRates();
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
        commodity={commodity}
      />
    </Suspense>
  );
}
