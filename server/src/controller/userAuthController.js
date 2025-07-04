import { PrismaClient } from "../generated/prisma/index.js";
import AsyncHandler from "../utills/AsynHandler.js";
import ApiResponse from "../utills/ApiResponse.js";
import ApiError from "../utills/ApiError.js";
import { generateToken } from "../utills/jwt.js";
import bcrypt from "bcrypt";

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

  return ApiResponse.created(res, "User created successfully", user);
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
  
    // Generate JWT token
    const token = generateToken(user.id);
  
    return ApiResponse.success(res, 200, "Login successful", {
      user: userWithoutPassword,
      token,
    });
 } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode);
 }
});
