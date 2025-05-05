"use client";

import React, { useEffect, useState, Suspense, useMemo } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import { toast } from "react-toastify";
import Select from "react-select";

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
  const [commodities, setCommodities] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const ITEMS_PER_PAGE = 10;

  const capitalizeWords = (str) =>
    str ? str.replace(/\b\w/g, (char) => char.toUpperCase()).trim() : "";

  const fetchAllData = async () => {
    try {
      const [companyRes, locationRes, categoryRes, commodityRes] =
        await Promise.all([
          axiosInstance.get(
            `/managecompany?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
          ),
          axiosInstance.get("/location?limit=1000"),
          axiosInstance.get("/categories"),
          axiosInstance.get("/commodity"),
        ]);

      const formattedCompanies = (companyRes.data.companies || []).map((c) => ({
        ...c,
        subCommodities: c.subCommodities || [],
        location: Array.isArray(c.location)
          ? c.location.map((loc) => {
              const locationName = typeof loc === "string" ? loc : loc.name;
              const matchingMobile = c.mobileNumbers?.find(
                (mob) => mob.location === locationName
              );
              return {
                name: locationName,
                state: typeof loc === "string" ? "" : loc.state,
                mobileNumbers: matchingMobile
                  ? [
                      {
                        primary: matchingMobile.primaryMobile || "",
                      },
                    ]
                  : [{ primary: "" }],
              };
            })
          : [],
      }));

      setCompanies(formattedCompanies);
      setTotalItems(companyRes.data.total || 0);
      setLocations(locationRes.data.locations || []);
      setCategories(categoryRes.data.categories || []);
      setCommodities(commodityRes.data.commodities || []);
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

  const handleEdit = async (id) => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get(`/managecompany/${id}`);
      const company = data.company;

      if (!company) {
        toast.error("Company not found");
        return;
      }

      setEditingCompany({
        _id: company._id,
        name: company.name,
        category: company.category || "",
        subCommodities: company.subCommodities || [],
        commodities: company.commodities || [],
        location: (company.location || []).map((loc) => ({
          name: typeof loc === "string" ? loc : loc.name,
          commodityContacts: (company.commodities || []).map((commodity) => {
            const mobileInfo = company.mobileNumbers?.find(
              (mob) =>
                mob.location === (typeof loc === "string" ? loc : loc.name) &&
                mob.commodity === commodity
            );
            return {
              commodity,
              primary: mobileInfo?.primaryMobile || "",
              contactPerson: mobileInfo?.contactPerson || "",
            };
          }),
        })),
      });
    } catch (err) {
      toast.error("Failed to fetch full company data");
    } finally {
      setIsLoading(false);
    }
  };

  const subcommodityOptions = useMemo(() => {
    if (!editingCompany || !Array.isArray(commodities)) return [];

    const selectedCommodityNames = editingCompany.commodities;

    const matchedSubcategories = commodities
      .filter((com) => selectedCommodityNames.includes(com.name))
      .flatMap((com) => com.subCategories || []);

    return Array.from(new Set(matchedSubcategories)).map((subCat) => ({
      value: subCat,
      label: subCat,
    }));
  }, [editingCompany?.commodities, commodities]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const mobileNumbers = editingCompany.location.flatMap((loc) =>
        loc.commodityContacts.map((contact) => ({
          location: loc.name,
          commodity: contact.commodity,
          primaryMobile: contact.primary,
          contactPerson: contact.contactPerson,
        }))
      );

      const updatedData = {
        name: editingCompany.name,
        category: editingCompany.category,
        subCommodities: editingCompany.subCommodities,
        commodities: editingCompany.commodities,
        location: editingCompany.location.map((loc) => loc.name),
        mobileNumbers,
      };

      await axiosInstance.put(
        `/managecompany/${editingCompany._id}`,
        updatedData
      );
      toast.success("Company updated");
      setEditingCompany(null);
      fetchAllData();
    } catch (err) {
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
    { header: "Category", accessor: "category" },
    { header: "Commodities", accessor: "commodities" },
    { header: "Sub Commodity", accessor: "subcommodity" },
    { header: "Primary Mobile", accessor: "primaryMobile" },
    { header: "Actions", accessor: "actions" },
  ];

  const data = companies
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((company) => {
      const capitalizedName = capitalizeWords(company.name);
      const capitalizedCategory = capitalizeWords(company.category || "N.A");

      const primaryNumbers = company.location
        .map((loc) => loc.mobileNumbers?.[0]?.primary || "")
        .join(", ");

      return {
        name: capitalizedName,
        locations:
          company.location.map((l) => capitalizeWords(l.name)).join(", ") ||
          "N.A",
        category: capitalizedCategory,
        commodities:
          (company.commodities || []).map(capitalizeWords).join(", ") || "N.A",
        subcommodity:
          (company.subCommodities || []).map(capitalizeWords).join(", ") ||
          "N.A",
        primaryMobile: primaryNumbers || "N.A",
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

                <div className="my-4">
                  <label className="block mb-2 font-semibold">
                    Commodities
                  </label>
                  <Select
                    isMulti
                    options={commodities.map((com) => ({
                      value: com.name,
                      label: com.name,
                    }))}
                    value={editingCompany.commodities.map((commodityName) => ({
                      value: commodityName,
                      label: commodityName,
                    }))}
                    onChange={(selectedOptions) =>
                      setEditingCompany({
                        ...editingCompany,
                        commodities: selectedOptions.map(
                          (option) => option.value
                        ),
                      })
                    }
                    className="basic-multi-select"
                    classNamePrefix="select"
                  />
                  <div className="my-4">
                    <label className="block mb-2 font-semibold">
                      Sub Commodity
                    </label>
                    <Select
                      isMulti
                      options={subcommodityOptions}
                      value={(editingCompany.subCommodities || []).map(
                        (sub) => ({
                          value: sub,
                          label: sub,
                        })
                      )}
                      onChange={(selectedOptions) =>
                        setEditingCompany({
                          ...editingCompany,
                          subCommodities: selectedOptions.map(
                            (option) => option.value
                          ),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Locations</h3>
                  {editingCompany.location.map((loc, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded mb-4">
                      <div className="flex gap-4 mb-2">
                        <select
                          className="p-2 border rounded w-full"
                          value={loc.name}
                          onChange={(e) =>
                            handleLocationChange(i, "name", e.target.value)
                          }
                        >
                          {!loc.name && (
                            <option value="">Select Location</option>
                          )}
                          {locations.map((locationObj) => (
                            <option
                              key={locationObj._id}
                              value={locationObj.name}
                            >
                              {locationObj.name}
                            </option>
                          ))}
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

                      <div className="w-full">
                        <h4 className="text-sm font-medium mb-1">
                          Commodity Contacts
                        </h4>
                        {loc.commodityContacts.map((contact, j) => (
                          <div
                            key={j}
                            className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2"
                          >
                            <div>
                              <label className="block text-sm font-medium">
                                Commodity
                              </label>
                              <input
                                className="p-2 border rounded w-full"
                                value={contact.commodity}
                                disabled
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium">
                                Primary Mobile
                              </label>
                              <input
                                type="text"
                                className="p-2 border rounded w-full"
                                value={contact.primary}
                                onChange={(e) => {
                                  const updatedContacts = [
                                    ...loc.commodityContacts,
                                  ];
                                  updatedContacts[j].primary = e.target.value;
                                  const updatedLocs = [
                                    ...editingCompany.location,
                                  ];
                                  updatedLocs[i].commodityContacts =
                                    updatedContacts;
                                  setEditingCompany({
                                    ...editingCompany,
                                    location: updatedLocs,
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium">
                                Contact Person
                              </label>
                              <input
                                type="text"
                                className="p-2 border rounded w-full"
                                value={contact.contactPerson}
                                onChange={(e) => {
                                  const updatedContacts = [
                                    ...loc.commodityContacts,
                                  ];
                                  updatedContacts[j].contactPerson =
                                    e.target.value;
                                  const updatedLocs = [
                                    ...editingCompany.location,
                                  ];
                                  updatedLocs[i].commodityContacts =
                                    updatedContacts;
                                  setEditingCompany({
                                    ...editingCompany,
                                    location: updatedLocs,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() =>
                      setEditingCompany({
                        ...editingCompany,
                        location: [
                          ...editingCompany.location,
                          {
                            name: "",
                            commodityContacts: (
                              editingCompany.commodities || []
                            ).map((commodity) => ({
                              commodity,
                              primary: "",
                              contactPerson: "",
                            })),
                          },
                        ],
                      })
                    }
                  >
                    Add Location
                  </button>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={() => setEditingCompany(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded"
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
