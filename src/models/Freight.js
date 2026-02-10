
import mongoose from "mongoose";

const FreightSchema = new mongoose.Schema(
  {
    commodity: { type: String, required: true },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ManageCompany",
      required: true,
    },
    location: { type: String, required: true },
    deliveryCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ManageCompany",
      required: true,
    },
    deliveryLocation: { type: String, required: true },
    freightRate: { type: Number, required: true },
    previousRate: { type: Number, default: 0 },
    createdBy: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Freight || mongoose.model("Freight", FreightSchema);
