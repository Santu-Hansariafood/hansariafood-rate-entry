"use client";

import React, { useEffect, useState, Suspense, useMemo } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import { toast } from "react-toastify";
import EditCompanyModal from "./EditCompanyModal";

const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading />,
});
const Table = dynamic(() => import("@/components/common/Tables/Tables"), {
  loading: () => <Loading />,
});
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
    typeof str === "string"
      ? str.replace(/\b\w/g, (char) => char.toUpperCase()).trim()
      : "";

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

  const handleCloseModal = () => {
    setEditingCompany(null);
  };
  
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
      const company = data?.company;

      if (!company) {
        toast.error("Company not found");
        return;
      }

      const formattedCommodities = Array.isArray(company?.commodities)
        ? company.commodities
            .filter((cmd) => cmd)
            .map((cmd) => ({
              value: typeof cmd === "string" ? cmd : cmd?.name || "",
              label: typeof cmd === "string" ? cmd : cmd?.name || "",
              key: `commodity-edit-${typeof cmd === "string" ? cmd : cmd?.name || ""}`,
            }))
        : [];

      const formattedSubCommodities = Array.isArray(company?.commodities)
        ? company.commodities
            .flatMap((cmd) => cmd?.subcategories || [])
            .filter(Boolean)
            .map((sub) => ({
              value: sub,
              label: sub,
              key: `subcommodity-edit-${sub}`,
            }))
        : [];

      setEditingCompany({
        _id: company?._id || "",
        name: company?.name || "",
        category: company?.category || "",
        subCommodities: formattedSubCommodities,
        commodities: formattedCommodities,
        location: (company?.locations || [])
          .filter((loc) => loc && typeof loc === "object")
          .map((loc, index) => ({
            name: loc?.location || "",
            state: loc?.state || "",
            commodityContacts: formattedCommodities.map((commodity, i) => {
              const match = (loc.mobileNumbers || []).find(
                (_, idx) => idx === i
              );
              return {
                commodity: commodity.value,
                primary: match || "",
                contactPerson: (loc.contactPersons || [])[i] || "",
                key: `contact-edit-${index}-${i}-${commodity.value}`,
              };
            }),
          })),
      });
    } catch (err) {
      console.error("Edit error:", err);
      toast.error("Failed to fetch full company data");
    } finally {
      setIsLoading(false);
    }
  };

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
        subCommodities: editingCompany.subCommodities.map((sub) => sub.value),
        commodities: editingCompany.commodities.map((cmd) => cmd.value),
        location: editingCompany.location.map((loc) => loc.name),
        mobileNumbers,
      };

      await axiosInstance.put(`/managecompany/${editingCompany._id}`, updatedData);
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

  const subcommodityOptions = useMemo(() => {
    if (!editingCompany || !Array.isArray(commodities)) return [];

    const selectedCommodityNames = editingCompany.commodities.map((cmd) => cmd.value || "");

    const matchedSubcategories = commodities
      .filter((com) => selectedCommodityNames.includes(com.name || ""))
      .flatMap((com) => Array.isArray(com.subCategories) ? com.subCategories : []);

    return Array.from(new Set(matchedSubcategories)).map((subCat) => ({
      value: subCat || "",
      label: subCat || "",
      key: `subcommodity-option-${subCat || ""}`,
    }));
  }, [editingCompany?.commodities, commodities]);

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
    .filter((company) => company && typeof company === "object")
    .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""))
    .map((company) => {
      const name = capitalizeWords(company?.name || "N.A");
      const category = capitalizeWords(company?.category || "N.A");

      const primaryMobile = (company?.location || [])
        .flatMap((loc) =>
          (loc.mobileNumbers || []).map((m) => m.primary).filter(Boolean)
        )
        .join(", ") || "N.A";

      const commodities = (company?.commodities || [])
        .map((c) =>
          capitalizeWords(typeof c === "string" ? c : c?.name || "")
        )
        .filter(Boolean)
        .join(", ") || "N.A";

      const subCommodities = (company?.subCommodities || [])
        .map((s) => capitalizeWords(typeof s === "string" ? s : s?.name || ""))
        .filter(Boolean)
        .join(", ") || "N.A";

      const locations = (company?.location || [])
        .map((l) => {
          const name = typeof l === "string" ? l : l?.name || "";
          const state = typeof l === "object" ? l?.state || "" : "";
          return capitalizeWords(`${name}${state ? ` (${state})` : ""}`);
        })
        .filter(Boolean)
        .join(", ") || "N.A";

      return {
        name,
        locations,
        category,
        commodities,
        subcommodity: subCommodities,
        primaryMobile,
        actions: (
          <Actions
            item={{
              id: company._id,
              title: name,
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
        <EditCompanyModal
          editingCompany={editingCompany}
          setEditingCompany={setEditingCompany}
          categories={categories}
          commodities={commodities}
          subcommodityOptions={subcommodityOptions}
          locations={locations}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onClose={handleCloseModal}
          refreshCompanyList={fetchAllData}
        />
      )}
    </div>
  </Suspense>
);
}

export default ManageCompanyList;
