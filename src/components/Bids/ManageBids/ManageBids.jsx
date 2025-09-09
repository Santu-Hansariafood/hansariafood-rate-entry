"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Package,
  DollarSign,
} from "lucide-react";
import BidForm from "../BidForm/BidForm";
import { fadeIn, slideUp } from "@/utils/motion";

const ManageBids = () => {
  const [bids, setBids] = useState([
    {
      id: 1,
      bidNumber: "BID-2024-001",
      bidDate: "2024-01-15",
      startTime: "09:00",
      endTime: "17:00",
      status: "Active",
      commodityName: "Steel Rods",
      quantity: "500 tons",
      paymentTerms: "30 days",
      delivery: "15 days",
      rate: "$1200/ton",
      notes: "Quality grade A required",
    },
    {
      id: 2,
      bidNumber: "BID-2024-002",
      bidDate: "2024-01-20",
      startTime: "10:00",
      endTime: "16:00",
      status: "Pending",
      commodityName: "Cement",
      quantity: "200 bags",
      paymentTerms: "15 days",
      delivery: "7 days",
      rate: "$25/bag",
      notes: "Portland cement preferred",
    },
  ]);

  const [acceptedBids, setAcceptedBids] = useState([]);
  const [showAcceptedList, setShowAcceptedList] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBid, setEditingBid] = useState(null);

  const handleEdit = (bid) => {
    setEditingBid(bid);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setBids(bids.filter((bid) => bid.id !== id));
  };

  const handleSave = (bidData) => {
    if (editingBid) {
      setBids(
        bids.map((bid) =>
          bid.id === editingBid.id ? { ...bidData, id: editingBid.id } : bid
        )
      );
    } else {
      setBids([...bids, { ...bidData, id: Date.now() }]);
    }
    setShowForm(false);
    setEditingBid(null);
  };

  const handleApprove = (bid) => {
    const updatedBid = {
      ...bid,
      status: "Accepted",
      approvedAt: new Date().toISOString(),
    };
    setAcceptedBids([...acceptedBids, updatedBid]);
    setBids(bids.map((b) => (b.id === bid.id ? updatedBid : b)));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Closed":
        return "bg-red-100 text-red-800";
      case "Accepted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Bids</h1>
          <p className="text-gray-600 mt-2">
            Create, edit, and manage all bidding activities
          </p>
        </div>
        <div className="flex items-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Bid</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAcceptedList(!showAcceptedList)}
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 ml-3"
          >
            <span>Accepted Bids ({acceptedBids.length})</span>
          </motion.button>
        </div>
      </div>

      {/* Bids Table */}
      <motion.div
        {...slideUp}
        className="bg-white rounded-xl shadow-sm border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Bid Details
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Schedule
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Commodity
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Terms
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bids.map((bid, index) => (
                <motion.tr
                  key={bid.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900">
                        {bid.bidNumber}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{bid.bidDate}</span>
                      </div>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          bid.status
                        )}`}
                      >
                        {bid.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {bid.startTime} - {bid.endTime}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        {bid.commodityName}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Package className="h-4 w-4" />
                        <span>{bid.quantity}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>{bid.rate}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Payment: {bid.paymentTerms}</div>
                      <div>Delivery: {bid.delivery}</div>
                      {bid.notes && (
                        <div className="text-xs text-gray-500 italic">
                          {bid.notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(bid)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(bid.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleApprove(bid)}
                        disabled={bid.status === "Accepted"}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          bid.status === "Accepted"
                            ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                      >
                        <span className="text-xs font-medium">
                          {bid.status === "Accepted" ? "✓" : "Approve"}
                        </span>
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Form Popup */}
      {showForm && (
        <BidForm
          bid={editingBid}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingBid(null);
          }}
        />
      )}

      {/* Accepted Bids */}
      {showAcceptedList && (
        <motion.div
          {...slideUp}
          className="bg-white rounded-xl shadow-sm border overflow-hidden"
        >
          <div className="p-6 border-b bg-green-50">
            <h3 className="text-xl font-semibold text-green-800">
              Accepted Bids
            </h3>
            <p className="text-green-600 mt-1">
              List of approved and accepted bids
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Bid Details
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Commodity
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Terms
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Approved At
                  </th>
                </tr>
              </thead>
              <tbody>
                {acceptedBids.map((bid, index) => (
                  <motion.tr
                    key={bid.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b hover:bg-green-50 transition-colors duration-200"
                  >
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">
                          {bid.bidNumber}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{bid.bidDate}</span>
                        </div>
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {bid.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">
                          {bid.commodityName}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Package className="h-4 w-4" />
                          <span>{bid.quantity}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span>{bid.rate}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Payment: {bid.paymentTerms}</div>
                        <div>Delivery: {bid.delivery}</div>
                        {bid.notes && (
                          <div className="text-xs text-gray-500 italic">
                            {bid.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600">
                        {new Date(bid.approvedAt).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(bid.approvedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {acceptedBids.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-8 px-6 text-center text-gray-500"
                    >
                      No accepted bids yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ManageBids;
