var createError = require("http-errors");
var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { format } = require("date-fns");

// 1st party dependencies
var indexRouter = require("./routes/index");

async function getApp() {

  // Database
  // Use AZURE_COSMOS_CONNECTIONSTRING if available, otherwise fall back to MONGODB_URI
  const mongoUri = process.env.AZURE_COSMOS_CONNECTIONSTRING || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("No database connection string found in environment variables.");
    process.exit(1);  // Stop the app if no connection string is provided
  }
  
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
    process.exit(1); // Exit the application if DB connection fails
  });
  

  var app = express();

  var port = normalizePort(process.env.PORT || '3000');
  app.set('port', port);

  // view engine setup
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "pug");

  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, "public")));

  app.locals.format = format;

  app.use("/", indexRouter);
  app.use("/js", express.static(__dirname + "/node_modules/bootstrap/dist/js")); // redirect bootstrap JS
  app.use(
    "/css",
    express.static(__dirname + "/node_modules/bootstrap/dist/css")
  ); // redirect CSS bootstrap

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    res.setTimeout(30000, () => {
      console.log('Request timed out');
      res.status(408).send('Request Timeout');
    });
    next();
  });
  
  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });

  return app;
}
/**
 * Normalize a port into a number, string, or false.
 */

 function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
module.exports = {
  getApp
};
