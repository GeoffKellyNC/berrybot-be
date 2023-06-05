function requestLogger(req, res, next) {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
  
    next();
  }

module.exports = requestLogger;