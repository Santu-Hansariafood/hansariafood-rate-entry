"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  X,
  Plus,
  Loader2,
  Check,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import dynamic from "next/dynamic";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import useUsers from "@/hooks/Register/useUsers";
import useCompanies from "@/hooks/Register/useCompanies";
import Loading from "@/components/common/Loading/Loading";

const Table = dynamic(() => import("@/components/common/Tables/Tables"));

export default function RegisterList() {
  const { users, fetchUsers, loadingUsers } = useUsers();
  const { companies, loadingCompanies } = useCompanies();

  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleOpenPopup = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClosePopup = () => {
    setOpen(false);
    setSelectedCompanies([]);
    setSelectedLocations([]);
    setSelectedUser(null);
  };

  const handleCompanyChange = (companyId) => {
    if (!selectedCompanies.includes(companyId)) {
      setSelectedCompanies([...selectedCompanies, companyId]);
    }
  };

  const handleRemoveCompany = (companyId) => {
    setSelectedCompanies(selectedCompanies.filter((id) => id !== companyId));
    setSelectedLocations(
      selectedLocations.filter((loc) => {
        const company = companies.find((c) => c._id === companyId);
        return !company?.location.includes(loc);
      })
    );
  };

  const handleLocationToggle = (location) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((loc) => loc !== location)
        : [...prev, location]
    );
  };

  const handleSelectAllLocations = (companyId) => {
    const company = companies.find((c) => c._id === companyId);
    if (company) {
      const allLocations = company.location;
      const currentSelected = selectedLocations.filter(
        (loc) => !allLocations.includes(loc)
      );
      setSelectedLocations([...currentSelected, ...allLocations]);
    }
  };

  const handleDeselectAllLocations = (companyId) => {
    const company = companies.find((c) => c._id === companyId);
    if (company) {
      setSelectedLocations(
        selectedLocations.filter((loc) => !company.location.includes(loc))
      );
    }
  };

  const isAllLocationsSelected = (companyId) => {
    const company = companies.find((c) => c._id === companyId);
    if (!company) return false;
    return company.location.every((loc) => selectedLocations.includes(loc));
  };

  const handleSave = async () => {
    if (!selectedCompanies.length || !selectedLocations.length) {
      toast.error("Please select at least one company and location");
      return;
    }

    try {
      setSaving(true);
      const companiesData = selectedCompanies.map((companyId) => {
        const company = companies.find((c) => c._id === companyId);
        return {
          companyId,
          locations: selectedLocations.filter((loc) =>
            company?.location.includes(loc)
          ),
        };
      });

      if (!companiesData.every((company) => company.locations.length > 0)) {
        toast.error("Each selected company must have at least one location");
        return;
      }

      await axiosInstance.post("/user-companies", {
        mobile: selectedUser.mobile,
        companies: companiesData,
      });

      toast.success("Companies and locations assigned successfully");
      handleClosePopup();
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error ||
          "Failed to assign companies and locations"
      );
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Mobile", accessor: "mobile" },
    { header: "Action", accessor: "action" },
  ];

  const usersWithActions = users.map((user) => ({
    ...user,
    action: (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleOpenPopup(user)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
      >
        <Plus size={16} />
        Add Company
      </motion.button>
    ),
  }));

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 m-4 w-full max-w-6xl mx-auto bg-white shadow-lg rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Registered Users</h2>
          {(loadingUsers || loadingCompanies) && <Loading />}
        </div>
        <Table data={usersWithActions} columns={columns} />
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="bg-white p-6 rounded-xl w-[90%] max-w-3xl relative"
              >
                <button
                  onClick={handleClosePopup}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <X />
                </button>
                <h3 className="text-xl font-semibold mb-4">
                  Assign Companies & Locations to{" "}
                  <span className="text-blue-600">
                    {selectedUser?.name || ""}
                  </span>
                </h3>
                <div className="flex flex-col gap-4 max-h-[60vh] overflow-auto">
                  {companies.map((company) => (
                    <div key={company._id} className="border rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <div
                          className="font-medium text-lg text-gray-800 truncate max-w-[75%]"
                          title={company.name}
                        >
                          {company.name || "Unnamed Company"}
                        </div>

                        {selectedCompanies.includes(company._id) ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                isAllLocationsSelected(company._id)
                                  ? handleDeselectAllLocations(company._id)
                                  : handleSelectAllLocations(company._id)
                              }
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {isAllLocationsSelected(company._id)
                                ? "Deselect All"
                                : "Select All"}
                            </button>
                            <Trash2
                              onClick={() => handleRemoveCompany(company._id)}
                              className="text-red-500 cursor-pointer"
                            />
                          </div>
                        ) : (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCompanyChange(company._id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
                          >
                            Select Company
                          </motion.button>
                        )}
                      </div>

                      {selectedCompanies.includes(company._id) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {company.location.map((loc) => {
                            const isSelected = selectedLocations.includes(loc);
                            return (
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                key={loc}
                                onClick={() => handleLocationToggle(loc)}
                                className={`flex items-center gap-2 border px-3 py-1 rounded-md text-sm ${
                                  isSelected
                                    ? "bg-green-100 border-green-500 text-green-700"
                                    : "bg-white border-gray-300 text-gray-600"
                                }`}
                              >
                                {isSelected ? (
                                  <CheckSquare size={16} />
                                ) : (
                                  <Square size={16} />
                                )}
                                {loc}
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end gap-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClosePopup}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
                      saving
                        ? "bg-blue-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {saving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    Save
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Suspense>
  );
}
