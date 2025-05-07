"use client";

import { useState, useCallback, Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Loading from "@/components/common/Loading/Loading";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import useCompany from "@/hooks/Company/useCompany";

const Dropdown = dynamic(() => import("@/components/common/Dropdown/Dropdown"), {
  loading: () => <Loading />,
});
const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading />,
});
const Button = dynamic(() => import("@/components/common/Button/Button"), {
  loading: () => <Loading />,
});
const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"), {
  loading: () => <Loading />,
});

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
  const [selectedCommodities, setSelectedCommodities] = useState([]);
  const [selectedSubCommodities, setSelectedSubCommodities] = useState([]);
  const [commodityContacts, setCommodityContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const isDataReady = useMemo(
    () =>
      companyOptions.length > 0 &&
      locationOptions.length > 0 &&
      commodityOptions.length > 0,
    [companyOptions, locationOptions, commodityOptions]
  );

  const handleLocationChange = useCallback(
    (val) => {
      const value = typeof val === "object" ? val.value : val;
      setLocation(value);
      const selectedLocation = locations.find((loc) => loc.name === value);
      setState(selectedLocation?.state || "");
    },
    [locations]
  );

  const handleCompanyChange = useCallback(
    (val) => {
      const value = typeof val === "object" ? val.value : val;
      setCompanyName(value);
      const selectedCompany = companies.find((comp) => comp.name === value);
      setCategory(selectedCompany?.category || "");
    },
    [companies]
  );

  const handleCommodityChange = (vals) => {
    if (!vals) {
      setSelectedCommodities([]);
      setCommodityContacts([]);
      return;
    }

    const validVals = vals.map((v) => ({
      label: typeof v.label === "string" ? v.label : String(v.value),
      value: v.value,
    }));

    setSelectedCommodities(validVals);

    setCommodityContacts((prev) => {
      const newContacts = validVals.map((commodity) => {
        const existing = prev.find((c) => c.commodity === commodity.value);
        return (
          existing || {
            commodity: commodity.value,
            primaryMobile: "",
            secondaryMobile: "",
          }
        );
      });
      return newContacts;
    });
  };

  const handleContactChange = (commodityName, field, value) => {
    setCommodityContacts((prev) =>
      prev.map((contact) =>
        contact.commodity === commodityName
          ? { ...contact, [field]: value }
          : contact
      )
    );
  };

  const subCommodityOptions = useMemo(() => {
    const selected = commodities.filter((cmd) =>
      selectedCommodities.some((sel) => sel.value === cmd.name)
    );
    const subCats = selected.flatMap((cmd) => cmd.subCategories || []);
    const unique = Array.from(new Set(subCats));
    return unique.map((sub) => ({ label: sub, value: sub }));
  }, [commodities, selectedCommodities]);

  const resetForm = () => {
    setCompanyName("");
    setLocation("");
    setState("");
    setCategory("");
    setSelectedCommodities([]);
    setSelectedSubCommodities([]);
    setCommodityContacts([]);
  };

  const handleSubmit = async () => {
    if (!companyName.trim() || !location) {
      toast.error("Company name and location are required!");
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

    const missingContacts = commodityContacts.find(
      (contact) => !contact.primaryMobile.trim()
    );
    if (missingContacts) {
      toast.error("Please enter primary mobile number for all commodities.");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/managecompany", {
        name: companyName.trim(),
        category: category || "N.A",
        commodities: selectedCommodities.map((cmd) => ({
          name: cmd.value,
        })),
        subCommodities: selectedSubCommodities.map((sub) => sub.value),
        locations: [
          {
            location: location.trim(),
            state: state || "N.A",
            mobileNumbers: commodityContacts.map(
              (contact) => contact.primaryMobile
            ),
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
              value={
                typeof companyName === "object"
                  ? companyName.value
                  : companyName
              }
              onChange={handleCompanyChange}
              isDisabled={!isDataReady}
            />

            <Dropdown
              label="Location"
              options={locationOptions}
              value={typeof location === "object" ? location.value : location}
              onChange={handleLocationChange}
              isDisabled={!isDataReady}
            />

            <InputBox label="State" value={state} readOnly />
            <InputBox label="Category" value={category} readOnly />

            <Dropdown
              label="Select Commodities"
              options={commodityOptions}
              value={selectedCommodities}
              onChange={handleCommodityChange}
              isMulti={true}
              isDisabled={!isDataReady}
              placeholder="Select commodities..."
              isClearable={true}
            />

            <Dropdown
              label="Select Sub Commodities"
              options={subCommodityOptions}
              value={selectedSubCommodities}
              onChange={(vals) => setSelectedSubCommodities(vals || [])}
              isMulti={true}
              isDisabled={!isDataReady || selectedCommodities.length === 0}
              placeholder="Select sub-commodities..."
              isClearable={true}
            />
          </div>

          {selectedCommodities.map((commodity) => {
            const value = typeof commodity === "object" ? commodity.value : commodity;
            const label =
              typeof commodity === "object"
                ? typeof commodity.label === "string"
                  ? commodity.label
                  : String(commodity.value)
                : String(commodity);
            const contact = commodityContacts.find((c) => c.commodity === value);

            return (
              <div
                key={`commodity-${value}`}
                className="col-span-2 bg-gray-100 p-4 rounded-lg"
              >
                <h3 className="font-semibold mb-3 text-gray-800">
                  {label} Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputBox
                    label={`${label} Mobile Number`}
                    value={contact?.primaryMobile || ""}
                    onChange={(e) => {
                      const mobile = e.target.value.replace(/\D/g, "");
                      if (mobile.length <= 10) {
                        handleContactChange(value, "primaryMobile", mobile);
                      }
                    }}
                    type="tel"
                    placeholder="Enter Mobile Number"
                    maxLength={10}
                  />
                  <InputBox
                    label={`${label} Contact Person`}
                    value={contact?.secondaryMobile || ""}
                    onChange={(e) =>
                      handleContactChange(value, "secondaryMobile", e.target.value)
                    }
                    type="text"
                    placeholder="Enter Contact Person Name"
                  />
                </div>
              </div>
            );
          })}

          <div className="flex justify-center pt-4">
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
