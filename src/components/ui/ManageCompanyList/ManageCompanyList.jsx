"use client";

import React, { Suspense, useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import { toast } from "react-toastify";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const Table = dynamic(() => import("@/components/common/Tables/Tables"));
const Actions = dynamic(() => import("@/components/common/Actions/Actions"));
const EditCompanyModal = dynamic(() =>
  import("@/components/ui/ManageCompanyList/EditCompanyModal/EditCompanyModal")
);

const ManageCompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
            .map((l) =>
              typeof l === "string" ? l : `${l.name} (${l.state})`
            )
            .join(", ")
        : "N.A";
      alert(`Company: ${company.name}\nLocation(s): ${locations}`);
    } catch (error) {
      console.error("Error fetching company details:", error);
      toast.error("Failed to fetch company details");
    }
  };

  const handleEdit = (company) => {
    const formattedCompany = {
      ...company,
      location: Array.isArray(company.location)
        ? company.location.map((loc) => {
            if (typeof loc === "string") {
              const parts = loc.trim().split(" ");
              const state = parts.pop(); // last word is state
              const name = parts.join(" "); // rest is location name
              return { name, state };
            } else if (typeof loc === "object" && loc !== null) {
              return {
                name: loc.name || "",
                state: loc.state || "",
              };
            }
            return { name: "", state: "" };
          })
        : [],
    };
  
    setEditingCompany(formattedCompany);
  };
  
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.put(`/api/managecompany/${editingCompany._id}`, {
        name: editingCompany.name,
        location: editingCompany.location.map(loc => `${loc.name} ${loc.state}`.trim()),
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
          <EditCompanyModal
            company={editingCompany}
            onCancel={() => setEditingCompany(null)}
            onChange={setEditingCompany}
            onSubmit={handleUpdate}
          />
        )}
      </div>
    </Suspense>
  );
};

export default ManageCompanyList;
