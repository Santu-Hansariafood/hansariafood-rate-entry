"use client";

import React from "react";

const EditCompanyModal = ({ company, onChange, onCancel, onSubmit }) => {
  if (!company) return null;

  const handleLocationChange = (index, field, value) => {
    const updatedLocations = company.location.map((loc, i) => {
      if (i === index) {
        return { ...loc, [field]: value };
      }
      return loc;
    });

    onChange({ ...company, location: updatedLocations });
  };

  const handleAddLocation = () => {
    onChange({
      ...company,
      location: [...company.location, { name: "", state: "" }],
    });
  };

  const handleRemoveLocation = (index) => {
    const updatedLocations = company.location.filter((_, i) => i !== index);
    onChange({ ...company, location: updatedLocations });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Company</h2>

        <form onSubmit={onSubmit}>
          <label className="block mb-4">
            <span className="block mb-1">Company Name:</span>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={company.name}
              onChange={(e) => onChange({ ...company, name: e.target.value })}
            />
          </label>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Locations</h3>
            {company.location.map((loc, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-4 items-center mb-3"
              >
                <input
                  type="text"
                  placeholder="Location"
                  className="p-2 border rounded"
                  value={loc.name}
                  onChange={(e) =>
                    handleLocationChange(index, "name", e.target.value)
                  }
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="State"
                    className="p-2 border rounded w-full"
                    value={loc.state}
                    onChange={(e) =>
                      handleLocationChange(index, "state", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(index)}
                    className="text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddLocation}
              className="text-blue-600 mt-2"
            >
              + Add Location
            </button>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 mr-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCompanyModal;
