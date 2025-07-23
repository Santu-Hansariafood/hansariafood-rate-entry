import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: [String],
      required: true,
      enum: ["buyer", "seller"],
      lowercase: true,
      validate: {
        validator: function (arr) {
          return (
            arr.length > 0 && arr.every((t) => ["buyer", "seller"].includes(t))
          );
        },
        message: "Type must be at least one of ['buyer', 'seller']",
      },
    },
  },
  { timestamps: true }
);

CompanySchema.index(
  { name: 1, type: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

export default mongoose.models.Company ||
  mongoose.model("Company", CompanySchema);
