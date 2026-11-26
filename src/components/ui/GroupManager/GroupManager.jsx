"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Modal from "@/components/common/Modal/Modal";
import Pagination from "@/components/common/Pagination/Pagination";
import Table from "@/components/common/Tables/Tables";

const ITEMS_PER_PAGE = 10;

function getErrorMessage(error) {
  return (
    error.response?.data?.error ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

function CompanyMultiSelect({
  companies,
  selectedIds,
  onChange,
  excludedCompanyIds,
  loadingAssignments,
  assignmentError,
}) {
  const [search, setSearch] = useState("");
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();
    return companies.filter(
      (company) =>
        !excludedCompanyIds.has(company._id) &&
        (!query || company.name.toLowerCase().includes(query)),
    );
  }, [companies, excludedCompanyIds, search]);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Companies
      </label>
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search companies..."
        className="mb-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      />
      <div className="max-h-52 overflow-y-auto rounded-lg border border-gray-200 p-2 dark:border-gray-700">
        {loadingAssignments ? (
          <p className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400">
            Loading group assignments...
          </p>
        ) : assignmentError ? (
          <p role="alert" className="px-2 py-3 text-sm text-red-600 dark:text-red-400">
            {assignmentError}
          </p>
        ) : filteredCompanies.length ? (
          filteredCompanies.map((company) => (
            <label
              key={company._id}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <input
                type="checkbox"
                checked={selected.has(company._id)}
                onChange={(event) => {
                  onChange(
                    event.target.checked
                      ? [...selectedIds, company._id]
                      : selectedIds.filter((id) => id !== company._id),
                  );
                }}
                className="h-4 w-4 accent-emerald-600"
              />
              <span>{company.name}</span>
            </label>
          ))
        ) : (
          <p className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400">
            No available companies found.
          </p>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {selectedIds.length} selected
      </p>
    </div>
  );
}

function GroupFields({
  name,
  onNameChange,
  selectedIds,
  onSelectedIdsChange,
  companies,
  excludedCompanyIds,
  loadingAssignments,
  assignmentError,
}) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="group-name"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Group name
        </label>
        <input
          id="group-name"
          type="text"
          maxLength={120}
          required
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Enter group name"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
      <CompanyMultiSelect
        companies={companies}
        selectedIds={selectedIds}
        onChange={onSelectedIdsChange}
        excludedCompanyIds={excludedCompanyIds}
        loadingAssignments={loadingAssignments}
        assignmentError={assignmentError}
      />
    </div>
  );
}

