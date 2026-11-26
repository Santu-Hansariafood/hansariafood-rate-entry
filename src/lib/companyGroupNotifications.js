import Company from "@/models/Company";
import CompanyGroup from "@/models/CompanyGroup";
import { escapeRegex } from "@/lib/companyGroupUtils";

export const normalizeGroupCompanyName = (name) =>
  (name || "").toLowerCase().replace(/\s+/g, " ").trim();

export async function getGroupNamesByCompanyNames(companyNames) {
  const normalizedNames = [
    ...new Set(
      (companyNames || [])
        .map(normalizeGroupCompanyName)
        .filter(Boolean),
    ),
  ];

  if (normalizedNames.length === 0) return new Map();

  const namePatterns = normalizedNames.map(
    (name) => new RegExp(`^${escapeRegex(name)}$`, "i"),
  );
  const companies = await Company.find({ name: { $in: namePatterns } })
    .select("_id name")
    .lean();

  if (companies.length === 0) return new Map();

  const companyKeysById = new Map(
    companies.map((company) => [
      company._id.toString(),
      normalizeGroupCompanyName(company.name),
    ]),
  );
  const groupNamesByCompany = new Map(
    normalizedNames.map((name) => [name, new Set()]),
  );
  const groups = await CompanyGroup.find({
    companies: { $in: companies.map((company) => company._id) },
  })
    .select("name companies")
    .lean();

  groups.forEach((group) => {
    (group.companies || []).forEach((companyId) => {
      const companyKey = companyKeysById.get(companyId.toString());
      if (companyKey) groupNamesByCompany.get(companyKey)?.add(group.name);
    });
  });

  return new Map(
    [...groupNamesByCompany].map(([companyKey, names]) => [
      companyKey,
      [...names].sort((a, b) => a.localeCompare(b)),
    ]),
  );
}
