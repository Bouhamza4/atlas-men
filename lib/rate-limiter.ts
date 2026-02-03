// Lightweight in-memory stub for dev / type-checking.
// Replace with a real rate limiter (Redis, etc.) in production.
export const rateLimiter = {
  async check(key: string, limit = 10) {
    // Always allow in dev; return shape expected by callers
    return { success: true }
  }
}

export default rateLimiter
