import { Suspense, useState } from "react";
import Loading from "@/components/common/Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building2, CheckCircle2, XCircle } from "lucide-react";

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
    <Suspense fallback={<Loading />}>
      <div className="w-full max-w-4xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative mb-8"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </motion.div>

        {loading ? (
          <Loading />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {filteredCompanies.map((company, index) => (
                <motion.button
                  key={company}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => onCompanySelect(company)}
                  className={`
                    group relative overflow-hidden rounded-xl p-4 transition-all duration-200
                    ${
                      isSingleCompleted
                        ? "bg-green-200 hover:bg-green-300 border border-green-300"
                        : completedCompanies[company]
                        ? "bg-green-50 hover:bg-green-100 border border-green-200"
                        : "bg-red-50 hover:bg-red-100 border border-red-200"
                    }
                  `}                  
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                    p-2 rounded-lg transition-colors duration-200
                    ${
                      completedCompanies[company]
                        ? "bg-green-100 group-hover:bg-green-200"
                        : "bg-red-100 group-hover:bg-red-200"
                    }
                  `}
                    >
                      <Building2
                        className={`
                      w-5 h-5 transition-colors duration-200
                      ${
                        completedCompanies[company]
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    `}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <h3
                        className={`
                      font-medium truncate transition-colors duration-200
                      ${
                        completedCompanies[company]
                          ? "text-green-800"
                          : "text-red-800"
                      }
                    `}
                      >
                        {company}
                      </h3>
                      <p
                        className={`
                      text-sm transition-colors duration-200
                      ${
                        completedCompanies[company]
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    `}
                      >
                        {completedCompanies[company] ? "Completed" : "Pending"}
                      </p>
                    </div>
                    <div
                      className={`
                    p-1 rounded-full transition-colors duration-200
                    ${
                      completedCompanies[company]
                        ? "bg-green-100 group-hover:bg-green-200"
                        : "bg-red-100 group-hover:bg-red-200"
                    }
                  `}
                    >
                      {completedCompanies[company] ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredCompanies.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No companies found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search query to find what you're looking for.
            </p>
          </motion.div>
        )}
      </div>
    </Suspense>
  );
}
