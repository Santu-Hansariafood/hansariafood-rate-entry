"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "@/components/common/Dropdown/Dropdown";
import Title from "@/components/common/Title/Title";
import Button from "@/components/common/Button/Button";

export default function CreateCompany() {
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes, locationRes, categoryRes] = await Promise.all([
          axios.get("/api/companies"),
          axios.get("/api/location"),
          axios.get("/api/categories"),
        ]);
        setCompanies(companyRes.data || []);
        setLocations(locationRes.data.locations || []);
        setCategories(categoryRes.data.categories || []);
      } catch (error) {
        toast.error("Failed to fetch data");
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!companyName.trim() || !location || !category) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/managecompany", {
        name: companyName,
        location,
        category,
      });

      if (response.status === 201) {
        toast.success("Company created successfully!");
        setCompanyName("");
        setLocation("");
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
    <div className="flex flex-col items-center justify-center p-6 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-3xl flex flex-col space-y-8">
        <Title
          text="Create Company"
          className="text-center text-2xl font-bold text-gray-800"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Dropdown
            label="Company Name"
            options={companies.map((comp) => ({
              label: comp.name,
              value: comp.name,
            }))}
            value={companyName} // Ensure value is passed
            onChange={(val) => setCompanyName(val)} // Use direct value instead of event
          />

          <Dropdown
            label="Location"
            options={locations.map((loc) => ({
              label: loc.name,
              value: loc.name,
            }))}
            value={location}
            onChange={(val) => setLocation(val)} // Fix event handling
          />

          <Dropdown
            label="Category"
            options={categories.map((cat) => ({
              label: cat.name,
              value: cat.name,
            }))}
            value={category}
            onChange={(val) => setCategory(val)}
          />
        </div>
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            text="Save"
            isLoading={loading}
            className="w-48 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-300"
          />
        </div>
      </div>
    </div>
  );
}
