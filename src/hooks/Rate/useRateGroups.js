"use client";

import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const GROUPS_PER_PAGE = 12;

export default function useRateGroups(searchQuery = "") {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => a.name.localeCompare(b.name)),
    [groups],
  );
  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return sortedGroups;

    return sortedGroups.filter(
      (group) =>
        group.name.toLocaleLowerCase().includes(query) ||
        (group.companies || []).some((company) =>
          company?.name?.toLocaleLowerCase().includes(query),
        ),
    );
  }, [searchQuery, sortedGroups]);
  const visibleGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * GROUPS_PER_PAGE;
    return filteredGroups.slice(startIndex, startIndex + GROUPS_PER_PAGE);
  }, [currentPage, filteredGroups]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchGroups = async () => {
      setLoading(true);
      try {
        const firstResponse = await axiosInstance.get(
          "/groups?page=1&limit=100&includeLocations=true",
          { signal: controller.signal },
        );
        const groupData = firstResponse.data.groups || [];
        const totalPages = firstResponse.data.totalPages || 1;

        for (let page = 2; page <= totalPages; page += 1) {
          const response = await axiosInstance.get(
            `/groups?page=${page}&limit=100&includeLocations=true`,
            { signal: controller.signal },
          );
          groupData.push(...(response.data.groups || []));
        }

        if (!controller.signal.aborted) {
          setGroups(groupData);
          setError("");
          setLoaded(true);
        }
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          console.error("Failed to load groups for rate management", fetchError);
          setError(
            fetchError.response?.data?.error || "Failed to load company groups",
          );
          setLoaded(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchGroups();
    return () => controller.abort();
  }, []);

  return {
    groups: sortedGroups,
    filteredGroups,
    visibleGroups,
    loading,
    loaded,
    error,
    currentPage,
    setCurrentPage,
    totalGroups: filteredGroups.length,
    itemsPerPage: GROUPS_PER_PAGE,
  };
}
