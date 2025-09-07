const NodeCache = require('node-cache');

// Create cache instance with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300 });

const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cachedData = cache.get(key);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Store original res.json
    const originalJson = res.json;
    
    // Override res.json to cache the response
    res.json = function(data) {
      cache.set(key, data, duration);
      originalJson.call(this, data);
    };
    
    next();
  };
};

const invalidateCache = (pattern) => {
  const keys = cache.keys();
  const regex = new RegExp(pattern);
  
  keys.forEach(key => {
    if (regex.test(key)) {
      cache.del(key);
    }
  });
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  cache
};