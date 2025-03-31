'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { X, Plus, Loader2, Check, Trash2 } from 'lucide-react';
import Table from '@/components/common/Tables/Tables';

export default function RegisterList() {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/register');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/managecompany');
      if (!res.ok) throw new Error('Failed to fetch companies');
      const data = await res.json();
      setCompanies(data.companies);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch companies');
    }
  };

  const handleOpenPopup = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClosePopup = () => {
    setOpen(false);
    setSelectedCompanies([]);
    setSelectedLocations([]);
    setSelectedUser(null);
  };

  const handleCompanyChange = (companyId) => {
    if (!selectedCompanies.includes(companyId)) {
      setSelectedCompanies([...selectedCompanies, companyId]);
    }
  };

  const handleRemoveCompany = (companyId) => {
    setSelectedCompanies(selectedCompanies.filter(id => id !== companyId));
    setSelectedLocations(selectedLocations.filter(loc => {
      const company = companies.find(c => c._id === companyId);
      return !company?.location.includes(loc);
    }));
  };

  const handleSave = async () => {
    if (!selectedCompanies.length || !selectedLocations.length) {
      toast.error('Please select at least one company and location');
      return;
    }

    try {
      setIsLoading(true);
      // Add your API call here to save the user's companies and locations
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      toast.success('Companies and locations assigned successfully');
      handleClosePopup();
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error(error);
      toast.error('Failed to assign companies and locations');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Mobile', accessor: 'mobile' },
    // { header: 'Email', accessor: 'email' },
    { header: 'Action', accessor: 'action' }
  ];

  const usersWithActions = users.map(user => ({
    ...user,
    action: (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleOpenPopup(user)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
      >
        <Plus size={16} />
        Add Company
      </motion.button>
    )
  }));

  return (
    <div className="p-4 m-4 w-full max-w-6xl mx-auto bg-white shadow-lg rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Registered Users</h2>
        {isLoading && (
          <div className="flex items-center gap-2 text-blue-500">
            <Loader2 className="animate-spin" size={20} />
            <span>Loading...</span>
          </div>
        )}
      </div>
      <Table data={usersWithActions} columns={columns} />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-6 rounded-xl w-[500px] shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Assign Companies and Locations</h3>
                <button
                  onClick={handleClosePopup}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Company
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    value=""
                  >
                    <option value="" disabled>Choose a company</option>
                    {companies
                      .filter(company => !selectedCompanies.includes(company._id))
                      .map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.name}
                        </option>
                      ))}
                  </select>
                </div>

                {selectedCompanies.map((companyId) => {
                  const company = companies.find(c => c._id === companyId);
                  return company ? (
                    <div key={companyId} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-800">{company.name}</h4>
                        <button
                          onClick={() => handleRemoveCompany(companyId)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {company.location.map((loc) => (
                          <label
                            key={loc}
                            className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              value={loc}
                              checked={selectedLocations.includes(loc)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedLocations([...selectedLocations, loc]);
                                } else {
                                  setSelectedLocations(selectedLocations.filter((l) => l !== loc));
                                }
                              }}
                              className="rounded text-blue-500 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{loc}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClosePopup}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isLoading || !selectedCompanies.length || !selectedLocations.length}
                  className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}