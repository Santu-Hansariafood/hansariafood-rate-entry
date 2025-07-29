import { useMemo } from "react";

export default function useGroupedCompanies(assignedCompanies = []) {
  const validCompanies = assignedCompanies.filter(
    (company) => company?.companyId?.name
  );

  return useMemo(() => {
    return validCompanies.map((company) => ({
      name: company.companyId.name,
      locations: company.locations || [],
    }));
  }, [validCompanies]);
}
