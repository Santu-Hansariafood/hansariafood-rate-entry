"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import dynamic from "next/dynamic";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/common/Loading/Loading";

const Dropdown = dynamic(
  () => import("@/components/common/Dropdown/Dropdown"),
  {
    loading: () => <Loading />,
  }
);
const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading />,
});
const Button = dynamic(() => import("@/components/common/Button/Button"), {
  loading: () => <Loading />,
});
const InputBox = dynamic(
  () => import("@/components/common/InputBox/InputBox"),
  {
    loading: () => <Loading />,
  }
);

export default function CreateCompany() {
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [category, setCategory] = useState("");
  const [primaryNumber, setPrimaryNumber] = useState("");
  const [secondaryNumber, setSecondaryNumber] = useState("");
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllCompanies = async () => {
      let allCompanies = [];
      let page = 1;
      let hasMore = true;

      try {
        while (hasMore) {
          const response = await axiosInstance.get(`/companies?page=${page}`);
          const data = Array.isArray(response.data)
            ? response.data
            : response.data.companies || [];

          if (data.length > 0) {
            allCompanies = [...allCompanies, ...data];
            page++;
          } else {
            hasMore = false;
          }
        }

        setCompanies(allCompanies);
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error("Failed to fetch companies");
      }
    };

    const fetchAllLocations = async () => {
      let allLocations = [];
      let page = 1;
      let hasMore = true;

      try {
        while (hasMore) {
          const response = await axiosInstance.get(`/location?page=${page}`);
          const data = Array.isArray(response.data)
            ? response.data
            : response.data.locations || [];

          if (data.length > 0) {
            allLocations = [...allLocations, ...data];
            page++;
          } else {
            hasMore = false;
          }
        }

        setLocations(allLocations);
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast.error("Failed to fetch locations");
      }
    };

    fetchAllCompanies();
    fetchAllLocations();
  }, []);

  const companyOptions = useMemo(
    () =>
      Array.isArray(companies)
        ? companies.map((comp) => ({
            label: comp.name,
            value: comp.name,
          }))
        : [],
    [companies]
  );

  const locationOptions = useMemo(
    () =>
      Array.isArray(locations)
        ? locations.map((loc) => ({
            label: loc.name,
            value: loc.name,
          }))
        : [],
    [locations]
  );

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

  const handleSubmit = async () => {
    if (!companyName.trim() || !location || !primaryNumber.trim()) {
      toast.error("Company name, location, and primary number are required!");
      return;
    }

    if (!state) {
      toast.error("State is missing. Please select a valid location.");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/managecompany", {
        name: companyName,
        location,
        state: state || "N.A",
        category: category || "N.A",
        mobileNumbers: [
          {
            location: location,
            primaryMobile: primaryNumber, // ✅ corrected key
            secondaryMobile: secondaryNumber || "", // ✅ corrected key
          },
        ],
      });

      if (response.status === 201) {
        toast.success("Company created successfully!");
        setCompanyName("");
        setLocation("");
        setState("");
        setCategory("");
        setPrimaryNumber("");
        setSecondaryNumber("");
      } else if (response.status === 200) {
        toast.info(response.data.message);
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
            text="Create Company"
            className="text-center text-2xl font-bold text-gray-800"
          />
          <div className="space-y-4">
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
              label="Primary Mobile Number"
              value={primaryNumber}
              onChange={(e) => setPrimaryNumber(e.target.value)}
              type="tel"
              placeholder="e.g. 9876543210"
            />

            <InputBox
              label="Secondary Mobile Number"
              value={secondaryNumber}
              onChange={(e) => setSecondaryNumber(e.target.value)}
              type="tel"
              placeholder="Optional"
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
