"use client";

import React, { Suspense, useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import { toast } from "react-toastify";
import { Edit2, Trash2, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import stateData from "@/data/state-city.json";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const Table = dynamic(() => import("@/components/common/Tables/Tables"));

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
      console.error("Error fetching managed companies:", error);
      toast.error("Failed to fetch companies");
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?")) {
      return;
    }

    try {
      setIsLoading(true);
      await axios.delete("/api/managecompany", { data: { id } });
      toast.success("Company deleted successfully");
      fetchCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete company");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (company) => {
    setEditingCompany(company);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.put("/api/managecompany", {
        id: editingCompany._id,
        name: editingCompany.name,
        location: editingCompany.location,
        state: editingCompany.state,
      });
      toast.success("Company updated successfully");
      setEditingCompany(null);
      setShowStateDropdown(false);
      fetchCompanies();
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error("Failed to update company");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateSelect = (state) => {
    setEditingCompany({ ...editingCompany, state });
    setShowStateDropdown(false);
  };

  const columns = [
    { header: "Company Name", accessor: "name" },
    { header: "Locations", accessor: "locations" },
    { header: "State", accessor: "state" },
    { header: "Actions", accessor: "actions" },
  ];

  const data = companies.map((company) => ({
    name: editingCompany?._id === company._id ? (
      <input
        type="text"
        value={editingCompany.name}
        onChange={(e) =>
          setEditingCompany({ ...editingCompany, name: e.target.value })
        }
        className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    ) : (
      company.name
    ),
    locations: editingCompany?._id === company._id ? (
      <input
        type="text"
        value={editingCompany.location.join(", ")}
        onChange={(e) =>
          setEditingCompany({
            ...editingCompany,
            location: e.target.value.split(",").map((loc) => loc.trim()),
          })
        }
        className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    ) : (
      company.location.join(", ")
    ),
    state: editingCompany?._id === company._id ? (
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowStateDropdown(!showStateDropdown)}
          className="w-full px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-between bg-white"
        >
          <span>{editingCompany.state || "Select State"}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        {showStateDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {stateData.map((stateItem, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleStateSelect(stateItem.state)}
              >
                {stateItem.state}
              </div>
            ))}
          </div>
        )}
      </div>
    ) : (
      company.state || "N.A"
    ),
    actions: (
      <div className="flex items-center gap-2">
        {editingCompany?._id === company._id ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpdate}
              disabled={isLoading}
              className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              Save
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingCompany(null);
                setShowStateDropdown(false);
              }}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEdit(company)}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Edit2 size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDelete(company._id)}
              disabled={isLoading}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
            </motion.button>
          </>
        )}
      </div>
    ),
  }));

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Manage Company List" />
        <Table data={data} columns={columns} />
      </div>
    </Suspense>
  );
};

export default ManageCompanyList;
