import mongoose from "mongoose";

const MobileNumberSchema = new mongoose.Schema(
  {
    location: { type: String, required: true },
    primaryMobile: { type: String },
    secondaryMobile: { type: String },
  },
  { _id: false }
);

const ManageCompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    location: { type: [String], required: true },
    state: { type: String },
    category: { type: String },
    mobileNumbers: { type: [MobileNumberSchema] },
  },
  { timestamps: true }
);

export default mongoose.models.ManageCompany ||
  mongoose.model("ManageCompany", ManageCompanySchema);
