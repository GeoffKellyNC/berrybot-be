const express = require("express");

const excludeWebhookJsonMiddleware = (req, res, next) => {
  if (req.path.includes("webhook")) {
    next();
  } else {
    express.json()(req, res, next);
  }
};


module.exports = excludeWebhookJsonMiddleware;
