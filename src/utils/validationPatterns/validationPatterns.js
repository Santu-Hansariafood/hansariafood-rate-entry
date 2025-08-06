export const validationPatterns = {
  name: /^[A-Za-z\s]{2,50}$/, 
  mobile: /^[6-9]\d{9}$/, 
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
  pin: /^[1-9][0-9]{5}$/, 
  password: /^.{6,}$/ 
};
