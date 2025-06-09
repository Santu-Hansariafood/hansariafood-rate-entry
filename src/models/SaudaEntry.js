import mongoose from "mongoose";

const saudaEntrySubSchema = new mongoose.Schema(
  {
    tons: { type: Number, required: true },
    description: { type: String, default: "" },
    saudaNo: { type: String, default: "" },
  },
  { _id: false }
);

const SaudaEntrySchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    date: { type: String, required: true },
    saudaEntries: {
      type: Map,
      of: [saudaEntrySubSchema],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SaudaEntry ||
  mongoose.model("SaudaEntry", SaudaEntrySchema);
