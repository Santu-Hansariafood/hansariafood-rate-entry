import mongoose from "mongoose";

const SellerSchema = new mongoose.Schema(
  {
    sellerName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    companies: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Seller || mongoose.model("Seller", SellerSchema);
