var express = require("express");
var app = express();
var passport = require("passport");

app.use(passport.initialize());
app.use(passport.session());

passport.deserializeUser(function (data, done) {
  console.log("deserialize");
  done(null, data);
});



// login check - google
// var GoogleStrategy = require('passport-google-oidc');
var GoogleStrategy = require("passport-google-oauth2").Strategy;
var googleCredentials = require("../config/google.json");

passport.use(
  new GoogleStrategy(
    {
      clientID: googleCredentials.web.client_id,
      clientSecret: googleCredentials.web.client_secret,
      callbackURL: googleCredentials.web.redirect_uris[0],
      proxy: true,
    },
    function (request, refreshToken, accessToken, profile, cb) {
      var data = { token: accessToken, profile };
      console.log("strategy");
      return cb(null, data);
    }
  )
);

//serialize
passport.serializeUser(function (data, done) {
  console.log("serialize", data);
  done(null, data);
});

module.exports = passport;
