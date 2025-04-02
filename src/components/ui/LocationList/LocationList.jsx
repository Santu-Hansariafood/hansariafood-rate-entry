"use client";

import React, { Suspense, useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import { toast } from "react-toastify";
import stateData from "@/data/state-city.json";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const Table = dynamic(() => import("@/components/common/Tables/Tables"));
const Actions = dynamic(() => import("@/components/common/Actions/Actions"));
const Modal = dynamic(() => import("@/components/common/Modal/Modal"));

const LocationList = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", state: "" });
  const [states, setStates] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get("/api/location");
        setLocations(response.data.locations || []);
      } catch (error) {
        toast.error("Error fetching locations");
      }
    };

    const stateNames = stateData.map((item) => item.state);
    setStates(stateNames);

    fetchLocations();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/location/${id}`);
      setLocations((prev) => prev.filter((location) => location._id !== id));
      toast.success("Location deleted successfully");
      setShowModal(false);
    } catch (error) {
      toast.error("Failed to delete location");
    }
  };

  const handleEdit = async () => {
    try {
      const { _id } = selectedLocation;
      const response = await axios.put(`/api/location/${_id}`, formData);
      setLocations((prev) =>
        prev.map((loc) => (loc._id === _id ? response.data.location : loc))
      );
      toast.success("Location updated successfully");
      setShowModal(false);
    } catch (error) {
      toast.error("Failed to update location");
    }
  };

  const handleView = (location) => {
    setSelectedLocation(location);
    setShowModal(true);
    setEditMode(false);
  };

  const handleEditClick = (location) => {
    setSelectedLocation(location);
    setFormData({ name: location.name, state: location.state });
    setEditMode(true);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const columns = [
    { header: "Location Name", accessor: "name" },
    { header: "State", accessor: "state" },
    { header: "Actions", accessor: "actions" },
  ];

  const data = locations.map((location) => ({
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
  }));

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Location List" />
        <Table data={data} columns={columns} />
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
