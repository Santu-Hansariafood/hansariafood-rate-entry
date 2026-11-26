import mongoose from "mongoose";
import Company from "@/models/Company";
import CompanyGroup from "@/models/CompanyGroup";

export async function validateCompanyGroupInput(input, currentGroupId = null) {
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  if (!name) return { error: "Group name is required" };
  if (name.length > 120) {
    return { error: "Group name must be 120 characters or fewer" };
  }
  if (!Array.isArray(input.companies)) {
    return { error: "Companies must be provided as a list" };
  }

  const companies = [...new Set(input.companies)];
  if (
    companies.some(
      (id) => typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id),
    )
  ) {
    return { error: "One or more selected companies are invalid" };
  }

  const existingCount = await Company.countDocuments({
    _id: { $in: companies },
  });
  if (existingCount !== companies.length) {
    return { error: "One or more selected companies do not exist" };
  }

  const assignedGroupQuery = {
    companies: { $in: companies },
  };
  if (currentGroupId) {
    assignedGroupQuery._id = { $ne: currentGroupId };
  }

  const assignedGroup = await CompanyGroup.findOne(assignedGroupQuery)
    .populate("companies", "name")
    .lean();
  if (assignedGroup) {
    const assignedCompany = assignedGroup.companies.find((company) =>
      companies.includes(company._id.toString()),
    );
    return {
      error: `${assignedCompany.name} already belongs to the "${assignedGroup.name}" group`,
    };
  }

  return { name, companies };
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
