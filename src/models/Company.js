import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Ensure name is unique
    location: { type: [String], required: true }, // Store multiple locations as an array
    category: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Company || mongoose.model("Company", CompanySchema);