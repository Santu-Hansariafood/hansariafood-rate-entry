export const useToday = () =>
  new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
