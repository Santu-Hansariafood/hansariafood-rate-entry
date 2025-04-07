import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    state: { type: String, required: true },
  },
  { _id: false }
);

const ManageCompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    location: { type: [LocationSchema], required: true },
  },
  { timestamps: true }
);

export default mongoose.models.ManageCompany ||
  mongoose.model("ManageCompany", ManageCompanySchema);
