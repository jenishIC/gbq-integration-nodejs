const winston = require('winston');
const { format, transports } = winston;
require('dotenv').config();

// Custom format to mask sensitive data
const maskSensitiveData = format((info) => {
  const masked = { ...info };
  
  // List of fields to mask in logs
  const sensitiveFields = [
    'access_token', 
    'refresh_token', 
    'client_id', 
    'client_secret',
    'credentials',
    'password',
    'token'
  ];
  
  // Function to recursively mask sensitive data in objects
  const maskData = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      const lowerKey = key.toLowerCase();
      
      // Check if the key contains any sensitive field name
      const isSensitive = sensitiveFields.some(field => 
        lowerKey.includes(field.toLowerCase())
      );
      
      if (isSensitive && typeof obj[key] === 'string') {
        // Mask the value but show the first and last character
        const value = obj[key];
        if (value.length > 2) {
          obj[key] = `${value.substring(0, 1)}****${value.substring(value.length - 1)}`;
        } else {
          obj[key] = '****';
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively mask nested objects
        maskData(obj[key]);
      }
    });
  };
  
  // Mask message if it's a string that might contain sensitive data
  if (typeof masked.message === 'string') {
    sensitiveFields.forEach(field => {
      const regex = new RegExp(`(["']?${field}["']?\\s*[:=]\\s*["']?)([^"'\\s]+)(["']?)`, 'gi');
      masked.message = masked.message.replace(regex, '$1****$3');
    });
  }
  
  // Mask data in objects
  if (masked.data) {
    maskData(masked.data);
  }
  
  return masked;
});

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    maskSensitiveData(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'gbq-integration' },
  transports: [
    // Write all logs to console
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}${info.data ? ' ' + JSON.stringify(info.data) : ''}${info.stack ? '\n' + info.stack : ''}`
        )
      )
    })
  ]
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new transports.File({ 
    filename: 'logs/error.log', 
    level: 'error',
    maxsize: 10485760, // 10MB
    maxFiles: 5
  }));
  
  logger.add(new transports.File({ 
    filename: 'logs/combined.log',
    maxsize: 10485760, // 10MB
    maxFiles: 5
  }));
}

// Create a stream object for Morgan integration
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;
