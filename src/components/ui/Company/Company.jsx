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
  const [location, setLocation] = useState("");
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

  const handleSubmit = async () => {
    if (!companyName.trim() || !location) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/managecompany", {
        name: companyName,
        location,
      });

      if (response.status === 201) {
        toast.success("Company created successfully!");
        setCompanyName("");
        setLocation("");
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
              onChange={(val) => setCompanyName(val)}
            />

            <Dropdown
              label="Location"
              options={locations.map((loc) => ({
                label: loc.name,
                value: loc.name,
              }))}
              value={location}
              onChange={(val) => setLocation(val)}
            />
          </div>
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              text="Save"
              isLoading={loading}
              className="w-40 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-300"
            />
          </div>
        </div>
      </div>
    </Suspense>
  );
}
