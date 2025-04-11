"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
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
const Pagination = dynamic(() => import("@/components/common/Pagination/Pagination"), {
  loading: () => <Loading />,
});

const CommodityList = () => {
  const [commodities, setCommodities] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState(null);
  const [modal, setModal] = useState({ open: false, type: "", data: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  const fetchCommodities = useCallback(async (page = 1) => {
    try {
      const response = await axios.get(`/api/commodity?page=${page}&limit=10`);
      setCommodities(response.data.commodities || []);
      setTotalEntries(response.data.total);
    } catch (error) {
      console.error("Error fetching commodities");
    }
  }, []);

  useEffect(() => {
    fetchCommodities(currentPage);
  }, [fetchCommodities, currentPage]);

  const handleEdit = useCallback(
    (index, newName) => {
      const id = commodities[index]._id;
      axios
        .put(`/api/commodity/${id}`, { name: newName })
        .then((res) => {
          const updated = [...commodities];
          updated[index].name = res.data.commodity.name;
          setCommodities(updated);
          closeModal();
        })
        .catch(() => console.error("Error updating commodity"));
    },
    [commodities]
  );

  const handleDelete = useCallback(
    (index) => {
      const id = commodities[index]._id;
      axios
        .delete(`/api/commodity/${id}`)
        .then(() => {
          const updated = [...commodities];
          updated.splice(index, 1);
          setCommodities(updated);
          closeModal();
        })
        .catch(() => console.error("Error deleting commodity"));
    },
    [commodities]
  );

  const openModal = useCallback((type, data = null) => {
    setModal({ open: true, type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ open: false, type: "", data: null });
  }, []);

  const handleView = useCallback((commodity) => {
    setSelectedCommodity(commodity);
  }, []);

  const columns = useMemo(
    () => [
      { header: "Commodity Name", accessor: "name" },
      { header: "Actions", accessor: "actions" },
    ],
    []
  );

  const data = useMemo(
    () =>
      commodities.map((commodity, index) => ({
        name: commodity.name,
        actions: (
          <Actions
            key={commodity._id}
            item={{
              title: commodity.name,
              id: commodity._id,
              onEdit: () => openModal("edit", { ...commodity, index }),
              onDelete: () => openModal("delete", { ...commodity, index }),
              onView: () => handleView(commodity),
            }}
          />
        ),
      })),
    [commodities, openModal, handleView]
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Commodity List" />
        <Table data={data} columns={columns} />

        <Pagination
          totalItems={totalEntries}
          itemsPerPage={10}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        {selectedCommodity && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold">Commodity Details</h3>
            <p>Name: {selectedCommodity.name}</p>
          </div>
        )}

        {modal.open && (
          <Modal onClose={closeModal}>
            {modal.type === "edit" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Edit Commodity</h2>
                <input
                  type="text"
                  defaultValue={modal.data.name}
                  className="border p-2 w-full mb-4"
                  id="editCommodityInput"
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={() =>
                    handleEdit(
                      modal.data.index,
                      document.getElementById("editCommodityInput").value
                    )
                  }
                >
                  Save Changes
                </button>
              </div>
            )}
            {modal.type === "delete" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Delete Commodity</h2>
                <p>Are you sure you want to delete {modal.data.name}?</p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded"
                    onClick={() => handleDelete(modal.data.index)}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </Modal>
        )}
      </div>
    </Suspense>
  );
};

export default CommodityList;
