"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const EditCompanyModal = ({ company, onChange, onCancel, onSubmit }) => {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axiosInstance.get("/managecompany");
        const allLocations = response.data.companies.flatMap((c) =>
          Array.isArray(c.location) ? c.location : []
        );
        const uniqueLocations = [
          ...new Set(
            allLocations.map((loc) => {
              if (typeof loc === "string") {
                const parts = loc.trim().split(" ");
                parts.pop();
                return parts.join(" ");
              }
              return loc.name;
            })
          ),
        ];
        setLocations(uniqueLocations);
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast.error("Failed to fetch locations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (!company) return null;

  const handleLocationChange = (index, field, value) => {
    const updatedLocations = company.location.map((loc, i) =>
      i === index ? { ...loc, [field]: value } : loc
    );
    onChange({ ...company, location: updatedLocations });
  };

  const handleAddLocation = () => {
    onChange({
      ...company,
      location: [...company.location, { name: "", state: "" }],
    });
  };

  const handleRemoveLocation = (index) => {
    const updatedLocations = company.location.filter((_, i) => i !== index);
    onChange({ ...company, location: updatedLocations });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Company</h2>

        <form onSubmit={onSubmit}>
          {/* Company Name */}
          <label className="block mb-4">
            <span className="block mb-1">Company Name:</span>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={company.name}
              onChange={(e) => onChange({ ...company, name: e.target.value })}
            />
          </label>

          {/* Category */}
          <label className="block mb-4">
            <span className="block mb-1">Category:</span>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={company.category || ""}
              onChange={(e) =>
                onChange({ ...company, category: e.target.value })
              }
            />
          </label>

          {/* Locations */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Locations</h3>
            <div className="space-y-4">
              {company.location.map((loc, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 gap-4 items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="relative">
                    <input
                      type="text"
                      list="locations"
                      placeholder="Enter location name"
                      className="w-full p-2 border rounded"
                      value={loc.name}
                      onChange={(e) =>
                        handleLocationChange(index, "name", e.target.value)
                      }
                    />
                    <datalist id="locations">
                      {locations.map((location, i) => (
                        <option key={i} value={location} />
                      ))}
                    </datalist>
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="p-2 border rounded w-full"
                      value={loc.state}
                      onChange={(e) =>
                        handleLocationChange(index, "state", e.target.value)
                      }
                    >
                      <option value="">Select State</option>
                      {states.map((state, i) => (
                        <option key={i} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveLocation(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddLocation}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Location
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 mr-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCompanyModal;
