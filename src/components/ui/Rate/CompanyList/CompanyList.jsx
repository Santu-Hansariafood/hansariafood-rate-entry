import Loading from "@/components/common/Loading/Loading";
import { useState } from "react";

export default function CompanyList({
  companies,
  completedCompanies,
  loading,
  onCompanySelect,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = companies.filter((company) =>
    company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl">
      <input
        type="text"
        placeholder="Search by company name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded-md w-full text-center"
      />
      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredCompanies.map((company) => (
            <button
              key={company}
              onClick={() => onCompanySelect(company)}
              className={`px-4 py-2 rounded-lg text-white transition-all ${
                completedCompanies[company]
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {company}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
