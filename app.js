// 기본 import
var createError = require("http-errors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var express = require("express");
var app = express();

const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

var session = require("express-session");
var FileStore = require("session-file-store")(session);
var googleCredentials = require("./config/google.json");
var bodyParser = require('body-parser')

// 추가 import
var passport = require("./lib/passport");
var template = require("./lib/template");

//Router imports
var authRouter = require("./routes/auth");
var calRouter = require("./routes/cal");

//app.use

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use +
// setting session

app.use(
  session({
    store: new FileStore(),
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// main code

// token handling
app.use(function (req, res, next) {
  async function run() {
    // set req.user if not exists
    template.createReqUser(req, res);
    // refresh mastertoken if not exists, if exists, next()
    if (!req.user.mastertoken) {
      await template.refreshMasterAT(req, res, googleCredentials, next);
    } else {
      // check (return true) if masterAT expired -> reloadmastertoken
      if (template.checkMasterATexpired(req, res)) {
        await template.refreshMasterAT(req, res, googleCredentials, next);
      }
      // or not -> next()
      else {
        next();
      }
    }
  }
  run();
});

app.get("/", function (req, res) {
  async function run() {
    var data = {};
    var masterCal_list = {};
    // pushing req.user.profile if logined
    if (req.user.profile) {
      data.profile = req.user.profile;
    }
    // get mastercal_list from google api
    masterCal_list = await template.getMasterCalData(req, res);
    // DB , server Data synchronize
    // register server Data on DB
    template.makeMasterCalDB(masterCal_list);
    // get MasterCalDB Data and save on 'data' object and res.send(data)
    template.getMasterCalDB(req, res, data);
  }
  run();
});

//Routers
app.use("/auth", authRouter);
app.use("/cal", calRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
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

app.listen(3005, function (req, res) {
  console.log("SERVER Turned on!!");
});

module.exports = app;
