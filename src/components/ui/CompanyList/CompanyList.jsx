"use client";

import React, {
  Suspense,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading />,
});
const Table = dynamic(() => import("@/components/common/Tables/Tables"), {
  loading: () => <Loading />,
});
const Actions = dynamic(() => import("@/components/common/Actions/Actions"), {
  loading: () => <Loading />,
});
const Modal = dynamic(() => import("@/components/common/Modal/Modal"), {
  loading: () => <Loading />,
});
const InputBox = dynamic(
  () => import("@/components/common/InputBox/InputBox"),
  {
    ssr: false,

    loading: () => <Loading />,
  }
);

const CompanyList = React.memo(() => {
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

  const handleDelete = useCallback(async (id) => {
    try {
      await axios.delete(`/api/companies/${id}`);
      setCompanies((prev) => prev.filter((company) => company._id !== id));
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  }, []);

  const handleEdit = useCallback((company) => {
    setSelectedCompany(company);
    setFormData({ name: company.name, category: company.category });
    setEditMode(true);
    setModalOpen(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    try {
      await axios.put(`/api/companies/${selectedCompany._id}`, formData);
      setCompanies((prev) =>
        prev.map((company) =>
          company._id === selectedCompany._id
            ? { ...company, ...formData }
            : company
        )
      );
      setModalOpen(false);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating company:", error);
    }
  }, [formData, selectedCompany]);

  const handleView = useCallback(async (id) => {
    try {
      const response = await axios.get(`/api/companies/${id}`);
      setSelectedCompany(response.data);
      setEditMode(false);
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching company details:", error);
    }
  }, []);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const columns = useMemo(
    () => [
      { header: "Company Name", accessor: "name" },
      { header: "Category", accessor: "category" },
      { header: "Actions", accessor: "actions" },
    ],
    []
  );

  const data = useMemo(
    () =>
      companies.map((company) => ({
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
      })),
    [companies, handleDelete, handleEdit, handleView]
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Company List" />
        <Table data={data} columns={columns} />
        {modalOpen && selectedCompany && (
          <Modal onClose={() => setModalOpen(false)}>
            {editMode ? (
              <>
                <h2 className="text-lg font-bold mb-4">Edit Company</h2>
                <InputBox
                  label="Company Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Company Name"
                />
                <InputBox
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Category"
                />
                <button
                  onClick={handleSaveEdit}
                  className="bg-blue-600 text-white mt-4 px-4 py-2 rounded-lg"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold">{selectedCompany.name}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Category: {selectedCompany.category}
                </p>
              </>
            )}
          </Modal>
        )}
      </div>
    </Suspense>
  );
});

export default CompanyList;
