"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  User,
  Phone,
  MapPin,
  Mail,
  Search,
} from "lucide-react";
import ParticipantForm from "../ParticipantForm/ParticipantForm"; // ✅ must also have "use client"
import { fadeIn, slideUp } from "@/utils/motion"; // ✅ keep utility animations

const ParticipantList = () => {
  const [participants, setParticipants] = useState([
    {
      id: 1,
      name: "John Smith",
      mobile: "9876543210",
      location: "Mumbai, Maharashtra",
      email: "john.smith@email.com",
      password: "******",
      registeredAt: "2024-01-15 10:30:00",
      status: "Active",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      mobile: "9876543211",
      location: "Delhi, India",
      email: "sarah.johnson@email.com",
      password: "******",
      registeredAt: "2024-01-16 11:15:00",
      status: "Active",
    },
    {
      id: 3,
      name: "Mike Wilson",
      mobile: "9876543212",
      location: "Bangalore, Karnataka",
      email: "mike.wilson@email.com",
      password: "******",
      registeredAt: "2024-01-16 14:20:00",
      status: "Active",
    },
    {
      id: 4,
      name: "David Brown",
      mobile: "9876543213",
      location: "Chennai, Tamil Nadu",
      email: "david.brown@email.com",
      password: "******",
      registeredAt: "2024-01-17 09:45:00",
      status: "Inactive",
    },
    {
      id: 5,
      name: "Lisa Chen",
      mobile: "9876543214",
      location: "Pune, Maharashtra",
      email: "lisa.chen@email.com",
      password: "******",
      registeredAt: "2024-01-17 13:30:00",
      status: "Active",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEdit = (participant) => {
    setEditingParticipant(participant);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const handleSave = (participantData) => {
    if (editingParticipant) {
      setParticipants(
        participants.map((p) =>
          p.id === editingParticipant.id
            ? {
                ...participantData,
                id: editingParticipant.id,
                registeredAt: editingParticipant.registeredAt,
                status: editingParticipant.status,
              }
            : p
        )
      );
    } else {
      const newParticipant = {
        ...participantData,
        id: Date.now(),
        registeredAt: new Date().toLocaleString(),
        status: "Active",
      };
      setParticipants([...participants, newParticipant]);
    }
    setShowForm(false);
    setEditingParticipant(null);
  };

  const getStatusColor = (status) => {
    return status === "Active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Participant List
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all registered participants for bid participation
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Add Participant</span>
        </motion.button>
      </div>

      {/* Search & Table */}
      <motion.div {...slideUp} className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="text-sm text-gray-600">
              Total: {filteredParticipants.length} participants
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Participant Details
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Contact Information
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Registration
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Status
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="border-b hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {p.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{p.location}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{p.mobile}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{p.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    <div>Registered:</div>
                    <div className="font-medium text-gray-900">
                      {p.registeredAt}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        p.status
                      )}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(p)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Edit participant"
                      >
                        <Edit className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete participant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No participants */}
        {filteredParticipants.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No participants found</p>
            <p className="text-sm">
              Try adjusting your search criteria or add new participants
            </p>
          </div>
        )}
      </motion.div>

      {/* Form Modal */}
      {showForm && (
        <ParticipantForm
          participant={editingParticipant}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingParticipant(null);
          }}
        />
      )}
    </motion.div>
  );
};

export default ParticipantList;
