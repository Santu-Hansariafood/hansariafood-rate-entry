import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["buyer", "seller"],
    },
  },
  { timestamps: true }
);

CompanySchema.index({ name: 1, type: 1 }, { unique: true });

export default mongoose.models.Company ||
  mongoose.model("Company", CompanySchema);
