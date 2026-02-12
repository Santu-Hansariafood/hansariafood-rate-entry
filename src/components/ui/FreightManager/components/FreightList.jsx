import React from "react";
import Table from "@/components/common/Tables/Tables";
import SearchBox from "@/components/common/SearchBox/SearchBox";
import {
  MapPin,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

const FreightList = ({
  freights,
  pagination,
  setPagination,
  searchTerm,
  setSearchTerm,
  selectedCreator,
  setSelectedCreator,
  creators,
  setViewingFreight,
  handleEdit,
  handleDelete,
}) => {
  const getRateDifference = (current, previous) => {
    if (!previous)
      return { icon: <Minus size={14} />, color: "text-gray-500", diff: 0 };
    const diff = current - previous;
    if (diff > 0)
      return {
        icon: <ArrowUp size={14} />,
        color: "text-red-500",
        diff: `+${diff}`,
      };
    if (diff < 0)
      return {
        icon: <ArrowDown size={14} />,
        color: "text-green-500",
        diff: diff,
      };
    return { icon: <Minus size={14} />, color: "text-gray-500", diff: 0 };
  };

  const columns = [
    {
      header: "ID",
      accessor: "_id",
      cell: (item) => (
        <span className="font-mono text-gray-500">
          #{item._id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      header: "Source Location",
      accessor: "location",
      cell: (item) => (
        <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
          <MapPin size={14} className="text-gray-400" /> {item.location}
        </div>
      ),
    },
    {
      header: "Destination Location",
      accessor: "deliveryLocation",
      cell: (item) => (
        <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
          <MapPin size={14} className="text-gray-400" /> {item.deliveryLocation}
        </div>
      ),
    },
    {
      header: "Rate (₹)",
      accessor: "freightRate",
      cell: (item) => {
        const { icon, color, diff } = getRateDifference(
          item.freightRate,
          item.previousRate
        );
        return (
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
              ₹{item.freightRate}
            </span>
            {diff !== 0 && (
              <span
                className={`flex items-center text-xs font-bold ${color} bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded-md`}
              >
                {icon} {Math.abs(diff)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Added By",
      accessor: "createdBy",
      cell: (item) => (
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {item.createdBy || <span className="text-gray-400 italic">Unknown</span>}
        </div>
      ),
    },
    {
      header: "Actions",
      cell: (item) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setViewingFreight(item)}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="View"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleEdit(item)}
            className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(item._id)}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Freight List
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
          <select
            value={selectedCreator}
            onChange={(e) => setSelectedCreator(e.target.value)}
            className="w-full sm:w-48 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-200 h-10"
          >
            <option value="">All Users</option>
            {creators &&
              creators.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
          <div className="w-full sm:w-72">
            <SearchBox
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search company or location..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <Table data={freights} columns={columns} />

        {pagination.totalPages > 1 && (
          <div className="flex justify-center p-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreightList;
