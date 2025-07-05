// cookie options for development and production
export const cookieOptions = {
  httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
  secure: process.env.NODE_ENV === "production", // Only secure in production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Lax for development, none for production
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days for refresh token
};

// Separate options for access token (shorter expiry)
export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 1000 * 60 * 15, // 15 minutes for access token
};
