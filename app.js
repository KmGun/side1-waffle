// 기본 import
  var createError = require('http-errors');
  var path = require('path');
  var cookieParser = require('cookie-parser');
  var logger = require('morgan');

  var express = require('express');
  var app = express();
  var session = require('express-session')
  var FileStore = require('session-file-store')(session);
  var db = require('./lib/mysql');
  var googleCredentials = require('./config/google.json');


  // 추가 import
  var passport = require('./lib/passport');
  const fetch = require("node-fetch");
  var template = require('./lib/template');

  //Router imports
  var authRouter = require('./routes/auth');
  var mainRouter = require('./routes/main');



  //app.use

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade')

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());


  // app.use +
  app.use(session({
    store: new FileStore(),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))
  app.use(passport.initialize());
  app.use(passport.session());


  // main code
  app.get('/test',function(req,res){
    //
    let data = {}
    // login checking and ui change
    let logged
    if (!data.profile){
      logged = `<a href="/auth/googlelogin">login</a>`
    }
    else {
      logged = `<a href="/auth/googlelogout">logout</a>`
    }

    // pushing req.user.profile
    if (req.user){
      data.profile = req.user.profile
    }
    // pushing mastercal_list and res.send
    fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=ya29.a0ARrdaM_w586j1tBs8dFkBR6FtxGek6MOFWYCz-J7pJO-z9LMEGnpXLDIFqBDfiC9NR3dzD0H9-uZv8Ig-BR_3zl7HbUdLPbHdxtTUKHPjz0CFotXfCPkCwISCHrN36gycgia6wpV_knRbTT_gnH4vLx5oBOe`)
    .then(function (response){
      return response.json()
    })
    .then(function(data_){
      data.mastercal_list = data_
      var html = template.main(logged,data.mastercal_list.items[0].summary)
      res.send(html);

    })
    //
    

    
  })

  app.get('/',function(req,res){
    async function run(){
      let data = {}
      let AT
      // get master_cal AT by using RT
      await template.reloadAT(req,res,googleCredentials)
      // pushing req.user.profile
      if (req.user){
        data.profile = req.user.profile
      }
      // pushing mastercal_list and res.send
      fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=${req.user.mastertoken.access_token}`)
      .then(function (response){
        return response.json()
      })
      .then(function(data_){
        data.mastercal_list = data_
        res.send(data)
        console.log('data obejct : ' ,data)
      })
    }
    run();
  })

  app.get('/calendar/0', function (req, res) {
    console.log('/calendar/0')
    res.json({'user1':'apple'})
    // res.sendFile(path.join(__dirname, '/react-project/build/index.html'));
  });

  //Routers
  app.use('/auth',authRouter);
  // app.use('/main', mainRouter);
  // app.use('/my', myRouter);





  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  app.listen(3005,function(){})

module.exports = app;
