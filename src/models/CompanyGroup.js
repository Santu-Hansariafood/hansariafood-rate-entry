import mongoose from "mongoose";

const CompanyGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    companies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
      },
    ],
  },
  { timestamps: true },
);

CompanyGroupSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);

export default mongoose.models.CompanyGroup ||
  mongoose.model("CompanyGroup", CompanyGroupSchema);
