class Debug {
  static isEnabled = process.env.REACT_APP_DEBUG === 'true';

  static log(message, data = null) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString();
    const logMessage = {
      timestamp,
      message,
      ...(data && { data })
    };

    console.log('🔍 DEBUG:', logMessage);
  }

  static error(message, error = null) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString();
    const logMessage = {
      timestamp,
      message,
      ...(error && { 
        error: {
          message: error.message,
          stack: error.stack
        }
      })
    };

    console.error('❌ ERROR:', logMessage);
  }
}

export default Debug; 