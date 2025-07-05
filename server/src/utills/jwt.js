import jwt from "jsonwebtoken";

const generateToken = (userId, options = {}) => {
  // Basic input validation
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    return jwt.sign({ userId, ...options.payload }, process.env.JWT_SECRET, {
      expiresIn: options.expiresIn || process.env.JWT_EXPIRES_IN || "24h",
      algorithm: "HS256",
    });
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

const generateAccessToken = (userId, payload = {}) => {
  return generateToken(userId, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    payload,
  });
};

const generateRefreshToken = (userId, payload = {}) => {
  return generateToken(userId, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    payload,
  });
};

const verifyToken = (token) => {
  // Basic input validation
  if (!token) {
    throw new Error("Token is required");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    // Validate required fields
    if (!decoded.userId) {
      throw new Error("Invalid token: missing userId");
    }

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    } else {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }
};

export {
  generateToken,
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
};
