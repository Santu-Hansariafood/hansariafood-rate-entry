export const rateLimit = (maxAttempts, windowMs) => {
  const attempts = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of attempts.entries()) {
      if (now > entry.expires) {
        attempts.delete(ip);
      }
    }
  }, 60000);

  return (req) => {
    let ip = "global";
    
    if (req?.headers) {
      if (typeof req.headers.get === "function") {
         ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "global";
      } else {
         ip = req.headers["x-forwarded-for"]?.split(",")[0] || "global";
      }
    }
    
    const now = Date.now();

    const entry = attempts.get(ip) || { count: 0, expires: now + windowMs };

    if (now > entry.expires) {
      entry.count = 0;
      entry.expires = now + windowMs;
    }

    entry.count += 1;
    attempts.set(ip, entry);

    return entry.count <= maxAttempts;
  };
};
