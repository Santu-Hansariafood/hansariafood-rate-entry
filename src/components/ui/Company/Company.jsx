"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InputBox from "@/components/common/InputBox/InputBox";
import Dropdown from "@/components/common/Dropdown/Dropdown";
import Title from "@/components/common/Title/Title";
import Button from "@/components/common/Button/Button";

export default function CreateCompany() {
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationRes, categoryRes] = await Promise.all([
          axios.get("/api/location"),
          axios.get("/api/categories"),
        ]);
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
      const response = await axios.post("/api/company", {
        name: companyName,
        location,
        category,
      });

      if (response.status === 201) {
        toast.success("Company created successfully!");
        setCompanyName("");
        setLocation("");
        setCategory("");
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
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <Title text="Create Company" />
        <InputBox
          label="Company Name"
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter company name"
        />
        <Dropdown
          label="Location"
          options={locations.map((loc) => ({
            label: loc.name,
            value: loc.name,
          }))}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Dropdown
          label="Category"
          options={categories.map((cat) => ({
            label: cat.name,
            value: cat.name,
          }))}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <Button onClick={handleSubmit} text="Save" isLoading={loading} />
      </div>
    </div>
  );
}
