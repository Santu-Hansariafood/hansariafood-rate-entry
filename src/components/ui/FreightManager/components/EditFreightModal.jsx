import React from "react";
import Modal from "@/components/common/Modal/Modal";
import FreightForm from "./FreightForm";

const EditFreightModal = ({ isEditModalOpen, resetForm, freightManager }) => {
  if (!isEditModalOpen) return null;

  return (
    <Modal onClose={resetForm} className="max-w-4xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Edit Freight
          </h2>
        </div>
        <FreightForm context={freightManager} isEdit={true} />
      </div>
    </Modal>
  );
};

export default EditFreightModal;
