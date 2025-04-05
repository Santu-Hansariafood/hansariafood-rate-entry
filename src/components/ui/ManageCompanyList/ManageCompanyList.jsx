"use client";

import React, { Suspense, useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import { toast } from "react-toastify";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const Table = dynamic(() => import("@/components/common/Tables/Tables"));
const Actions = dynamic(() => import("@/components/common/Actions/Actions"));

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

const ManageCompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState([]);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get("/api/managecompany");
      const formattedCompanies = (response.data.companies || []).map((c) => ({
        ...c,
        location: Array.isArray(c.location)
          ? c.location.map((loc) =>
              typeof loc === "string" ? { name: loc, state: "" } : loc
            )
          : [],
      }));
      setCompanies(formattedCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to fetch companies");
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleView = async (id) => {
    try {
      const response = await axios.get(`/api/managecompany/${id}`);
      const company = response.data.company;
      const locations = Array.isArray(company.location)
        ? company.location
            .map((l) => (typeof l === "string" ? l : `${l.name} (${l.state})`))
            .join(", ")
        : "N.A";
      alert(`Company: ${company.name}\nLocation(s): ${locations}`);
    } catch (error) {
      console.error("Error fetching company details:", error);
      toast.error("Failed to fetch company details");
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await axios.get(`/api/managecompany/${id}`);
      const company = response.data.company;

      const formattedLocation = Array.isArray(company.location)
        ? company.location.map((loc) => {
            const [name, ...stateParts] = loc.split(" ");
            return {
              name: name,
              state: stateParts.join(" "),
            };
          })
        : [];

      setEditingCompany({
        _id: company._id,
        name: company.name,
        location: formattedLocation,
      });
    } catch (error) {
      console.error("Error loading company for editing:", error);
      toast.error("Failed to load company for editing");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const formattedLocations = editingCompany.location.map((loc) =>
        `${loc.name} ${loc.state}`.trim()
      );

      await axios.put(`/api/managecompany/${editingCompany._id}`, {
        name: editingCompany.name,
        location: formattedLocations,
      });

      toast.success("Company updated successfully");
      setEditingCompany(null);
      fetchCompanies();
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error("Failed to update company");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?"))
      return;
    try {
      setIsLoading(true);
      await axios.delete(`/api/managecompany/${id}`);
      toast.success("Company deleted successfully");
      fetchCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete company");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = (index, field, value) => {
    const updatedLocations = editingCompany.location.map((loc, i) => {
      if (i === index) {
        return { ...loc, [field]: value };
      }
      return loc;
    });
    setEditingCompany({ ...editingCompany, location: updatedLocations });
  };

  const handleAddLocation = () => {
    setEditingCompany({
      ...editingCompany,
      location: [...editingCompany.location, { name: "", state: "" }],
    });
  };

  const handleRemoveLocation = (index) => {
    const updatedLocations = editingCompany.location.filter(
      (_, i) => i !== index
    );
    setEditingCompany({ ...editingCompany, location: updatedLocations });
  };

  const columns = [
    { header: "Company Name", accessor: "name" },
    { header: "Locations", accessor: "locations" },
    { header: "State", accessor: "state" },
    { header: "Actions", accessor: "actions" },
  ];

  const data = companies.map((company) => ({
    name: company.name,
    locations:
      Array.isArray(company.location) && company.location.length > 0
        ? company.location.map((l) => l.name).join(", ")
        : "N.A",
    state:
      Array.isArray(company.location) && company.location.length > 0
        ? company.location.map((l) => l.state).join(", ")
        : "N.A",
    actions: (
      <Actions
        item={{
          id: company._id,
          title: company.name,
          onView: handleView,
          onEdit: () => setEditingCompany(company), // ✅ Fix here
          onDelete: handleDelete,
        }}
      />
    ),
  }));

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Manage Company List" />
        <Table data={data} columns={columns} />

        {editingCompany && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Company</h2>

              <form onSubmit={handleUpdate}>
                <label className="block mb-4">
                  <span className="block mb-1">Company Name:</span>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={editingCompany.name}
                    onChange={(e) =>
                      setEditingCompany({
                        ...editingCompany,
                        name: e.target.value,
                      })
                    }
                  />
                </label>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Locations</h3>
                  <div className="space-y-4">
                    {editingCompany.location.map((loc, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-2 gap-4 items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Enter location name"
                            className="w-full p-2 border rounded"
                            value={loc.name}
                            onChange={(e) =>
                              handleLocationChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <select
                            className="p-2 border rounded w-full"
                            value={loc.state}
                            onChange={(e) =>
                              handleLocationChange(
                                index,
                                "state",
                                e.target.value
                              )
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

                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setEditingCompany(null)}
                    className="px-4 py-2 mr-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default ManageCompanyList;
