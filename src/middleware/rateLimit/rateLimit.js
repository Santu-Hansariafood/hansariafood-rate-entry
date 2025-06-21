export const rateLimit = (maxAttempts, windowMs) => {
  const attempts = new Map();

  return (req) => {
    const ip = req.ip || "global";
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
