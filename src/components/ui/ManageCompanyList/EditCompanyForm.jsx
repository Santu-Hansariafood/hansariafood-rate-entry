"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import useCompany from "@/hooks/Company/useCompany";

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
  const [location, setLocation] = useState(company.location?.[0] || "");
  const [state, setState] = useState(company.state || "");
  const [category, setCategory] = useState(company.category || "");
  const [primaryNumber, setPrimaryNumber] = useState(
    company.mobileNumbers?.[0]?.primaryMobile || ""
  );
  const [secondaryNumber, setSecondaryNumber] = useState(
    company.mobileNumbers?.[0]?.contactPerson || ""
  );
  const [selectedCommodities, setSelectedCommodities] = useState(
    (company.commodities || []).map((cmd) => ({ label: cmd, value: cmd }))
  );
  const [selectedSubCommodities, setSelectedSubCommodities] = useState(
    (company.subCommodities || []).map((sub) => ({ label: sub, value: sub }))
  );
  const [loading, setLoading] = useState(false);

  const handleLocationChange = useCallback(
    (val) => {
      setLocation(val);
      const selectedLocation = locations.find((loc) => loc.name === val);
      setState(selectedLocation?.state || "");
    },
    [locations]
  );

  const handleCompanyChange = useCallback(
    (val) => {
      setCompanyName(val);
      const selectedCompany = companies.find((comp) => comp.name === val);
      setCategory(selectedCompany?.category || "");
    },
    [companies]
  );

  const subCommodityOptions = useMemo(() => {
    const selected = commodities.filter((cmd) =>
      selectedCommodities.map((c) => c.value).includes(cmd.name)
    );
    const subCats = selected.flatMap((cmd) => cmd.subCategories || []);
    const unique = Array.from(new Set(subCats));
    return unique.map((sub) => ({ label: sub, value: sub }));
  }, [commodities, selectedCommodities]);

  const handleCommodityChange = (val) => {
    setSelectedCommodities(val);
    setSelectedSubCommodities([]); // Reset sub-commodities when commodities change
  };

  const handleSubmit = async () => {
    if (!companyName || !location || !primaryNumber) {
      toast.error("Please fill required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: companyName,
        location: [location],
        state,
        category,
        commodities: selectedCommodities.map((c) => c.value),
        subCommodities: selectedSubCommodities.map((s) => s.value),
        mobileNumbers: [
          {
            location,
            primaryMobile: primaryNumber,
            contactPerson: secondaryNumber,
          },
        ],
      };

      await axiosInstance.put(`/managecompany/${company._id}`, payload);
      toast.success("✅ Company updated successfully");
      onUpdated();
      onClose();
    } catch (error) {
      toast.error("❌ Failed to update company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-3xl">
      <Title
        text="Edit Company"
        className="text-xl font-bold mb-4 text-center"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dropdown
          label="Company Name"
          options={companyOptions}
          value={companyName}
          onChange={handleCompanyChange}
        />
        <Dropdown
          label="Location"
          options={locationOptions}
          value={location}
          onChange={handleLocationChange}
        />
        <InputBox label="Category" value={category} readOnly />
        <InputBox label="State" value={state} readOnly />
        <Dropdown
          label="Commodities"
          options={commodityOptions}
          value={selectedCommodities.map((c) => c.value)} // ✅ Extract only values
          onChange={(vals) =>
            setSelectedCommodities(
              vals.map((val) => ({ label: val, value: val }))
            )
          }
          isMulti
        />

        {subCommodityOptions.length > 0 && (
          <Dropdown
            label="Sub-Commodities"
            options={subCommodityOptions}
            value={selectedSubCommodities.map((s) => s.value)} // ✅ Extract only values
            onChange={(vals) =>
              setSelectedSubCommodities(
                vals.map((val) => ({ label: val, value: val }))
              )
            }
            isMulti
          />
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <InputBox
          label="Primary Mobile"
          value={primaryNumber}
          onChange={(e) => setPrimaryNumber(e.target.value)}
        />
        <InputBox
          label="Contact Person Name"
          value={secondaryNumber}
          onChange={(e) => setSecondaryNumber(e.target.value)}
        />
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
  );
}
