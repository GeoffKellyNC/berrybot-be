const excludeWebhookJsonMiddleware = (req, res, next) => {
  if (req.path && req.path.includes("webhook")) {
    next();
  } else {
    express.json()(req, res, next);
  }
};

module.exports = excludeWebhookJsonMiddleware;
