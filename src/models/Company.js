import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      collation: { locale: "en", strength: 2 },
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

export default mongoose.models.Company ||
  mongoose.model("Company", CompanySchema);
