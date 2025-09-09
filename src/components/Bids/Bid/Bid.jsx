"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Save, X } from "lucide-react";
import { fadeIn, slideUp } from "@/utils/motion";

const Bid = () => {
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
    },
    {
      id: 2,
      bidNumber: "BID-2024-002",
      bidDate: "2024-01-20",
      startTime: "10:00",
      endTime: "16:00",
      status: "Active",
      commodityName: "Cement",
      quantity: "200 bags",
      paymentTerms: "15 days",
      delivery: "7 days",
      rate: "$25/bag",
      notes: "Portland cement preferred",
    },
  ]);

  const [editingBid, setEditingBid] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEdit = (bid) => {
    setEditingBid(bid.id);
    setEditData({
      quantity: bid.quantity,
      rate: bid.rate,
      notes: bid.notes,
    });
  };

  const handleSave = () => {
    console.log("Saving bid participation:", editData);
    setEditingBid(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingBid(null);
    setEditData({});
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Participate in Bids</h1>
        <p className="text-gray-600 mt-2">
          View available bids and submit your participation
        </p>
      </div>

      {/* Bids List */}
      <div className="grid gap-6">
        {bids.map((bid, index) => (
          <motion.div
            key={bid.id}
            {...slideUp}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            {/* Header Section */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {bid.bidNumber}
                </h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(
                    bid.status
                  )}`}
                >
                  {bid.status}
                </span>
              </div>

              {/* Action Buttons */}
              {editingBid === bid.id ? (
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleEdit(bid)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Participate
                </motion.button>
              )}
            </div>

            {/* Details Section */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Bid Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">
                  Bid Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Bid Date</div>
                      <div className="font-medium">{bid.bidDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Time</div>
                      <div className="font-medium">
                        {bid.startTime} - {bid.endTime}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Commodity Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">
                  Commodity Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Commodity Name</div>
                    <div className="font-medium">{bid.commodityName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Quantity</div>
                    {editingBid === bid.id ? (
                      <input
                        type="text"
                        value={editData.quantity}
                        onChange={(e) =>
                          setEditData({ ...editData, quantity: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="font-medium">{bid.quantity}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Rate</div>
                    {editingBid === bid.id ? (
                      <input
                        type="text"
                        value={editData.rate}
                        onChange={(e) =>
                          setEditData({ ...editData, rate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="font-medium">{bid.rate}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms & Notes */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">
                  Terms & Notes
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Payment Terms</div>
                    <div className="font-medium">{bid.paymentTerms}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Delivery</div>
                    <div className="font-medium">{bid.delivery}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Notes</div>
                    {editingBid === bid.id ? (
                      <textarea
                        value={editData.notes}
                        onChange={(e) =>
                          setEditData({ ...editData, notes: e.target.value })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    ) : (
                      <div className="font-medium text-gray-700">
                        {bid.notes}
                      </div>
                    )}
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

export default Bid;
