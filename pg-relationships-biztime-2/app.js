/** BizTime express application. */

const express = require('express');

const app = express();
const ExpressError = require('./expressError');

// Parse request bodies for JSON
app.use(express.json());

// Routes
const compRoutes = require('./routes/companies');
app.use('/companies', compRoutes);
const invRoutes = require('./routes/invoices');
app.use('/invoices', invRoutes);
const indRoutes = require('./routes/industries');
app.use('/industries', indRoutes);

/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError('Not Found', 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  // the default status is 500 Internal Server Error
  let status = err.status || 500;

  // set the status and alert the user
  return res.status(status).json({
    error: {
      message: err.message,
      status: status,
    },
  });
});

module.exports = app;
