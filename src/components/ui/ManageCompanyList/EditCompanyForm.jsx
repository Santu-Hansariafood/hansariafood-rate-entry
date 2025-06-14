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
    (company.commodities || []).map((cmd) => ({ label: cmd, value: cmd }))
  );
  const [selectedSubCommodities, setSelectedSubCommodities] = useState(
    (company.subCommodities || []).map((sub) => ({ label: sub, value: sub }))
  );

  useEffect(() => {
    if (!category && company.name) {
      const selectedCompany = companies.find(
        (comp) => comp.name === company.name
      );
      setCategory(selectedCompany?.category || "");
    }
  }, [companies, company.name, category]);

  const updateLocationCommodityContacts = (locs, cmds, prevData) => {
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
      const data = updateLocationCommodityContacts(
        company.location || [],
        (company.commodities || []).map((cmd) => ({ label: cmd, value: cmd }))
      );

      company.mobileNumbers?.forEach((item) => {
        if (!data[item.location]) data[item.location] = {};
        data[item.location][item.commodity] = {
          primaryMobile: item.primaryMobile,
          contactPerson: item.contactPerson,
        };
      });

      return data;
    }
  );

  const [loading, setLoading] = useState(false);

  const handleCompanyChange = useCallback(
    (val) => {
      setCompanyName(val);
      const selectedCompany = companies.find((comp) => comp.name === val);
      setCategory(selectedCompany?.category || "");
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
    setSelectedSubCommodities([]);
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

  const handleRemoveCommodity = (location, commodity) => {
    setLocationCommodityContacts((prev) => {
      const updatedLoc = { ...prev[location] };
      delete updatedLoc[commodity];
      return { ...prev, [location]: updatedLoc };
    });
  };

  const subCommodityOptions = useMemo(() => {
    const selected = commodities.filter((cmd) =>
      selectedCommodities.map((c) => c.value).includes(cmd.name)
    );
    const subCats = selected.flatMap((cmd) => cmd.subCategories || []);
    const unique = Array.from(new Set(subCats));
    return unique.map((sub) => ({ label: sub, value: sub }));
  }, [commodities, selectedCommodities]);

  const memoCompanyOptions = useMemo(() => companyOptions, [companyOptions]);
  const memoLocationOptions = useMemo(() => locationOptions, [locationOptions]);
  const memoCommodityOptions = useMemo(
    () => commodityOptions,
    [commodityOptions]
  );

  const handleSubmit = async () => {
    if (
      !companyName ||
      selectedLocations.length === 0 ||
      selectedCommodities.length === 0
    ) {
      toast.error("Please fill required fields.");
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
        commodities: selectedCommodities.map((c) => c.value),
        subCommodities: selectedSubCommodities.map((s) => s.value),
        mobileNumbers,
      };

      await axiosInstance.put(`/managecompany/${company._id}`, payload);
      toast.success("Company updated successfully");
      onUpdated();
      onClose();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="bg-white p-6 rounded shadow-md w-full max-w-4xl">
        <Title
          text="Edit Company"
          className="text-xl font-bold mb-4 text-center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dropdown
            label="Company Name *"
            options={memoCompanyOptions}
            value={companyName}
            onChange={handleCompanyChange}
          />
          <Dropdown
            label="Locations *"
            options={memoLocationOptions}
            value={selectedLocations}
            onChange={handleLocationChange}
            isMulti
          />
          <InputBox label="Category" value={category} readOnly />
          <InputBox label="State" value={state} readOnly />
          <Dropdown
            label="Commodities *"
            options={memoCommodityOptions}
            value={selectedCommodities.map((c) => c.value)}
            onChange={(vals) => handleCommodityChange(vals)}
            isMulti
          />
          {subCommodityOptions.length > 0 && (
            <Dropdown
              label="Sub-Commodities"
              options={subCommodityOptions}
              value={selectedSubCommodities.map((s) => s.value)}
              onChange={(vals) =>
                setSelectedSubCommodities(
                  vals.map((val) => ({ label: val, value: val }))
                )
              }
              isMulti
            />
          )}
        </div>

        <div className="mt-6">
          <Title
            text="Location-wise Contact Details"
            className="text-lg font-semibold mb-2"
          />
          <div className="space-y-6">
            {selectedLocations.map((loc) => (
              <div key={loc} className="bg-gray-50 p-4 rounded border">
                <h3 className="text-md font-semibold text-blue-700 mb-2">
                  {loc}
                </h3>

                <div className="space-y-3 mb-4">
                  {Object.entries(locationCommodityContacts[loc] || {}).map(
                    ([cmdName, contactInfo]) => (
                      <div
                        key={`${loc}-${cmdName}`}
                        className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center"
                      >
                        <InputBox label="Commodity" value={cmdName} readOnly />
                        <InputBox
                          label="Primary Mobile"
                          value={contactInfo.primaryMobile}
                          onChange={(e) =>
                            handleContactChange(
                              loc,
                              cmdName,
                              "primaryMobile",
                              e.target.value
                            )
                          }
                        />
                        <InputBox
                          label="Contact Person"
                          value={contactInfo.contactPerson}
                          onChange={(e) =>
                            handleContactChange(
                              loc,
                              cmdName,
                              "contactPerson",
                              e.target.value
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCommodity(loc, cmdName)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}
                </div>

                <div className="flex gap-4 items-end">
                  <Dropdown
                    label="Add Commodity"
                    options={memoCommodityOptions.filter(
                      (opt) => !locationCommodityContacts[loc]?.[opt.value]
                    )}
                    onChange={(val) => {
                      if (!val) return;
                      setLocationCommodityContacts((prev) => ({
                        ...prev,
                        [loc]: {
                          ...prev[loc],
                          [val]: {
                            primaryMobile: "",
                            contactPerson: "",
                          },
                        },
                      }));
                    }}
                    placeholder="Select Commodity to Add"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-6 gap-4">
          <Button
            onClick={handleSubmit}
            text="Update"
            isLoading={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <Button
            onClick={onClose}
            text="Cancel"
            className="bg-gray-300 hover:bg-gray-400 text-black"
          />
        </div>
      </div>
    </Suspense>
  );
}
