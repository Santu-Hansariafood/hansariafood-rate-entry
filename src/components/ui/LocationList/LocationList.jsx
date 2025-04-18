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
import { toast } from "react-toastify";
import stateData from "@/data/state-city.json";

const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading />,
});
const Table = dynamic(() => import("@/components/common/Tables/Tables"), {
  loading: () => <Loading />,
});
const Actions = dynamic(() => import("@/components/common/Actions/Actions"), {
  loading: () => <Loading />,
});
const Pagination = dynamic(
  () => import("@/components/common/Pagination/Pagination"),
  {
    loading: () => <Loading />,
  }
);
const Modal = dynamic(() => import("@/components/common/Modal/Modal"), {
  loading: () => <Loading />,
});

const LocationList = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", state: "" });
  const [totalEntries, setTotalEntries] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const states = useMemo(() => stateData.map((item) => item.state), []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axiosInstance.get(
          `/location?page=${currentPage}&limit=${itemsPerPage}`
        );
        const sorted = response.data.locations?.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setLocations(sorted || []);
        setTotalEntries(response.data.total || 0);
      } catch (error) {
        toast.error("Error fetching locations");
      }
    };

    fetchLocations();
  }, [currentPage]);

  const handleDelete = useCallback(async (id) => {
    try {
      await axiosInstance.delete(`/location/${id}`);
      setLocations((prev) => prev.filter((loc) => loc._id !== id));
      toast.success("Location deleted successfully");
      setShowModal(false);
    } catch (error) {
      toast.error("Failed to delete location");
    }
  }, []);

  const handleEdit = useCallback(async () => {
    try {
      const { _id } = selectedLocation;
      const { data } = await axiosInstance.put(`/location/${_id}`, formData);
      setLocations((prev) =>
        prev
          .map((loc) => (loc._id === _id ? data.location : loc))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.success("Location updated successfully");
      setShowModal(false);
    } catch (error) {
      toast.error("Failed to update location");
    }
  }, [formData, selectedLocation]);

  const handleView = useCallback((location) => {
    setSelectedLocation(location);
    setShowModal(true);
    setEditMode(false);
  }, []);

  const handleEditClick = useCallback((location) => {
    setSelectedLocation(location);
    setFormData({ name: location.name, state: location.state });
    setEditMode(true);
    setShowModal(true);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const columns = useMemo(
    () => [
      { header: "Location Name", accessor: "name" },
      { header: "State", accessor: "state" },
      { header: "Actions", accessor: "actions" },
    ],
    []
  );

  const paginatedLocations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return locations.slice(start, start + itemsPerPage);
  }, [locations, currentPage]);

  const data = useMemo(
    () =>
      locations.map((location) => ({
        name: location.name,
        state: location.state,
        actions: (
          <Actions
            item={{
              title: location.name,
              id: location._id,
              onView: () => handleView(location),
              onEdit: () => handleEditClick(location),
              onDelete: () => handleDelete(location._id),
            }}
          />
        ),
      })),
    [locations, handleDelete, handleEditClick, handleView]
  );

  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(startEntry + itemsPerPage - 1, totalEntries);

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Location List" />
        <Table data={data} columns={columns} />
        <Pagination
          currentPage={currentPage}
          totalItems={totalEntries}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />

        {showModal && (
          <Modal
            title={editMode ? "Edit Location" : "Location Details"}
            onClose={() => setShowModal(false)}
          >
            {editMode ? (
              <div className="space-y-4 p-4">
                <label className="block">
                  <span className="text-gray-700 font-semibold">
                    Location Name
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                    placeholder="Enter location name"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 font-semibold">State</span>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                  >
                    <option value="" disabled>
                      Select a state
                    </option>
                    {states.map((state, index) => (
                      <option key={index} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <p>
                  <strong>State:</strong> {selectedLocation?.state}
                </p>
                <p>
                  <strong>Name:</strong> {selectedLocation?.name}
                </p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => handleDelete(selectedLocation._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Close
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

export default LocationList;
