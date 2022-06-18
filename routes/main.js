var express = require('express');
var router = express.Router();
const {google} = require('googleapis');
var fs = require('fs');
var accessToken = require('../lib/passport').accessToken;

var googleCredentials = require('../config/google.json');

// const oauth2Client = new google.auth.OAuth2(
//   googleCredentials.web.client_id,
//   googleCredentials.web.client_secret,
//   googleCredentials.web.redirect_uris[0]
// );

// const drive = google.drive('v3');
// drive.files.list({
//   auth: oauth2Client,
//   pageSize: 10,
//   fields: 'nextPageToken, files(id, name)',
// }, (err1, res1) => {
//   if (err1) return console.log('The API returned an error: ' + err1);
//   const files = res1.data.files;
//   if (files.length) {
//     console.log('Files:');
//     files.map((file) => {
//       console.log(`${file.name} (${file.id})`);
//     });
//   } else {
//     console.log('No files found.');
//   }
// });
module.exports = router;

