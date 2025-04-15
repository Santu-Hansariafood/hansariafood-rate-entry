"use client";

import React, { useEffect, useState, Suspense } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import { toast } from "react-toastify";

const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading />,
});
const Table = dynamic(() => import("@/components/common/Tables/Tables"), {
  loading: () => <Loading />,
});
const InputBox = dynamic(
  () => import("@/components/common/InputBox/InputBox"),
  {
    loading: () => <Loading />,
  }
);
const Pagination = dynamic(
  () => import("@/components/common/Pagination/Pagination"),
  {
    loading: () => <Loading />,
  }
);
const Actions = dynamic(() => import("@/components/common/Actions/Actions"), {
  loading: () => <Loading />,
});

const ManageCompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const ITEMS_PER_PAGE = 10;

  const capitalizeWords = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase()).trim();

  const fetchAllData = async () => {
    try {
      const [companyRes, locationRes, categoryRes] = await Promise.all([
        axiosInstance.get(
          `/managecompany?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        ),
        axiosInstance.get("/location"),
        axiosInstance.get("/categories"),
      ]);

      const formattedCompanies = (companyRes.data.companies || []).map((c) => ({
        ...c,
        location: Array.isArray(c.location)
          ? c.location.map((loc) =>
              typeof loc === "string" ? { name: loc, state: "" } : loc
            )
          : [],
      }));

      setCompanies(formattedCompanies);
      setTotalItems(companyRes.data.total || 0);
      setLocations(locationRes.data.locations || []);
      setCategories(categoryRes.data.categories || []);
    } catch (err) {
      toast.error("Failed to fetch initial data");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [currentPage]);

  const handleView = async (id) => {
    try {
      const { data } = await axiosInstance.get(`/managecompany/${id}`);
      const locations = (data.company.location || [])
        .map((l) => (typeof l === "string" ? l : `${l.name} (${l.state})`))
        .join(", ");
      alert(`Company: ${data.company.name}\nLocation(s): ${locations}`);
    } catch {
      toast.error("Failed to fetch company details");
    }
  };

  const handleEdit = (id) => {
    const company = companies.find((c) => c._id === id);
    if (!company) return;

    const loc = company.location.map((loc) =>
      typeof loc === "string" ? { name: loc, state: "" } : loc
    );

    setEditingCompany({
      _id: company._id,
      name: company.name,
      location: loc,
      category: company.category || "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axiosInstance.put(
        `/managecompany/${editingCompany._id}`,
        editingCompany
      );
      toast.success("Company updated");
      setEditingCompany(null);
      fetchAllData();
    } catch {
      toast.error("Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company?")) return;
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/managecompany/${id}`);
      toast.success("Deleted successfully");
      fetchAllData();
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = (index, field, value) => {
    const updated = editingCompany.location.map((loc, i) =>
      i === index ? { ...loc, [field]: value } : loc
    );
    setEditingCompany({ ...editingCompany, location: updated });
  };

  const columns = [
    { header: "Company Name", accessor: "name" },
    { header: "Locations", accessor: "locations" },
    { header: "State", accessor: "state" },
    { header: "Category", accessor: "category" },
    { header: "Actions", accessor: "actions" },
  ];

  const data = companies
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((company) => {
      const capitalizedName = capitalizeWords(company.name);
      const capitalizedCategory = capitalizeWords(company.category || "N.A");

      return {
        name: capitalizedName,
        locations:
          company.location.map((l) => capitalizeWords(l.name)).join(", ") ||
          "N.A",
        state:
          company.location.map((l) => capitalizeWords(l.state)).join(", ") ||
          "N.A",
        category: capitalizedCategory,
        actions: (
          <Actions
            item={{
              id: company._id,
              title: capitalizedName,
              onView: () => handleView(company._id),
              onEdit: () => handleEdit(company._id),
              onDelete: () => handleDelete(company._id),
            }}
          />
        ),
      };
    });

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Manage Company List" />
        <Table data={data} columns={columns} />
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />

        {editingCompany && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-3/4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Company</h2>

              <form onSubmit={handleUpdate}>
                <InputBox
                  label="Company Name"
                  value={editingCompany.name}
                  onChange={(e) =>
                    setEditingCompany({
                      ...editingCompany,
                      name: e.target.value,
                    })
                  }
                />

                <div className="my-4">
                  <label className="block mb-2 font-semibold">Category</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={editingCompany.category}
                    onChange={(e) =>
                      setEditingCompany({
                        ...editingCompany,
                        category: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Locations</h3>
                  {editingCompany.location.map((loc, i) => (
                    <div
                      key={i}
                      className="flex gap-4 items-center mb-3 bg-gray-50 p-3 rounded-lg"
                    >
                      <InputBox
                        placeholder="Location name"
                        value={loc.name}
                        onChange={(e) =>
                          handleLocationChange(i, "name", e.target.value)
                        }
                      />
                      <select
                        className="p-2 border rounded w-full"
                        value={loc.state}
                        onChange={(e) =>
                          handleLocationChange(i, "state", e.target.value)
                        }
                      >
                        <option value="">Select State</option>
                        {[...new Set(locations.map((loc) => loc.state))].map(
                          (state, idx) => (
                            <option key={idx} value={state}>
                              {state}
                            </option>
                          )
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingCompany({
                            ...editingCompany,
                            location: editingCompany.location.filter(
                              (_, index) => index !== i
                            ),
                          })
                        }
                        className="text-red-600 hover:bg-red-100 px-2 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setEditingCompany({
                        ...editingCompany,
                        location: [
                          ...editingCompany.location,
                          { name: "", state: "" },
                        ],
                      })
                    }
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    + Add Location
                  </button>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingCompany(null)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
