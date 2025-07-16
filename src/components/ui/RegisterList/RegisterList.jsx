"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import Loading from "@/components/common/Loading/Loading";
import useUsers from "@/hooks/Register/useUsers";
import useRegisterActions from "@/hooks/Register/useRegisterActions";
import useCompanies from "@/hooks/Register/useCompanies";
const Title = dynamic(() =>
  import("@/components/common/Title/Title")
);
const AssignPopup = dynamic(() =>
  import("@/components/ui/RegisterList/AssignPopup/AssignPopup")
);
const UserTable = dynamic(() =>
  import("@/components/ui/RegisterList/UserTable/UserTable")
);

export default function RegisterList() {
  const { users, fetchUsers, loadingUsers } = useUsers();
  const { companies, loadingCompanies } = useCompanies();

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
        </AnimatePresence>
      </div>
    </Suspense>
  );
}
