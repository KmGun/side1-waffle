const http = require('http');
const https = require('https');
const url = require('url');
const { google } = require('googleapis');
var googleCredentials = require('../config/google.json');


const oauth2Client = new google.auth.OAuth2(
    googleCredentials.web.client_id,
    googleCredentials.web.client_secret,
    googleCredentials.web.redirect_uris[0]
);

const scopes = [
  'https://www.googleapis.com/auth/calendar.events'
];


const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  include_granted_scopes: true
});

let userCredential = null;

async function main() {
  const server = http.createServer(async function (req, res) {
    // Example on redirecting user to Google's OAuth 2.0 server.
    if (req.url == '/') {
      res.writeHead(301, { "Location": authorizationUrl });
    }

    // Receive the callback from Google's OAuth 2.0 server.
    if (req.url.startsWith('/auth/google/callback')) {
      // Handle the OAuth 2.0 server response
      let q = url.parse(req.url, true).query;

      if (q.error) { // An error response e.g. error=access_denied
        console.log('Error:' + q.error);
      } else { // Get access and refresh tokens (if access_type is offline)
        let { tokens } = await oauth2Client.getToken(q.code);
        console.log(tokens);
        oauth2Client.setCredentials(tokens);

        /** Save credential to the global variable in case access token was refreshed.
          * ACTION ITEM: In a production app, you likely want to save the refresh token
          *              in a secure persistent database instead. */
        userCredential = tokens;

        // Example of using Google Drive API to list filenames in user's Drive.
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
      }
    }

    // Example on revoking a token
    // if (req.url == '/revoke') {
    //   // Build the string for the POST request
    //   let postData = "token=" + userCredential.access_token;

    //   // Options for POST request to Google's OAuth 2.0 server to revoke a token
    //   let postOptions = {
    //     host: 'oauth2.googleapis.com',
    //     port: '443',
    //     path: '/revoke',
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/x-www-form-urlencoded',
    //       'Content-Length': Buffer.byteLength(postData)
    //     }
    //   };

    //   // Set up the request
    //   const postReq = https.request(postOptions, function (res) {
    //     res.setEncoding('utf8');
    //     res.on('data', d => {
    //       console.log('Response: ' + d);
    //     });
    //   });

    //   postReq.on('error', error => {
    //     console.log(error)
    //   });

    //   // Post the request with data
    //   postReq.write(postData);
    //   postReq.end();
    // }
    res.end();
  }).listen(3005);
}
main().catch(console.error);