export default function GroupManager() {
  const [groups, setGroups] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [totalGroups, setTotalGroups] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCompanyIds, setEditCompanyIds] = useState([]);
  const [assignedCompanyIds, setAssignedCompanyIds] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [assignmentError, setAssignmentError] = useState("");
  const [viewingGroup, setViewingGroup] = useState(null);
  const [deletingGroup, setDeletingGroup] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const excludedCompanyIds = useMemo(
    () => new Set(assignedCompanyIds),
    [assignedCompanyIds],
  );
  const excludedEditCompanyIds = useMemo(() => {
    const currentGroupCompanyIds = new Set(
      (editingGroup?.companies || []).map((company) => company._id),
    );
    return new Set(
      assignedCompanyIds.filter((companyId) => !currentGroupCompanyIds.has(companyId)),
    );
  }, [assignedCompanyIds, editingGroup]);

  const fetchGroups = useCallback(
    async (page = currentPage, search = debouncedSearch) => {
      setLoadingGroups(true);
      setError("");
      try {
        const response = await axiosInstance.get(
          `/groups?page=${page}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(search)}`,
        );
        setGroups(response.data.groups || []);
        setTotalGroups(response.data.total || 0);
      } catch (fetchError) {
        console.error("Failed to fetch groups", fetchError);
        setError(getErrorMessage(fetchError));
      } finally {
        setLoadingGroups(false);
      }
    },
    [currentPage, debouncedSearch],
  );

  const fetchAssignedCompanyIds = useCallback(async () => {
    setLoadingAssignments(true);
    setAssignmentError("");
    try {
      const firstResponse = await axiosInstance.get("/groups?page=1&limit=100");
      const allGroups = firstResponse.data.groups || [];
      const totalPages = firstResponse.data.totalPages || 1;

      for (let page = 2; page <= totalPages; page += 1) {
        const response = await axiosInstance.get(
          `/groups?page=${page}&limit=100`,
        );
        allGroups.push(...(response.data.groups || []));
      }

      const companyIds = allGroups.flatMap((group) =>
        (group.companies || [])
          .map((company) => company?._id || company)
          .filter(Boolean)
          .map((companyId) => companyId.toString()),
      );
      setAssignedCompanyIds([...new Set(companyIds)]);
    } catch (fetchError) {
      console.error("Failed to fetch company group assignments", fetchError);
      setAssignmentError(getErrorMessage(fetchError));
    } finally {
      setLoadingAssignments(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    fetchGroups(currentPage, debouncedSearch);
  }, [fetchGroups, currentPage, debouncedSearch]);

  useEffect(() => {
    fetchAssignedCompanyIds();
  }, [fetchAssignedCompanyIds]);

  useEffect(() => {
    let cancelled = false;

    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const firstResponse = await axiosInstance.get(
          "/companies?page=1&limit=100",
        );
        const companyData = firstResponse.data.companies || [];
        const totalPages = firstResponse.data.totalPages || 1;

        for (let page = 2; page <= totalPages; page += 1) {
          const response = await axiosInstance.get(
            `/companies?page=${page}&limit=100`,
          );
          companyData.push(...(response.data.companies || []));
        }

        if (!cancelled) {
          setCompanies(companyData);
        }
      } catch (fetchError) {
        console.error("Failed to fetch companies for groups", fetchError);
        if (!cancelled) {
          setError(getErrorMessage(fetchError));
        }
      } finally {
        if (!cancelled) {
          setLoadingCompanies(false);
        }
      }
    };

    fetchCompanies();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await axiosInstance.post("/groups", {
        name: groupName,
        companies: selectedCompanyIds,
      });
      setGroupName("");
      setSelectedCompanyIds([]);
      setSearchQuery("");
      setDebouncedSearch("");
      setCurrentPage(1);
      await Promise.all([
        fetchGroups(1, ""),
        fetchAssignedCompanyIds(),
      ]);
    } catch (saveError) {
      console.error("Failed to create group", saveError);
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (group) => {
    setEditingGroup(group);
    setEditName(group.name);
    setEditCompanyIds((group.companies || []).map((company) => company._id));
    setError("");
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await axiosInstance.put(`/groups/${editingGroup._id}`, {
        name: editName,
        companies: editCompanyIds,
      });
      setEditingGroup(null);
      await Promise.all([
        fetchGroups(currentPage, debouncedSearch),
        fetchAssignedCompanyIds(),
      ]);
    } catch (updateError) {
      console.error("Failed to update group", updateError);
      setError(getErrorMessage(updateError));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setError("");
    try {
      await axiosInstance.delete(`/groups/${deletingGroup._id}`);
      setDeletingGroup(null);
      const nextPage =
        groups.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      if (nextPage !== currentPage) {
        setCurrentPage(nextPage);
      } else {
        await fetchGroups(nextPage, debouncedSearch);
      }
      await fetchAssignedCompanyIds();
    } catch (deleteError) {
      console.error("Failed to delete group", deleteError);
      setError(getErrorMessage(deleteError));
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      { header: "No.", accessor: "serial" },
      { header: "Group", accessor: "name" },
      { header: "Companies", accessor: "companies" },
      { header: "Actions", accessor: "actions" },
    ],
    [],
  );

  const tableData = useMemo(
    () =>
      groups.map((group, index) => ({
        serial: (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
        name: group.name,
        companies:
          group.companies?.map((company) => company.name).join(", ") ||
          "No companies",
        actions: (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewingGroup(group)}
              aria-label={`View ${group.name}`}
              title="View"
              className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-700"
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              onClick={() => openEdit(group)}
              aria-label={`Edit ${group.name}`}
              title="Edit"
              className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                setDeletingGroup(group);
                setError("");
              }}
              aria-label={`Delete ${group.name}`}
              title="Delete"
              className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      })),
    [groups, currentPage],
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-900 dark:bg-gray-900 dark:text-gray-100 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-2xl font-semibold">Company Groups</h1>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6"
        >
          <div>
            <h2 className="text-lg font-semibold">Create Group</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Give the group a name and select its companies.
            </p>
          </div>
          <GroupFields
            name={groupName}
            onNameChange={setGroupName}
            selectedIds={selectedCompanyIds}
            onSelectedIdsChange={setSelectedCompanyIds}
            companies={companies}
            excludedCompanyIds={excludedCompanyIds}
            loadingAssignments={loadingAssignments}
            assignmentError={assignmentError}
          />
          <button
            type="submit"
            disabled={
              saving || loadingCompanies || loadingAssignments || Boolean(assignmentError)
            }
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={18} />
            {saving ? "Saving..." : "Create Group"}
          </button>
        </form>

        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Group List</h2>
            <label className="relative block w-full sm:max-w-sm">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search groups..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
            </label>
          </div>

          {loadingGroups ? (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Loading groups...
            </p>
          ) : (
            <Table data={tableData} columns={columns} />
          )}

          {totalGroups > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalGroups}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          )}
        </section>
      </div>

      {editingGroup && (
        <Modal onClose={() => setEditingGroup(null)} className="max-w-2xl">
          <form onSubmit={handleUpdate} className="space-y-5 p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Edit Group</h2>
            {error && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            <GroupFields
              name={editName}
              onNameChange={setEditName}
              selectedIds={editCompanyIds}
              onSelectedIdsChange={setEditCompanyIds}
              companies={companies}
              excludedCompanyIds={excludedEditCompanyIds}
              loadingAssignments={loadingAssignments}
              assignmentError={assignmentError}
            />
            <button
              type="submit"
              disabled={
                saving || loadingCompanies || loadingAssignments || Boolean(assignmentError)
              }
              className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </Modal>
      )}

      {viewingGroup && (
        <Modal onClose={() => setViewingGroup(null)} className="max-w-xl">
          <div className="space-y-4 p-5 sm:p-6">
            <h2 className="text-lg font-semibold">{viewingGroup.name}</h2>
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Companies
              </h3>
              {viewingGroup.companies?.length ? (
                <ul className="max-h-64 space-y-2 overflow-y-auto">
                  {viewingGroup.companies.map((company) => (
                    <li
                      key={company._id}
                      className="rounded-lg bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800"
                    >
                      {company.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No companies assigned to this group.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {deletingGroup && (
        <Modal onClose={() => setDeletingGroup(null)} className="max-w-md">
          <div className="space-y-4 p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Delete Group</h2>
            {error && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Delete the group {deletingGroup.name}? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingGroup(null)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm dark:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
