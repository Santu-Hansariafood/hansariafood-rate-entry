"use client";

import React, { Suspense, useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import { toast } from "react-toastify";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const Table = dynamic(() => import("@/components/common/Tables/Tables"));
const Actions = dynamic(() => import("@/components/common/Actions/Actions"));

const ManageCompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get("/api/managecompany");
      setCompanies(response.data.companies || []);
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
      alert(
        `Company: ${company.name} - Location: ${company.location.join(", ")}`
      );
    } catch (error) {
      console.error("Error fetching company details:", error);
      toast.error("Failed to fetch company details");
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.put(`/api/managecompany/${editingCompany._id}`, {
        name: editingCompany.name,
        location: editingCompany.location,
        state: editingCompany.state,
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

  const columns = [
    { header: "Company Name", accessor: "name" },
    { header: "Locations", accessor: "locations" },
    { header: "State", accessor: "state" },
    { header: "Actions", accessor: "actions" },
  ];

  const data = companies.map((company) => ({
    name: company.name,
    locations: Array.isArray(company.location)
      ? company.location.join(", ")
      : "N.A",
    state: company.state || "N.A",
    actions: (
      <Actions
        item={{
          id: company._id,
          title: company.name,
          onView: handleView,
          onEdit: handleEdit,
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
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-5 rounded-lg shadow-lg w-1/3">
              <h2 className="text-lg font-semibold mb-4">Edit Company</h2>
              <form onSubmit={handleUpdate}>
                <label className="block mb-2">
                  Name:
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
                <label className="block mb-2">
                  Location:
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={editingCompany.location}
                    onChange={(e) =>
                      setEditingCompany({
                        ...editingCompany,
                        location: e.target.value.split(", "),
                      })
                    }
                  />
                </label>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setEditingCompany(null)}
                    className="mr-2 px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Update
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
