// Simple rate limiting middleware
const rateLimitMap = new Map();

export function rateLimit(limit = 100, windowMs = 15 * 60 * 1000) {
  return (req) => {
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }
    
    const requests = rateLimitMap.get(ip);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= limit) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    rateLimitMap.set(ip, validRequests);
    
    return true; // Request allowed
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  
  for (const [ip, requests] of rateLimitMap.entries()) {
    const validRequests = requests.filter(time => time > now - windowMs);
    if (validRequests.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, validRequests);
    }
  }
}, 5 * 60 * 1000); // Cleanup every 5 minutes