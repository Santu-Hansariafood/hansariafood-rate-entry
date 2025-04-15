"use client";

import React, {
  Suspense,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
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
const Pagination = dynamic(
  () => import("@/components/common/Pagination/Pagination"),
  {
    loading: () => <Loading />,
  }
);
const capitalizeWords = (str) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());

const ITEMS_PER_PAGE = 10;

const CompanyList = React.memo(() => {
  const [companies, setCompanies] = useState([]);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", category: "" });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axiosInstance.get(
          `/companies?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        );
        setCompanies(response.data.companies || []);
        setTotalCompanies(response.data.total || 0);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, [currentPage]);

  const handleDelete = useCallback(async (id) => {
    try {
      await axiosInstance.delete(`/companies/${id}`);
      setCompanies((prev) => prev.filter((company) => company._id !== id));
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  }, []);

  const handleEdit = useCallback(
    (company) => {
      const index = companies.findIndex((c) => c._id === company._id);
      setSelectedIndex(index);
      setSelectedCompany(company);
      setFormData({ name: company.name, category: company.category });
      setEditMode(true);
      setModalOpen(true);
    },
    [companies]
  );

  const handleSaveEdit = useCallback(async () => {
    if (selectedIndex === null) return;

    try {
      await axiosInstance.put(
        `/companies/${companies[selectedIndex]._id}`,
        formData
      );
      setCompanies((prev) => {
        const updated = [...prev];
        updated[selectedIndex] = {
          ...updated[selectedIndex],
          ...formData,
        };
        return updated;
      });
      setModalOpen(false);
      setEditMode(false);
      setSelectedIndex(null);
    } catch (error) {
      console.error("Error updating company:", error);
    }
  }, [formData, selectedIndex, companies]);

  const handleView = useCallback(async (id) => {
    try {
      const response = await axiosInstance.get(`/companies/${id}`);
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

  const paginatedData = useMemo(() => {
    return companies.map((company) => {
      const capitalizedName = capitalizeWords(company.name);
      const capitalizedCategory = capitalizeWords(company.category);

      return {
        name: capitalizedName,
        category: capitalizedCategory,
        actions: (
          <Actions
            item={{
              title: capitalizedName,
              id: company._id,
              onDelete: () => handleDelete(company._id),
              onEdit: () => handleEdit(company),
              onView: () => handleView(company._id),
            }}
          />
        ),
      };
    });
  }, [companies, handleDelete, handleEdit, handleView]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(companies.length / ITEMS_PER_PAGE)) {
      setCurrentPage(page);
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Company List" />
        <Table data={paginatedData} columns={columns} />
        <Pagination
          currentPage={currentPage}
          totalItems={totalCompanies}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />

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
