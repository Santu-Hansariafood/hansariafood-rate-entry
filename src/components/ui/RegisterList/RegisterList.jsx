"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import Loading from "@/components/common/Loading/Loading";
import useUsers from "@/hooks/Register/useUsers";
import useRegisterActions from "@/hooks/Register/useRegisterActions";
import useCompanies from "@/hooks/Register/useCompanies";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
const Title = dynamic(() => import("@/components/common/Title/Title"));
const AssignPopup = dynamic(() =>
  import("@/components/ui/RegisterList/AssignPopup/AssignPopup")
);
const UserTable = dynamic(() =>
  import("@/components/ui/RegisterList/UserTable/UserTable")
);
const CompanyViewPopup = dynamic(() =>
  import("@/components/ui/RegisterList/CompanyViewPopup/CompanyViewPopup")
);
export default function RegisterList() {
  const { users, fetchUsers, loadingUsers } = useUsers();
  const { companies, loadingCompanies } = useCompanies();
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingCompanies, setViewingCompanies] = useState([]);
  const [viewOpen, setViewOpen] = useState(false);

  const handleViewUserCompanies = async (user) => {
    try {
      const res = await axiosInstance.get(
        `/user-companies?mobile=${user.mobile}`
      );
      setViewingUser(user.name);
      setViewingCompanies(res.data.companies || []);
      setViewOpen(true);
    } catch (err) {
      console.error("Error loading companies:", err);
    }
  };

  const registerActions = useRegisterActions({
    companies,
    fetchUsers,
  });

  const {
    open,
    selectedUser,
    handleOpenPopup,
    handleClosePopup,
    handleSave,
    handleDeleteUser,
    saving,
    selectedCompanies,
    selectedLocations,
    handleCompanyChange,
    handleRemoveCompany,
    handleLocationToggle,
    handleSelectAllLocations,
    handleDeselectAllLocations,
    isAllLocationsSelected,
  } = registerActions;

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 m-4 w-full max-w-6xl mx-auto bg-white shadow-lg rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <Title text="Registered Users" />
          {(loadingUsers || loadingCompanies) && <Loading />}
        </div>

        <UserTable
          users={users}
          handleOpenPopup={handleOpenPopup}
          handleDeleteUser={handleDeleteUser}
          saving={saving}
          onView={handleViewUserCompanies}
        />

        <AnimatePresence>
          {open && (
            <AssignPopup
              open={open}
              companies={companies}
              selectedUser={selectedUser}
              selectedCompanies={selectedCompanies}
              selectedLocations={selectedLocations}
              handleClosePopup={handleClosePopup}
              handleSave={handleSave}
              saving={saving}
              handleCompanyChange={handleCompanyChange}
              handleRemoveCompany={handleRemoveCompany}
              handleLocationToggle={handleLocationToggle}
              handleSelectAllLocations={handleSelectAllLocations}
              handleDeselectAllLocations={handleDeselectAllLocations}
              isAllLocationsSelected={isAllLocationsSelected}
            />
          )}
          {viewOpen && (
            <CompanyViewPopup
              open={viewOpen}
              onClose={() => setViewOpen(false)}
              userName={viewingUser}
              assignedCompanies={viewingCompanies}
            />
          )}
        </AnimatePresence>
      </div>
    </Suspense>
  );
}
