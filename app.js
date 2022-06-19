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
  var calRouter = require('./routes/cal');





  //app.use

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade')

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());


  // app.use +
    // setting session


  app.use(session({
    store: new FileStore(),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))
  app.use(passport.initialize());
  app.use(passport.session());

  // main code

    // refresh mastertoken
    app.use(function(req,res,next){  
      console.log('1111111')
      async function run(){
        // set req.user if not exists
        template.createReqUser(req,res)
        // refresh mastertoken if not exists
        if (!req.user.mastertoken){
          await template.refreshMasterAT(req,res,googleCredentials,next)
        }
        // check (return true) if masterAT expired -> reloadmastertoken
        console.log('???',template.checkMasterATexpired(req,res))
        if (template.checkMasterATexpired(req,res)){
          await template.refreshMasterAT(req,res,googleCredentials,next)
        }
      }
      run()
    })

    app.get('/',function(req,res){
      async function run2(){
        console.log('222222')
        let data = {};
        // pushing req.user.profile if logined
        if (req.user.profile){
          data.profile = req.user.profile
        }
        // pushing mastercal_list
        await template.getMasterCalList(req,res,data)
        res.send(data)
      }
      run2();
    })




  //Routers
  app.use('/auth',authRouter);
  app.use('/cal',calRouter);

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

  app.listen(3005,function(req,res){
    console.log('SERVER Turned on!!')
  })

module.exports = app;
