"use client";

import { useState, useCallback, Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Loading from "@/components/common/Loading/Loading";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import useCompany from "@/hooks/Company/useCompany";

const Dropdown = dynamic(
  () => import("@/components/common/Dropdown/Dropdown"),
  { loading: () => <Loading /> }
);
const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading />,
});
const Button = dynamic(() => import("@/components/common/Button/Button"), {
  loading: () => <Loading />,
});
const InputBox = dynamic(
  () => import("@/components/common/InputBox/InputBox"),
  { loading: () => <Loading /> }
);

export default function CreateCompany() {
  const {
    companies,
    locations,
    commodities,
    companyOptions,
    locationOptions,
    commodityOptions,
  } = useCompany();

  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [category, setCategory] = useState("");
  const [primaryNumber, setPrimaryNumber] = useState("");
  const [secondaryNumber, setSecondaryNumber] = useState("");
  const [selectedCommodities, setSelectedCommodities] = useState([]);
const [selectedSubCommodities, setSelectedSubCommodities] = useState([]);
const [loading, setLoading] = useState(false);

  const handleLocationChange = useCallback(
    (val) => {
      setLocation(val);
      const selectedLocation = locations.find((loc) => loc.name === val);
      setState(selectedLocation?.state || "");
    },
    [locations]
  );

  const subCommodityOptions = useMemo(() => {
    const selected = commodities.filter((cmd) =>
      selectedCommodities.includes(cmd.name)
    );
  
    const subCats = selected.flatMap((cmd) => cmd.subCategories || []);
    const unique = Array.from(new Set(subCats));
    return unique.map((sub) => ({ label: sub, value: sub }));
  }, [commodities, selectedCommodities]);
  
  const handleCompanyChange = useCallback(
    (val) => {
      setCompanyName(val);
      const selectedCompany = companies.find((comp) => comp.name === val);
      setCategory(selectedCompany?.category || "");
    },
    [companies]
  );

  const resetForm = () => {
    setCompanyName("");
    setLocation("");
    setState("");
    setCategory("");
    setPrimaryNumber("");
    setSecondaryNumber("");
    setSelectedCommodities([]);
  };

  const handleSubmit = async () => {
    if (!companyName.trim() || !location || !primaryNumber.trim()) {
      toast.error("Company name, location, and primary number are required!");
      return;
    }

    if (!state) {
      toast.error("State is missing. Please select a valid location.");
      return;
    }

    if (selectedCommodities.length === 0) {
      toast.error("Please select at least one commodity.");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/managecompany", {
        name: companyName,
        location,
        state: state || "N.A",
        category: category || "N.A",
        commodities: selectedCommodities,
        subCommodities: selectedSubCommodities,
        mobileNumbers: [
          {
            location: location,
            primaryMobile: primaryNumber,
            secondaryMobile: secondaryNumber || "",
          },
        ],
      });

      if (response.status === 201) {
        toast.success("Company created successfully!");
        resetForm();
      } else if (response.status === 200) {
        toast.info(response.data.message || "Company already exists!");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl space-y-6">
          <Title
            text="Manage Company"
            className="text-center text-2xl font-bold text-gray-800"
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

            <InputBox label="State" value={state} readOnly />
            <InputBox label="Category" value={category} readOnly />

            <InputBox
              label="Enter Mobile Number"
              value={primaryNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 10) {
                  setPrimaryNumber(value);
                }
              }}
              type="tel"
              placeholder="Enter Mobile Number"
              maxLength={10}
            />

            <InputBox
              label="Enter Contact Person Name"
              value={secondaryNumber}
              onChange={(e) => setSecondaryNumber(e.target.value)}
              type="text"
              placeholder="Enter Contact Person Name"
            />

            <Dropdown
              label="Select Commodities"
              options={commodityOptions}
              value={selectedCommodities}
              onChange={(vals) => setSelectedCommodities(vals)}
              // isMulti={true}
            />
            <Dropdown
  label="Select Sub Commodities"
  options={subCommodityOptions}
  value={selectedSubCommodities}
  onChange={(vals) => setSelectedSubCommodities(vals)}
  isMulti={true}
/>

          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              text="Save"
              isLoading={loading}
              className="w-40 py-3 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition duration-300"
            />
          </div>
        </div>
      </div>
    </Suspense>
  );
}
