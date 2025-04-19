"use client";

import React, { Suspense, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Loading from "@/components/common/Loading/Loading";

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
      location: [...company.location, { name: "", state: "", mobile: "" }],
    });
  };

  const handleRemoveLocation = (index) => {
    const updated = company.location.filter((_, i) => i !== index);
    onChange({ ...company, location: updated });
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-11/12 md:w-3/4 bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Edit Company</h2>

          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Company Name</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={company.name}
                onChange={(e) => onChange({ ...company, name: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Category</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={company.category || ""}
                onChange={(e) =>
                  onChange({ ...company, category: e.target.value })
                }
                required
              />
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Locations</h3>

              {company.location.map((loc, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 mb-3 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-center"
                >
                  <div>
                    <input
                      type="text"
                      list="locations"
                      className="w-full border rounded p-2"
                      placeholder="Location Name"
                      value={loc.name}
                      onChange={(e) =>
                        handleLocationChange(index, "name", e.target.value)
                      }
                      required
                    />
                    <datalist id="locations">
                      {locations.map((location, i) => (
                        <option key={i} value={location} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <select
                      className="w-full border rounded p-2"
                      value={loc.state}
                      onChange={(e) =>
                        handleLocationChange(index, "state", e.target.value)
                      }
                      required
                    >
                      <option value="">Select State</option>
                      {states.map((state, i) => (
                        <option key={i} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="w-full border rounded p-2"
                      placeholder="Mobile Number"
                      value={loc.mobile || ""}
                      onChange={(e) =>
                        handleLocationChange(index, "mobile", e.target.value)
                      }
                      maxLength={10}
                      pattern="[0-9]*"
                      required
                    />
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleRemoveLocation(index)}
                      title="Remove Location"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleAddLocation}
              >
                + Add Location
              </button>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="mr-3 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
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
    </Suspense>
  );
};

export default EditCompanyModal;
