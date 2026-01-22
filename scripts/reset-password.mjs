import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper to read .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");

console.log("Reading env from:", envPath);
let envContent;
try {
  envContent = fs.readFileSync(envPath, "utf8");
} catch (e) {
  console.error("Could not read .env.local");
  process.exit(1);
}

const env = {};
envContent.split("\n").forEach(line => {
  const [key, ...val] = line.split("=");
  if (key && val) env[key.trim()] = val.join("=").trim();
});

const uri = env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const mobile = process.argv[2];
const newPassword = process.argv[3];

if (!mobile || !newPassword) {
  console.error("Usage: node scripts/reset-password.mjs <mobile> <new_password>");
  process.exit(1);
}

console.log("Connecting to DB...");
try {
    await mongoose.connect(uri);
    console.log("Connected.");
} catch(e) {
    console.error("Connection failed:", e);
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: Number, required: true, unique: true },
  password: { type: String, required: true },
  pages: { type: [String], default: [] },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const user = await User.findOne({ mobile: Number(mobile) });

if (!user) {
    console.error(`User with mobile ${mobile} not found.`);
    process.exit(1);
}

console.log(`Found user: ${user.name}`);
const hash = await bcrypt.hash(newPassword, 10);
user.password = hash;
await user.save();

console.log("Password updated successfully.");
console.log(`Try logging in with mobile: ${mobile} and the new password.`);

process.exit(0);
