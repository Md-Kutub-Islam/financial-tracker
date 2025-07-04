import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  // Basic input validation
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      algorithm: "HS256",
    });
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
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

export { generateToken, verifyToken };
