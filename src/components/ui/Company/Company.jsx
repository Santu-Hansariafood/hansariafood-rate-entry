"use client";

import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/common/Loading/Loading";

const Dropdown = dynamic(() => import("@/components/common/Dropdown/Dropdown"));
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Button = dynamic(() => import("@/components/common/Button/Button"));

export default function CreateCompany() {
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes, locationRes] = await Promise.all([
          axios.get("/api/companies"),
          axios.get("/api/location"),
        ]);
        setCompanies(companyRes.data || []);
        setLocations(locationRes.data.locations || []);
      } catch (error) {
        toast.error("Failed to fetch data");
      }
    };

    fetchData();
  }, []);

  const handleCompanyChange = (val) => {
    setCompanyName(val);
    const selectedCompany = companies.find((comp) => comp.name === val);
    setCategory(selectedCompany ? selectedCompany.category : "");
  };

  const handleLocationChange = (val) => {
    setLocation(val);
    const selectedLocation = locations.find((loc) => loc.name === val);
    setState(selectedLocation ? selectedLocation.state : "");
  };

  const handleSubmit = async () => {
    if (!companyName.trim() || !location || !category) {
      toast.error("All fields are required!");
      return;
    }

    if (!state) {
      toast.error("State is missing. Please select a valid location.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/managecompany", {
        name: companyName,
        category,
        location,
        state,
      });

      if (response.status === 201) {
        toast.success("Company created successfully!");
        setCompanyName("");
        setLocation("");
        setState("");
        setCategory("");
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
              options={companies.map((comp) => ({
                label: comp.name,
                value: comp.name,
              }))}
              value={companyName}
              onChange={handleCompanyChange}
            />

            <div>
              <label className="block text-gray-700 font-semibold">
                Category
              </label>
              <input
                type="text"
                value={category}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>

            <Dropdown
              label="Location"
              options={locations.map((loc) => ({
                label: loc.name,
                value: loc.name,
              }))}
              value={location}
              onChange={handleLocationChange}
            />

            <div>
              <label className="block text-gray-700 font-semibold">State</label>
              <input
                type="text"
                value={state}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>
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
