export function verifyApiKey(req) {
    const apiKey = req.headers.get("x-api-key");
    const validApiKey = process.env.API_KEY;
  
    if (!apiKey || apiKey !== validApiKey) {
      return false;
    }
    return true;
  }
  