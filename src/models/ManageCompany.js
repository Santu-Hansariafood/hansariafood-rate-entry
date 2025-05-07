import mongoose from "mongoose";

const MobileNumberSchema = new mongoose.Schema(
  {
    location: { type: String, required: true },
    primaryMobile: { type: String },
    secondaryMobile: { type: String },
    contactPerson: { type: String },
  },
  { _id: false }
);

const ManageCompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    location: { type: [String], required: true }, // FIX: Changed to array of strings
    state: { type: String, default: "N.A" },
    category: { type: String, default: "N.A" },
    commodities: { type: [String], default: [] }, // FIX: Changed to array of strings
    subCommodities: { type: [String], default: [] }, // FIX: Changed to array of strings
    mobileNumbers: { type: [MobileNumberSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.ManageCompany ||
  mongoose.model("ManageCompany", ManageCompanySchema);
