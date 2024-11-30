/**
 * Debug logging utility
 * Logs messages and data when DEBUG environment variable is true
 */
class DebugLogger {
  /**
   * Log debug message with optional data
   * @param {string} message - Debug message
   * @param {any} data - Optional data to log
   */
  static log(message, data = null) {
    if (process.env.DEBUG === 'true') {
      console.log('\n=== DEBUG ===');
      console.log(`[${new Date().toISOString()}]`, message);
      if (data) {
        console.log('Data:', JSON.stringify(data, null, 2));
      }
      console.log('============\n');
    }
  }

  /**
   * Log error message with optional error object
   * @param {string} message - Error message
   * @param {Error} error - Optional error object
   */
  static error(message, error = null) {
    if (process.env.DEBUG === 'true') {
      console.error('\n=== ERROR ===');
      console.error(`[${new Date().toISOString()}]`, message);
      if (error) {
        console.error('Error:', {
          message: error.message,
          stack: error.stack,
          ...(error.code && { code: error.code }),
          ...(error.response && { response: error.response })
        });
      }
      console.error('============\n');
    }
  }

  /**
   * Log debug message for API requests
   * @param {string} route - API route
   * @param {object} params - Request parameters
   */
  static logRequest(route, params) {
    this.log(`API Request: ${route}`, params);
  }

  /**
   * Log debug message for API responses
   * @param {string} route - API route
   * @param {object} response - Response data
   */
  static logResponse(route, response) {
    this.log(`API Response: ${route}`, response);
  }
}

module.exports = DebugLogger; 