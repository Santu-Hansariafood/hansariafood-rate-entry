"use client";
import React, { Suspense, useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const Table = dynamic(() => import("@/components/common/Tables/Tables"));
const Actions = dynamic(() => import("@/components/common/Actions/Actions"));
const Modal = dynamic(() => import("@/components/common/Modal/Modal"));

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", category: "" });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("/api/companies");
        setCompanies(response.data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/companies/${id}`);
      setCompanies((prev) => prev.filter((company) => company._id !== id));
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setFormData({ name: company.name, category: company.category });
    setEditMode(true);
    setModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`/api/companies/${selectedCompany._id}`, formData);
      setCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company._id === selectedCompany._id ? { ...company, ...formData } : company
        )
      );
      setModalOpen(false);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating company:", error);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await axios.get(`/api/companies/${id}`);
      setSelectedCompany(response.data);
      setEditMode(false);
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching company details:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    { header: "Company Name", accessor: "name" },
    { header: "Category", accessor: "category" },
    { header: "Actions", accessor: "actions" },
  ];

  const data = companies.map((company) => ({
    name: company.name,
    category: company.category,
    actions: (
      <Actions
        item={{
          title: company.name,
          id: company._id,
          onDelete: () => handleDelete(company._id),
          onEdit: () => handleEdit(company),
          onView: () => handleView(company._id),
        }}
      />
    ),
  }));

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Company List" />
        <Table data={data} columns={columns} />
        {modalOpen && selectedCompany && (
          <Modal onClose={() => setModalOpen(false)}>
            {editMode ? (
              <>
                <h2 className="text-lg font-bold">Edit Company</h2>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border p-2 w-full my-2"
                  placeholder="Company Name"
                />
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="border p-2 w-full my-2"
                  placeholder="Category"
                />
                <button
                  onClick={handleSaveEdit}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold">{selectedCompany.name}</h2>
                <p className="text-sm text-gray-600">Category: {selectedCompany.category}</p>
              </>
            )}
          </Modal>
        )}
      </div>
    </Suspense>
  );
};

export default CompanyList;
