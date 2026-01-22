import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper to read .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");

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

const mobileInput = process.argv[2];
const passwordInput = process.argv[3];

if (!mobileInput || !passwordInput) {
    console.error("Usage: node scripts/verify-login.mjs <mobile> <password>");
    process.exit(1);
}

console.log("Connecting...");
await mongoose.connect(uri);

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: Number, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

console.log(`Searching for mobile: ${mobileInput} (Type: ${typeof mobileInput})`);

// Mimic the route.js logic
// In route.js: const user = await User.findOne({ mobile: credentials.mobile }).lean();
// Note: credentials.mobile is likely a string from the form.
const user = await User.findOne({ mobile: mobileInput }).lean();

if (!user) {
    console.error("❌ User not found!");
    
    // Debug: try finding by number cast
    console.log("Trying explicit Number cast...");
    const userNum = await User.findOne({ mobile: Number(mobileInput) }).lean();
    if (userNum) {
        console.log("✅ Found user when cast to Number! The issue might be type casting in route.js");
    } else {
        console.log("❌ Still not found with Number cast.");
    }
    process.exit(1);
}

console.log(`✅ User found: ${user.name}`);
console.log(`Stored Hash: ${user.password}`);

console.log(`Comparing password: "${passwordInput}"`);
const ok = await bcrypt.compare(passwordInput, user.password);

if (ok) {
    console.log("✅ Password match! Login should work.");
} else {
    console.log("❌ Password mismatch.");
}

process.exit(0);
