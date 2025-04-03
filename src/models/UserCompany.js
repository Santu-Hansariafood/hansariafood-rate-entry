import mongoose from "mongoose";
import ManageCompany from "@/models/ManageCompany";  // Import your ManageCompany model

const userCompanySchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    companies: [
      {
        companyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ManageCompany", // Ensure you refer to the correct model name here
          required: true,
        },
        locations: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const UserCompany = mongoose.models.UserCompany || mongoose.model("UserCompany", userCompanySchema);

export default UserCompany;
