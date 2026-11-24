import mongoose from "mongoose";

const RateTakenSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    date: { type: String, required: true },
    companyIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ManageCompany",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.RateTaken ||
  mongoose.model("RateTaken", RateTakenSchema);
