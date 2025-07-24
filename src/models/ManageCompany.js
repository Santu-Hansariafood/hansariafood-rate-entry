import mongoose from "mongoose";

const MobileNumberSchema = new mongoose.Schema({
  location: { type: String, required: true },
  commodity: { type: String, required: true },
  primaryMobile: { type: String, default: "" },
  contactPerson: { type: String, default: "" },
});

const ManageCompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: [{ type: String, required: true }],
    state: { type: String, required: true },
    category: { type: String, required: true },

    type: {
      type: [String],
      enum: ["buyer", "seller"],
      required: true,
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.length > 0 &&
          arr.every((t) => ["buyer", "seller"].includes(t)),
        message: "Invalid company type",
      },
    },

    commodities: [{ type: String, required: true }],
    subCommodities: [{ type: String }],
    mobileNumbers: [MobileNumberSchema],
  },
  { timestamps: true }
);

ManageCompanySchema.index({ name: 1, type: 1 }, { unique: true });

export default mongoose.models.ManageCompany ||
  mongoose.model("ManageCompany", ManageCompanySchema);
