"use client";

const CompanyCheckbox = ({ company, selected, toggleCompany }) => {
  return (
    <label
      key={company._id}
      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer 
                  border transition-all duration-200 
                  ${
                    selected
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500 shadow-lg"
                      : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
                  }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={() => toggleCompany(company.name)}
        className="accent-green-600 w-4 h-4"
      />
      <span className="truncate font-medium">{company.name}</span>
    </label>
  );
};

export default CompanyCheckbox;
