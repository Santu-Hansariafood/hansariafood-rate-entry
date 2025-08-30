"use client";

import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";
const CompanyCheckbox = dynamic(() =>
  import("../CompanyCheckbox/CompanyCheckbox")
);

const RateUpdateCompanyList = ({
  companies,
  selectedCompanies,
  toggleCompany,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loading />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {companies.map((company) => (
        <CompanyCheckbox
          key={company._id}
          company={company}
          selected={selectedCompanies.includes(company.name)}
          toggleCompany={toggleCompany}
        />
      ))}
    </div>
  );
};

export default RateUpdateCompanyList;
