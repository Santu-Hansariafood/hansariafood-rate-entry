import mongoose from "mongoose";

const MobileNumberSchema = new mongoose.Schema({
  location: { type: String, required: true },
  commodity: { type: String, required: true },
  primaryMobile: { type: String, default: "" },
  contactPerson: { type: String, default: "" },
});

const ManageCompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    location: [{ type: String, required: true }],
    state: { type: String, required: true },
    category: { type: String, required: true },
    commodities: [{ type: String, required: true }],
    subCommodities: [{ type: String }],
    mobileNumbers: [MobileNumberSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ManageCompany ||
  mongoose.model("ManageCompany", ManageCompanySchema);
