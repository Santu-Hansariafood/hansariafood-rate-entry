"use client";

import { useState, useCallback, useMemo, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import useCompany from "@/hooks/Company/useCompany";
import Loading from "@/components/common/Loading/Loading";

const Dropdown = dynamic(() => import("@/components/common/Dropdown/Dropdown"));
const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));
const Button = dynamic(() => import("@/components/common/Button/Button"));
const Title = dynamic(() => import("@/components/common/Title/Title"));

export default function EditCompanyForm({ company, onClose, onUpdated }) {
  const {
    companies,
    locations,
    commodities,
    companyOptions,
    locationOptions,
    commodityOptions,
  } = useCompany();

  const [companyName, setCompanyName] = useState(company.name || "");
  const [category, setCategory] = useState(company.category || "");
  const [state, setState] = useState(company.state || "");
  const [selectedLocations, setSelectedLocations] = useState(
    company.location || []
  );
  const [selectedCommodities, setSelectedCommodities] = useState(
    (company.commodities || []).map((c) => ({ label: c, value: c }))
  );
  const [companyType, setCompanyType] = useState(company.type || []);
  const [isSelfCompany, setIsSelfCompany] = useState(
    Boolean(company.isSelfCompany)
  );
  const [loading, setLoading] = useState(false);

  const updateLocationCommodityContacts = (locs, cmds, prevData = {}) => {
    const updated = {};
    locs.forEach((loc) => {
      updated[loc] = {};
      cmds.forEach((cmd) => {
        updated[loc][cmd.value] = prevData?.[loc]?.[cmd.value] || {
          primaryMobile: "",
          contactPerson: "",
        };
      });
    });
    return updated;
  };

  const [locationCommodityContacts, setLocationCommodityContacts] = useState(
    () => {
      const cmds = (company.commodities || []).map((c) => ({
        label: c,
        value: c,
      }));
      const locs = company.location || [];
      const base = updateLocationCommodityContacts(locs, cmds);

      (company.mobileNumbers || []).forEach((entry) => {
        if (!base[entry.location]) base[entry.location] = {};
        base[entry.location][entry.commodity] = {
          primaryMobile: entry.primaryMobile,
          contactPerson: entry.contactPerson,
        };
      });

      return base;
    }
  );

  useEffect(() => {
    if ((!companyType || companyType.length === 0) && companyName && companies.length > 0) {
      const selectedCompany = companies.find((comp) => comp.name === companyName);
      if (selectedCompany?.type) {
        setCompanyType(selectedCompany.type);
      }
    }
  }, [companyName, companies, companyType]);

  const handleCompanyChange = useCallback(
    (val) => {
      setCompanyName(val);
      const selectedCompany = companies.find((comp) => comp.name === val);
      setCategory(selectedCompany?.category || "");
      setCompanyType(selectedCompany?.type || []);
    },
    [companies]
  );

  const handleLocationChange = (vals) => {
    const newLocations = vals.map((val) => val);
    setSelectedLocations(newLocations);

    const firstLoc = locations.find((loc) => loc.name === newLocations[0]);
    setState(firstLoc?.state || "N.A");

    const updated = updateLocationCommodityContacts(
      newLocations,
      selectedCommodities,
      locationCommodityContacts
    );
    setLocationCommodityContacts(updated);
  };

  const handleCommodityChange = (vals) => {
    const newCommodities = vals.map((val) => ({ label: val, value: val }));
    setSelectedCommodities(newCommodities);

    const updated = updateLocationCommodityContacts(
      selectedLocations,
      newCommodities,
      locationCommodityContacts
    );
    setLocationCommodityContacts(updated);
  };

  const handleContactChange = (location, commodity, field, value) => {
    setLocationCommodityContacts((prev) => ({
      ...prev,
      [location]: {
        ...prev[location],
        [commodity]: {
          ...prev[location][commodity],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async () => {
    if (
      !companyName ||
      selectedLocations.length === 0 ||
      selectedCommodities.length === 0
    ) {
      toast.error("Please fill required fields.");
      return;
    }

    if (!companyType || companyType.length === 0) {
      toast.error("Company Type is missing. Please select a valid company.");
      return;
    }

    const mobileNumbers = [];
    Object.entries(locationCommodityContacts).forEach(
      ([location, commodityMap]) => {
        Object.entries(commodityMap).forEach(([commodity, info]) => {
          if (info.primaryMobile || info.contactPerson) {
            mobileNumbers.push({
              location,
              commodity,
              primaryMobile: info.primaryMobile,
              contactPerson: info.contactPerson,
            });
          }
        });
      }
    );

    setLoading(true);
    try {
      const payload = {
        name: companyName,
        location: selectedLocations,
        state,
        category,
        type: companyType,
        commodities: selectedCommodities.map((c) => c.value),
        mobileNumbers,
        isSelfCompany,
      };

      await axiosInstance.put(`/managecompany/${company._id}`, payload);
      toast.success("Company updated successfully");
      onUpdated?.();
      onClose();
    } catch (error) {
      toast.error("Failed to update company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-2 sm:p-4 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded shadow-md w-full max-w-6xl text-gray-900 dark:text-gray-100">
          <Title
            text="Edit Company"
            className="text-2xl font-bold mb-6 text-center"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Dropdown
              label="Company Name *"
              options={companyOptions}
              value={companyName}
              onChange={handleCompanyChange}
            />
            <Dropdown
              label="Locations *"
              options={locationOptions}
              value={selectedLocations}
              onChange={handleLocationChange}
              isMulti
            />
            <InputBox label="Category" value={category} readOnly />
            <InputBox label="State" value={state} readOnly />
            <div className="flex items-center gap-2 mt-1">
              <input
                id="isSelfCompany"
                type="checkbox"
                className="h-4 w-4"
                checked={isSelfCompany}
                onChange={(e) => setIsSelfCompany(e.target.checked)}
              />
              <label htmlFor="isSelfCompany">Is Self Company</label>
            </div>
            <Dropdown
              label="Commodities *"
              options={commodityOptions}
              value={selectedCommodities.map((c) => c.value)}
              onChange={handleCommodityChange}
              isMulti
            />
          </div>

          <div className="mt-8">
            <Title
              text="Location-wise Contact Details"
              className="text-lg font-semibold mb-2"
            />
            <div className="space-y-6">
              {selectedLocations.map((loc) => (
                <div
                  key={loc}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded border dark:border-gray-600"
                >
                  <h3 className="text-md font-semibold text-blue-700 dark:text-blue-400 mb-2">
                    {loc}
                  </h3>
                  <div className="space-y-3">
                    {selectedCommodities.map((cmd) => (
                      <div
                        key={`${loc}-${cmd.value}`}
                        className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center"
                      >
                        <InputBox
                          label="Commodity"
                          value={cmd.value}
                          readOnly
                        />
                        <InputBox
                          label="Primary Mobile"
                          value={
                            locationCommodityContacts?.[loc]?.[cmd.value]
                              ?.primaryMobile || ""
                          }
                          onChange={(e) =>
                            handleContactChange(
                              loc,
                              cmd.value,
                              "primaryMobile",
                              e.target.value
                            )
                          }
                        />
                        <InputBox
                          label="Contact Person"
                          value={
                            locationCommodityContacts?.[loc]?.[cmd.value]
                              ?.contactPerson || ""
                          }
                          onChange={(e) =>
                            handleContactChange(
                              loc,
                              cmd.value,
                              "contactPerson",
                              e.target.value
                            )
                          }
                        />
                        <InputBox
                          label="Company Type"
                          value={companyType
                            .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
                            .join(", ")}
                          readOnly
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-8 gap-4 flex-wrap">
            <Button
              onClick={handleSubmit}
              text="Update"
              isLoading={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            />
            <Button
              onClick={onClose}
              text="Cancel"
              className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white px-6 py-2"
            />
          </div>
        </div>
      </div>
    </Suspense>
  );
}
