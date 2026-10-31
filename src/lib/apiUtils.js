import { NextResponse } from "next/server";
import { rateLimit } from "@/middleware/rateLimit/rateLimit";

// Shared, module-level rate limiters. One in-memory bucket (and one cleanup
// interval) per class of traffic, reused by every route that imports this
// module, so the whole API shares a single limiter registry per process.
const LIMITERS = {
  read: rateLimit(600, 60 * 1000),
  write: rateLimit(120, 60 * 1000),
  auth: rateLimit(12, 60 * 1000),
};

/**
 * Returns a 429 response when the caller has exceeded the limit for the given
 * traffic class, otherwise null so the caller can continue.
 *
 * Call it as the very first statement of a route handler:
 *   const limited = rateLimitGuard(req, "write");
 *   if (limited) return limited;
 */
export function rateLimitGuard(req, bucket = "write") {
  const limiter = LIMITERS[bucket] || LIMITERS.write;
  if (limiter(req)) return null;

  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    { status: 429, headers: { "Retry-After": "60" } },
  );
}

/**
 * JSON response with a private, browser-only cache policy. `private` keeps the
 * payload out of shared/proxy caches while still letting the browser reuse it
 * for repeat reads within the window.
 */
export function cachedJson(
  data,
  { status = 200, maxAge = 30, staleWhileRevalidate = 120 } = {},
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": `private, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    },
  });
}

/** JSON response that must never be cached (mutations, per-user data). */
export function noStoreJson(data, { status = 200 } = {}) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
