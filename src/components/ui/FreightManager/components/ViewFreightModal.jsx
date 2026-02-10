import React from "react";
import Modal from "@/components/common/Modal/Modal";
import { Building2, MapPin, Truck } from "lucide-react";

const ViewFreightModal = ({ viewingFreight, setViewingFreight }) => {
    if (!viewingFreight) return null;

    return (
        <Modal onClose={() => setViewingFreight(null)} className="max-w-lg">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Freight Details
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-gray-500">ID</span>
                  <span className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200">
                    #{viewingFreight._id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Commodity
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {viewingFreight.commodity}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                    <Building2 size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Source
                    </span>
                  </div>
                  <div className="font-bold text-gray-900 dark:text-gray-100">
                    {viewingFreight.company?.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <MapPin size={12} /> {viewingFreight.location}
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                    <Truck size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Delivery
                    </span>
                  </div>
                  <div className="font-bold text-gray-900 dark:text-gray-100">
                    {viewingFreight.deliveryCompany?.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <MapPin size={12} /> {viewingFreight.deliveryLocation}
                  </div>
                </div>
              </div>

              <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30 text-center">
                <label className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1 block">
                  Freight Rate
                </label>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  ₹{viewingFreight.freightRate}
                  <span className="text-lg text-gray-500 font-medium ml-1">
                    /MT
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
    );
};

export default ViewFreightModal;
