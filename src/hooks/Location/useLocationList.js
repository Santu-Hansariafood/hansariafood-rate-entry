"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import stateData from "@/data/state-city.json";

export default function useLocationList(itemsPerPage = 10) {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", state: "" });
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const states = useMemo(() => stateData.map((item) => item.state), []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axiosInstance.get(
          `/location?page=${currentPage}&limit=${itemsPerPage}`
        );
        const sorted = res.data.locations?.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setLocations(sorted || []);
        setTotalEntries(res.data.total || 0);
      } catch (error) {
        toast.error("Error fetching locations");
      }
    };

    fetchLocations();
  }, [currentPage, itemsPerPage]);

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

  const paginatedLocations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return locations.slice(start, start + itemsPerPage);
  }, [locations, currentPage, itemsPerPage]);

  return {
    states,
    locations,
    formData,
    setFormData,
    selectedLocation,
    setShowModal,
    showModal,
    editMode,
    currentPage,
    setCurrentPage,
    totalEntries,
    handleDelete,
    handleEdit,
    handleView,
    handleEditClick,
    handleInputChange,
    paginatedLocations,
  };
}
