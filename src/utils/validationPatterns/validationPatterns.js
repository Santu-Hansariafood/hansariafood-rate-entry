export const validationPatterns = {
  // Allows real person/business names: letters, digits, spaces and the common
  // separators found in existing data (., - ( ) & / + # ,) — 2 to 100 chars.
  name: /^[A-Za-z0-9][A-Za-z0-9\s.'()&\/+#,-]{1,99}$/,
  mobile: /^[6-9]\d{9}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  pin: /^[1-9][0-9]{5}$/,
  password: /^.{6,}$/,
};
