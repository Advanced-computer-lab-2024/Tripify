// middleware/auth.middleware.js

import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token data to req.user
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(403).json({ message: "Unauthorized: Invalid token" });
  }
};

export default authMiddleware;
