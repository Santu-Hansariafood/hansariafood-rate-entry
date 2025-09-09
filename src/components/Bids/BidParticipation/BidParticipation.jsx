"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Clock,
  Package,
  FileText,
  Save,
  X,
  Edit3,
} from "lucide-react";
import { fadeIn, slideUp } from "@/utils/motion";

const BidParticipation = () => {
  const [bids] = useState([
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
      participants: [
        {
          id: 1,
          name: "John Smith",
          company: "ABC Corp",
          joinedAt: "2024-01-16 10:30",
          quantity: "100 tons",
          rate: "$1150/ton",
          notes: "Can deliver early",
        },
        {
          id: 2,
          name: "Sarah Johnson",
          company: "XYZ Ltd",
          joinedAt: "2024-01-16 11:15",
          quantity: "200 tons",
          rate: "$1180/ton",
          notes: "Bulk discount available",
        },
        {
          id: 3,
          name: "Mike Wilson",
          company: "Steel Pro",
          joinedAt: "2024-01-16 14:20",
          quantity: "150 tons",
          rate: "$1200/ton",
          notes: "Premium quality guaranteed",
        },
      ],
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
      participants: [
        {
          id: 1,
          name: "David Brown",
          company: "Build Co",
          joinedAt: "2024-01-21 09:45",
          quantity: "50 bags",
          rate: "$24/bag",
          notes: "Local supplier",
        },
        {
          id: 2,
          name: "Lisa Chen",
          company: "Cement Plus",
          joinedAt: "2024-01-21 13:30",
          quantity: "100 bags",
          rate: "$25/bag",
          notes: "Fast delivery available",
        },
      ],
    },
  ]);

  const [editingBid, setEditingBid] = useState(null);
  const [editData, setEditData] = useState({
    quantity: "",
    rate: "",
    notes: "",
  });

  const handleEdit = (bid) => {
    setEditingBid(bid.id);
    setEditData({
      quantity: bid.quantity,
      rate: bid.rate,
      notes: bid.notes,
    });
  };

  const handleSave = () => {
    console.log("Saving participation data:", editData);
    setEditingBid(null);
    setEditData({ quantity: "", rate: "", notes: "" });
  };

  const handleCancel = () => {
    setEditingBid(null);
    setEditData({ quantity: "", rate: "", notes: "" });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bid Participation</h1>
          <p className="text-gray-600 mt-2">
            View and participate in available bids
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {bids.map((bid, index) => (
          <motion.div
            key={bid.id}
            {...slideUp}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {bid.bidNumber}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        bid.status
                      )}`}
                    >
                      {bid.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{bid.bidDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {bid.startTime} - {bid.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Participate button */}
                {editingBid !== bid.id && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleEdit(bid)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Participate</span>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Bid Details */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Bid Details</span>
                  </h4>

                  <div className="space-y-4">
                    {/* Commodity + Payment Terms */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Commodity Name
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                          {bid.commodityName}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Terms
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                          {bid.paymentTerms}
                        </div>
                      </div>
                    </div>

                    {/* Delivery + Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                          {bid.delivery}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                          {bid.status}
                        </div>
                      </div>
                    </div>

                    {/* Editable Quantity + Rate */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        {editingBid === bid.id ? (
                          <input
                            type="text"
                            value={editData.quantity}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                quantity: e.target.value,
                              })
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter quantity"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                            {bid.quantity}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rate
                        </label>
                        {editingBid === bid.id ? (
                          <input
                            type="text"
                            value={editData.rate}
                            onChange={(e) =>
                              setEditData({ ...editData, rate: e.target.value })
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter rate"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                            {bid.rate}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      {editingBid === bid.id ? (
                        <textarea
                          value={editData.notes}
                          onChange={(e) =>
                            setEditData({ ...editData, notes: e.target.value })
                          }
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter notes"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                          {bid.notes}
                        </div>
                      )}
                    </div>

                    {/* Save + Cancel */}
                    {editingBid === bid.id && (
                      <div className="flex space-x-3 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSave}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                        >
                          <Save className="h-4 w-4" />
                          <span>Save Participation</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleCancel}
                          className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Participants */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Participants ({bid.participants.length})</span>
                  </h4>

                  <div className="space-y-3">
                    {bid.participants.map((participant) => (
                      <motion.div
                        key={participant.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-semibold text-gray-900">
                              {participant.name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {participant.company}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {participant.joinedAt}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Quantity: </span>
                            <span className="font-medium text-gray-900">
                              {participant.quantity}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Rate: </span>
                            <span className="font-medium text-gray-900">
                              {participant.rate}
                            </span>
                          </div>
                        </div>
                        {participant.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <FileText className="h-3 w-3 inline mr-1" />
                            {participant.notes}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default BidParticipation;
