
    var express = require('express');
    var app = express();
    var db = require('./mysql');   
    var LocalStrategy = require('passport-local');
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    var passport = require('passport');
    app.use(passport.initialize());
    app.use(passport.session());

    passport.deserializeUser(function(data, done) {
        // db.query('SELECT * FROM users WHERE shortid = ?', [ id ], function(err, user) {
        //     done(null, user[0]);
        // })
        console.log('deserialize')
        done(null,data)
    });



    
    // login check - LOCAL
    passport.use(new LocalStrategy(function verify(id, pw, cb) {
        db.query('SELECT * FROM users WHERE userid = ?', [ id ], function(err, user) {
            if (user){
                bcrypt.compare(pw, user[0].userpw , function(err, result) {
                    if (result){
                        console.log(user[0]);
                        return cb(null,user[0])
                    }
                    else{return cb(null,false,{message : '비밀번호가 일치하지 않습니다'}) }
                })
            }
            else {
                return cb(null,false,{ message : '일치하는 ID가 존재하지 않습니다.'})
            }

        })
    }));


    // login check - google
    // var GoogleStrategy = require('passport-google-oidc');
    var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
    var googleCredentials = require('../config/google.json');



    passport.use(new GoogleStrategy(
        {clientID: googleCredentials.web.client_id,
        clientSecret: googleCredentials.web.client_secret,
        callbackURL: googleCredentials.web.redirect_uris[0],
        },function (request, accessToken, refreshToken, profile, cb) {
            var data = {token:refreshToken,profile:profile}
            console.log('strategy')
            console.log('profile',profile)
            return cb(null,data)
        }
    ))

    //serialize
    passport.serializeUser(function(data, done) {
        console.log('serialize',data)
        done(null, data);
    });

    


    // async function func(){
    //     const AT = await promise
    //     let accessToken = AT
    //     return accessToken
    // }

module.exports = passport;




