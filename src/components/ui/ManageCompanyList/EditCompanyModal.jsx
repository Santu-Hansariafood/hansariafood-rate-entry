import React from "react";
import Select from "react-select";
import InputBox from "@/components/common/InputBox/InputBox";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const EditCompanyModal = ({
  editingCompany,
  setEditingCompany,
  categories,
  commodities,
  locations,
  subcommodityOptions,
  isLoading,
  setIsLoading,
  onClose,
  refreshCompanyList,
}) => {
  const handleLocationChange = (index, field, value) => {
    const updated = editingCompany.location.map((loc, i) =>
      i === index ? { ...loc, [field]: value } : loc
    );
    setEditingCompany({ ...editingCompany, location: updated });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Transform the data to match the API's expected format
      const updatedData = {
        name: editingCompany.name,
        category: editingCompany.category,
        commodities: editingCompany.commodities.map(cmd => {
          // Get all contacts for this commodity across all locations
          const contacts = editingCompany.location.flatMap(loc => 
            loc.commodityContacts
              .filter(contact => contact.commodity === cmd.value && contact.primary)
              .map(contact => ({
                location: loc.name,
                primaryMobile: contact.primary,
                contactPerson: contact.contactPerson || ""
              }))
          );

          return {
            name: cmd.value,
            subcategories: editingCompany.subCommodities
              .filter(sub => sub.value)
              .map(sub => sub.value),
            contacts: contacts.length > 0 ? contacts : [{
              location: editingCompany.location[0]?.name || "",
              primaryMobile: "",
              contactPerson: ""
            }]
          };
        }),
        locations: editingCompany.location.map(loc => ({
          location: loc.name,
          mobileNumbers: loc.commodityContacts
            .filter(contact => contact.primary)
            .map(contact => contact.primary),
          contactPersons: loc.commodityContacts
            .filter(contact => contact.contactPerson)
            .map(contact => contact.contactPerson)
        }))
      };

      await axiosInstance.put(`/managecompany/${editingCompany._id}`, updatedData);
      toast.success("Company updated successfully");
      onClose();
      refreshCompanyList();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.error || "Failed to update company");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-3/4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Company</h2>
        <form onSubmit={handleUpdate}>
          <InputBox
            label="Company Name"
            value={editingCompany.name}
            onChange={(e) =>
              setEditingCompany({ ...editingCompany, name: e.target.value })
            }
          />

          <div className="my-4">
            <label className="block mb-2 font-semibold">Category</label>
            <select
              className="w-full p-2 border rounded"
              value={editingCompany.category}
              onChange={(e) =>
                setEditingCompany({
                  ...editingCompany,
                  category: e.target.value,
                })
              }
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="my-4">
            <label className="block mb-2 font-semibold">Commodities</label>
            <Select
              isMulti
              options={commodities.map((com) => ({
                value: com.name || '',
                label: com.name || '',
                key: `commodity-${com.name || ''}`
              }))}
              value={editingCompany.commodities.map(cmd => ({
                value: cmd.value || '',
                label: cmd.label || '',
                key: `commodity-value-${cmd.value || ''}`
              }))}
              onChange={(selectedOptions) =>
                setEditingCompany({
                  ...editingCompany,
                  commodities: (selectedOptions || []).map(option => ({
                    value: option.value || '',
                    label: option.label || '',
                    key: `commodity-selected-${option.value || ''}`
                  })),
                  location: editingCompany.location.map(loc => ({
                    ...loc,
                    commodityContacts: (selectedOptions || []).map(commodity => ({
                      commodity: commodity.value || '',
                      primary: "",
                      contactPerson: "",
                      key: `contact-${loc.name}-${commodity.value || ''}`
                    }))
                  }))
                })
              }
              className="basic-multi-select"
              classNamePrefix="select"
              getOptionLabel={(option) => option.label || ''}
              getOptionValue={(option) => option.value || ''}
            />

            <div className="my-4">
              <label className="block mb-2 font-semibold">Sub Commodities</label>
              <Select
                isMulti
                options={subcommodityOptions.map(option => ({
                  ...option,
                  key: `subcommodity-${option.value || ''}`
                }))}
                value={editingCompany.subCommodities.map(sub => ({
                  value: sub.value || '',
                  label: sub.label || '',
                  key: `subcommodity-value-${sub.value || ''}`
                }))}
                onChange={(selectedOptions) =>
                  setEditingCompany({
                    ...editingCompany,
                    subCommodities: (selectedOptions || []).map(option => ({
                      value: option.value || '',
                      label: option.label || '',
                      key: `subcommodity-selected-${option.value || ''}`
                    }))
                  })
                }
                className="basic-multi-select"
                classNamePrefix="select"
                getOptionLabel={(option) => option.label || ''}
                getOptionValue={(option) => option.value || ''}
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Locations</h3>
            {editingCompany.location.map((loc, i) => (
              <div key={`location-${i}-${loc.name}`} className="bg-gray-50 p-4 rounded mb-4">
                <div className="flex gap-4 mb-2">
                  <select
                    className="p-2 border rounded w-full"
                    value={loc.name}
                    onChange={(e) =>
                      handleLocationChange(i, "name", e.target.value)
                    }
                  >
                    {!loc.name && (
                      <option value="">Select Location</option>
                    )}
                    {locations.map((locationObj) => (
                      <option
                        key={`location-option-${locationObj._id}`}
                        value={locationObj.name}
                      >
                        {locationObj.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingCompany({
                        ...editingCompany,
                        location: editingCompany.location.filter(
                          (_, index) => index !== i
                        ),
                      })
                    }
                    className="text-red-600 hover:bg-red-100 px-2 rounded"
                  >
                    ✕
                  </button>
                </div>

                <div className="w-full">
                  <h4 className="text-sm font-medium mb-1">
                    Commodity Contacts
                  </h4>
                  {loc.commodityContacts.map((contact, j) => (
                    <div
                      key={`contact-${i}-${j}-${contact.commodity}`}
                      className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2"
                    >
                      <div>
                        <label className="block text-sm font-medium">
                          Commodity
                        </label>
                        <input
                          className="p-2 border rounded w-full"
                          value={contact.commodity}
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">
                          Primary Mobile
                        </label>
                        <input
                          type="text"
                          className="p-2 border rounded w-full"
                          value={contact.primary}
                          onChange={(e) => {
                            const updatedContacts = [...loc.commodityContacts];
                            updatedContacts[j].primary = e.target.value;
                            const updatedLocs = [...editingCompany.location];
                            updatedLocs[i].commodityContacts = updatedContacts;
                            setEditingCompany({
                              ...editingCompany,
                              location: updatedLocs,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">
                          Contact Person
                        </label>
                        <input
                          type="text"
                          className="p-2 border rounded w-full"
                          value={contact.contactPerson}
                          onChange={(e) => {
                            const updatedContacts = [...loc.commodityContacts];
                            updatedContacts[j].contactPerson = e.target.value;
                            const updatedLocs = [...editingCompany.location];
                            updatedLocs[i].commodityContacts = updatedContacts;
                            setEditingCompany({
                              ...editingCompany,
                              location: updatedLocs,
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() =>
                setEditingCompany({
                  ...editingCompany,
                  location: [
                    ...editingCompany.location,
                    {
                      name: "",
                      commodityContacts: (
                        editingCompany.commodities || []
                      ).map((commodity) => ({
                        commodity: commodity.value || '',
                        primary: "",
                        contactPerson: "",
                        key: `contact-${commodity.value || ''}`
                      })),
                    },
                  ],
                })
              }
            >
              Add Location
            </button>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCompanyModal;
