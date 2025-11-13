// src/middleware/auth.js
// Simple JWT authentication middleware used by protected routes.

const jwt = require("jsonwebtoken");

const extractToken = (req) => {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader && typeof authHeader === "string") {
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7).trim();
    }
    return authHeader.trim();
  }

  const token = req.headers?.["x-access-token"] || req.query?.token;
  if (typeof token === "string") {
    return token.trim();
  }

  return null;
};

const requireAuth = (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: "Authentication token missing" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { requireAuth };
