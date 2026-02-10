import React from "react";
import Dropdown from "@/components/common/Dropdown/Dropdown";
import {
  MapPin,
  Building2,
  Truck,
  DollarSign,
  Save,
  Loader2,
  ArrowRight,
} from "lucide-react";

const FreightForm = ({ context, isEdit = false }) => {
  const {
    loading,
    selectedCommodity,
    formData,
    setFormData,
    sourceLocations,
    deliveryLocations,
    sellerCompanies,
    buyerCompanies,
    handleCompanyChange,
    handleDeliveryCompanyChange,
    handleSubmit,
  } = context;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        <div className="space-y-4 p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Building2 size={16} /> Source Details
          </h3>

          <div className="space-y-2">
            <Dropdown
              key={`source-company-${selectedCommodity}`}
              label="Company Name"
              options={sellerCompanies.map((c) => ({
                label: c.name,
                value: c._id,
              }))}
              value={formData.company}
              onChange={handleCompanyChange}
              placeholder="Select Seller Company"
            />
          </div>

          <div className="space-y-2">
            <Dropdown
              key={`source-location-${selectedCommodity}-${formData.company}`}
              label="Assign Location"
              options={sourceLocations.map((loc) => ({
                label: loc,
                value: loc,
              }))}
              value={formData.location}
              onChange={(val) => setFormData({ ...formData, location: val })}
              placeholder="Select Location"
              disabled={!formData.company}
            />
          </div>
        </div>

        <div className="space-y-4 p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Truck size={16} /> Delivery Details
          </h3>

          <div className="space-y-2">
            <Dropdown
              key={`delivery-company-${selectedCommodity}`}
              label="Delivery Company"
              options={buyerCompanies.map((c) => ({
                label: c.name,
                value: c._id,
              }))}
              value={formData.deliveryCompany}
              onChange={handleDeliveryCompanyChange}
              placeholder="Select Buyer Company"
            />
          </div>

          <div className="space-y-2">
            <Dropdown
              key={`delivery-location-${selectedCommodity}-${formData.deliveryCompany}`}
              label="Assign Location"
              options={deliveryLocations.map((loc) => ({
                label: loc,
                value: loc,
              }))}
              value={formData.deliveryLocation}
              onChange={(val) =>
                setFormData({ ...formData, deliveryLocation: val })
              }
              placeholder="Select Location"
              disabled={!formData.deliveryCompany}
            />
          </div>
        </div>

        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-600 items-center justify-center shadow-sm z-10">
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
        <div className="max-w-md mx-auto space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2">
            <DollarSign size={16} /> Freight Rate (₹/MT)
          </label>
          <input
            type="number"
            value={formData.freightRate}
            onChange={(e) =>
              setFormData({ ...formData, freightRate: e.target.value })
            }
            placeholder="Enter freight rate..."
            className="w-full px-4 py-3 text-center text-lg font-bold rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isEdit ? "Update Freight" : "Add Freight"}
        </button>
      </div>
    </form>
  );
};

export default FreightForm;
