import { verifyToken } from "../utills/jwt.js";

const authMiddleware = (req, res, next) => {
  let token = null;

  // First try to get token from cookies (for browser requests)
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else {
    // Fallback to Authorization header (for Postman/API clients)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  try {
    // Verify and decode token
    const decoded = verifyToken(token);

    // Add user info to request object
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid or expired token",
    });
  }
};

export default authMiddleware;
