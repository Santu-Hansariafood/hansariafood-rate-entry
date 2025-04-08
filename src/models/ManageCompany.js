import mongoose from "mongoose";

const ManageCompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    location: { type: [String], required: true },
    state: { type: String, },
    category: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ManageCompany ||
  mongoose.model("ManageCompany", ManageCompanySchema);
