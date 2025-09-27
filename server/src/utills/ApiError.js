/**
 * Enhanced API Error class for handling application errors
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.message = message;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Convert error to JSON format
   */
  toJSON() {
    const errorResponse = {
      success: false,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
    };

    // Include details if provided
    if (this.details) {
      errorResponse.details = this.details;
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === "development") {
      errorResponse.stack = this.stack;
    }

    return errorResponse;
  }

  /**
   * Create a validation error
   */
  static validation(message, details = null) {
    return new ApiError(message, 400, details);
  }

  /**
   * Create a not found error
   */
  static notFound(message = "Resource not found") {
    return new ApiError(message, 404);
  }

  /**
   * Create an unauthorized error
   */
  static unauthorized(message = "Unauthorized") {
    return new ApiError(message, 401);
  }

  /**
   * Create a forbidden error
   */
  static forbidden(message = "Forbidden") {
    return new ApiError(message, 403);
  }

  /**
   * Create a conflict error
   */
  static conflict(message = "Resource conflict") {
    return new ApiError(message, 409);
  }
}

export default ApiError;
