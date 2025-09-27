import ApiError from "./ApiError.js";

/**
 * AsyncHandler - A utility function to handle async operations in Express routes
 * Wraps async functions to automatically catch errors and pass them to Express error handling middleware
 *
 * @param {Function} fn - The async function to wrap
 * @returns {Function} Express middleware function
 */
const AsyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Log the original error for debugging
      console.error("AsyncHandler caught error:", error);

      // If it's already an ApiError, pass it through
      if (error instanceof ApiError) {
        return next(error);
      }

      // Handle Prisma errors specifically
      if (error.code && error.meta) {
        // Convert Prisma errors to ApiError instances
        let message = "Database operation failed";
        let statusCode = 500;

        switch (error.code) {
          case "P2002":
            message = `Duplicate entry: ${
              error.meta.target?.join(", ") || "field already exists"
            }`;
            statusCode = 400;
            break;
          case "P2025":
            message = "Record not found";
            statusCode = 404;
            break;
          case "P2003":
            message = "Invalid reference: related record does not exist";
            statusCode = 400;
            break;
          case "P2014":
            message = "Invalid ID: The provided ID is not valid";
            statusCode = 400;
            break;
          case "P2021":
            message = "Table does not exist in the current database";
            statusCode = 500;
            break;
          case "P2022":
            message = "Column does not exist in the current database";
            statusCode = 500;
            break;
          default:
            message = `Database error: ${error.message}`;
            statusCode = 400;
        }

        return next(new ApiError(message, statusCode));
      }

      // Handle validation errors
      if (error.name === "ValidationError") {
        return next(new ApiError(error.message || "Validation error", 400));
      }

      // Handle JWT errors
      if (error.name === "JsonWebTokenError") {
        return next(new ApiError("Invalid token", 401));
      }

      if (error.name === "TokenExpiredError") {
        return next(new ApiError("Token expired", 401));
      }

      // Handle other known errors
      if (error.statusCode) {
        return next(
          new ApiError(error.message || "An error occurred", error.statusCode)
        );
      }

      // For unknown errors, create a generic ApiError
      return next(
        new ApiError(error.message || "An unexpected error occurred", 500)
      );
    });
  };
};

export default AsyncHandler;
