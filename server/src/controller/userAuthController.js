import { PrismaClient } from "../generated/prisma/index.js";
import AsyncHandler from "../utills/AsynHandler.js";
import ApiResponse from "../utills/ApiResponse.js";
import ApiError from "../utills/ApiError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../utills/jwt.js";
import bcrypt from "bcrypt";
import { cookieOptions, accessTokenCookieOptions } from "../utills/constant.js";

const prisma = new PrismaClient();

export const registerUser = AsyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      throw new ApiError("All fields are required", 400);
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError("Invalid email format", 400);
    }

    // Password strength validation
    if (password.length < 6) {
      throw new ApiError("Password must be at least 6 characters long", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError("User with this email already exists", 409);
    }

    // Create user (password should be hashed in production)
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(user.id, {
      email: user.email,
      name: user.name,
    });

    const refreshToken = generateRefreshToken(user.id, {
      email: user.email,
      name: user.name,
    });

    // Set tokens in cookies
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return ApiResponse.created(res, "User registered successfully", {
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode);
  }
});

export const loginUser = AsyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      throw new ApiError("Email and password are required", 400);
    }

    // Find user with password for comparison
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError("Invalid email or password", 401);
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError("Invalid email or password", 401);
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(user.id, {
      email: user.email,
      name: user.name,
    });

    const refreshToken = generateRefreshToken(user.id, {
      email: user.email,
      name: user.name,
    });

    // Update user's last login timestamp in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        isActive: true,
        refreshToken: refreshToken,
      },
    });

    // Set tokens in cookies
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return ApiResponse.success(res, 200, "Login successful", {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode);
  }
});

export const logoutUser = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return ApiResponse.success(res, 200, "Already logged out");
    }

    // Get token from either cookies or Authorization header (for Postman testing)
    let token = null;

    // First try to get from cookies
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else {
      // Fallback to Authorization header (for Postman)
      const authHeader = req.headers.authorization;
      token = authHeader && authHeader.split(" ")[1];
    }

    if (!token) {
      return ApiResponse.success(res, 200, "Already logged out");
    }

    // Verify the token to get user information
    let decodedToken;
    try {
      decodedToken = verifyToken(token);
    } catch (error) {
      return ApiResponse.success(res, 200, "Token already invalid");
    }

    // Update user's last logout timestamp in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        // You can add a lastLogoutAt field to your User model if needed
        // lastLogoutAt: new Date()
        lastLogoutAt: new Date(),
        isActive: false,
        refreshToken: null,
      },
    });

    // Option 1: Simple logout (recommended for most applications)
    // The client will remove the token from storage
    const logoutData = {
      message: "Logged out successfully",
      logoutTime: new Date().toISOString(),
      userId: userId,
    };

    // Clear cookies
    res.clearCookie("accessToken", accessTokenCookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return ApiResponse.success(res, 200, "Logged out successfully", logoutData);
  } catch (error) {
    console.error("Logout error:", error);
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
});

export const getUser = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError("User not found", 404);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        lastLoginAt: true,
        lastLogoutAt: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return ApiResponse.success(res, 200, "User fetched successfully", user);
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
});

export const refreshAccessToken = AsyncHandler(async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new ApiError("Refresh token is required", 401);
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    if (!decoded.userId) {
      throw new ApiError("Invalid refresh token", 401);
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new ApiError("User not found or inactive", 401);
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id, {
      email: user.email,
      name: user.name,
    });

    // Set new access token in cookie
    res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);

    return ApiResponse.success(
      res,
      200,
      "Access token refreshed successfully",
      {
        accessToken: newAccessToken,
        user,
      }
    );
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
});

export const updateUser = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError("User not found", 404);
    }

    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      throw new ApiError("At least one field is required", 400);
    }

    if (password !== confirmPassword) {
      throw new ApiError("Password and confirm password do not match", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      },
    });

    return ApiResponse.success(res, 200, "User updated successfully", user);
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
});
