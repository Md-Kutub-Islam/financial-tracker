/**
 * Simple API Response class for handling successful API responses
 */
class ApiResponse {
  /**
   * Send success response (200)
   */
  static success(res, message, data = null) {
    return res.status(200).json({
      success: true,
      message,
      statusCode: 200,
      ...(data && { data }),
    });
  }

  /**
   * Send created response (201)
   */
  static created(res, message, data = null) {
    return res.status(201).json({
      success: true,
      message,
      statusCode: 201,
      ...(data && { data }),
    });
  }

  /**
   * Send no content response (204)
   */
  static noContent(res, message = "No content") {
    return res.status(204).json({
      success: true,
      message,
      statusCode: 204,
    });
  }
}

export default ApiResponse;
