
  var express = require('express');
  var router = express.Router();
  var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
  var googleCredentials = require('../config/google.json');
  var passport = require('../lib/passport');
  const { google } = require('googleapis');
  const fetch = require("node-fetch");


function userLogged(req, res, next) {
  if (req.isAuthenticated())
      return next();
  res.redirect('/auth/google');
}
  // var db = require('../lib/mysql');
  // const shortid = require('shortid');
  // const bcrypt = require('bcrypt');
  // const saltRounds = 10;

  const scope_ = ['https://www.googleapis.com/auth/calendar','profile','email'];

  /* GET home page. */

  router.get('/googlelogin', passport.authenticate('google', {
    scope: scope_,
    accessType: 'offline',prompt: 'consent'
  }));

  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/googlelogin'}),
    function(req, res) {
      res.redirect('/test')
  });

  router.get('/googlelogout',function(req,res){
    req.logout(function(){
      req.session.save(function(err,result){
        res.redirect('/test');
      });
    });
  })


  router.get('/cal',function(req,res){
    fetch(`https://www.googleapis.com/drive/v2/files?access_token=${req.user.mastertoken.access_token}`)
      .then(function (response){
        return response.json()
      })
      .then(function(data){
        res.send(data);
      })
  })


  router.get('/test',function(req,res){
    
  })


module.exports = router;

// //
// const oauth2Client = new google.auth.OAuth2(
//   googleCredentials.web.client_id,
//   googleCredentials.web.client_secret,
//   googleCredentials.web.redirect_uris[0]
// );
// const scopes = scope_;

// const authorizationUrl = oauth2Client.generateAuthUrl({
//   access_type: 'offline',
//   scope: scopes,
//   include_granted_scopes: true
// });
// let userCredential = null;

// oauth2Client.setCredentials(req.user.token);

// // Location : Redirect URI에 
// //oauth2Client.setCredentials(accessToken);
// //넣어주는것 잊지 말것
// //
// const calendar = google.calendar({version: 'v3', oauth2Client});
// calendar.events.list({
//   calendarId: 'primary',
//   timeMin: (new Date()).toISOString(),
//   maxResults: 10,
//   singleEvents: true,
//   orderBy: 'startTime',
// }, (err, res) => {
//   if (err) return console.log('The API returned an error: ' + err);
//   const events = res.data.items;
//   if (events.length) {
//     console.log('Upcoming 10 events:');
//     events.map((event, i) => {
//       const start = event.start.dateTime || event.start.date;
//       console.log(`${start} - ${event.summary}`);
//     });
//   } else {
//     console.log('No upcoming events found.');
//   }
// });

// //