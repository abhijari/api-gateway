import { Request, Response, NextFunction } from 'express';
import { redis } from '../utils/redis';
import { RequestWithApiKey } from './apiKeyAuth';

export const rateLimitMiddleware = async (
  req: RequestWithApiKey,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.apiKey) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'API key is required',
      });
      return;
    }

    const apiKey = req.apiKey.key;
    const limitPerMinute = req.apiKey.limitPerMinute;
    const limitPerDay = req.apiKey.limitPerDay;

    const now = Date.now();
    const minuteKey = `rate:${apiKey}:minute`;
    const dayKey = `rate:${apiKey}:day`;

    // Check minute limit
    const minuteCount = await redis.incr(minuteKey);
    if (minuteCount === 1) {
      await redis.expire(minuteKey, 60); // Expire after 60 seconds
    }

    // Calculate reset times
    const minuteReset = Math.ceil((now + 60000) / 1000);
    const dayReset = Math.ceil((now + (86400000 - (now % 86400000))) / 1000);

    // Check if minute limit exceeded BEFORE incrementing day counter
    if (minuteCount > limitPerMinute) {
      // Decrement the minute counter since we're rejecting this request
      await redis.decr(minuteKey);
      
      // Set rate limit headers (we need to get current day count for headers)
      const currentDayCount = await redis.get(dayKey);
      const dayCount = currentDayCount ? parseInt(currentDayCount) : 0;
      
      res.setHeader('X-RateLimit-Limit-Minute', limitPerMinute.toString());
      res.setHeader('X-RateLimit-Remaining-Minute', '0');
      res.setHeader('X-RateLimit-Reset-Minute', minuteReset.toString());
      res.setHeader('X-RateLimit-Limit-Day', limitPerDay.toString());
      res.setHeader('X-RateLimit-Remaining-Day', Math.max(0, limitPerDay - dayCount).toString());
      res.setHeader('X-RateLimit-Reset-Day', dayReset.toString());
      
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded: ${limitPerMinute} requests per minute`,
        retryAfter: 60,
      });
      return;
    }

    // Only increment day counter if minute limit passed
    const dayCount = await redis.incr(dayKey);
    if (dayCount === 1) {
      const secondsUntilMidnight = Math.ceil((86400000 - (now % 86400000)) / 1000);
      await redis.expire(dayKey, secondsUntilMidnight);
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit-Minute', limitPerMinute.toString());
    res.setHeader('X-RateLimit-Remaining-Minute', Math.max(0, limitPerMinute - minuteCount).toString());
    res.setHeader('X-RateLimit-Reset-Minute', minuteReset.toString());
    res.setHeader('X-RateLimit-Limit-Day', limitPerDay.toString());
    res.setHeader('X-RateLimit-Remaining-Day', Math.max(0, limitPerDay - dayCount).toString());
    res.setHeader('X-RateLimit-Reset-Day', dayReset.toString());

    // Check if day limit exceeded
    if (dayCount > limitPerDay) {
      // Decrement the day counter since we're rejecting this request
      await redis.decr(dayKey);
      
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded: ${limitPerDay} requests per day`,
        retryAfter: Math.ceil((86400000 - (now % 86400000)) / 1000),
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    // On Redis error, allow request to proceed (fail open)
    next();
  }
};