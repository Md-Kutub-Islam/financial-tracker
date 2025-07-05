/**
 * Simple API Error class for handling application errors
 */
class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }

  /**
   * Convert error to JSON format
   */
  toJSON() {
    return {
      success: false,
      message: this.message,
      statusCode: this.statusCode
    };
  }
}

export default ApiError;
