var createError = require('http-errors');
var fs = require('fs');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var fileUpload = require('express-fileupload');
var logger = require('morgan');

var cors = require('cors');

var indexRouter = require('./routes/route-admin');
var usersRouter = require('./routes/route-users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());

app.use(fileUpload());
app.use(logger('dev'));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('6c-65-6d-6f-6e'));
app.use(express.static(path.join(__dirname, 'public')));

<<<<<<< HEAD

function authenticate(req, res, next) {
  if( req.signedCookies.loggedIn ){
    if( req.signedCookies.loggedIn === '1' ){
      next();
    }
    else{
      req.cookie('loggedIn', '1', { signed : true });
      next();
    }
  }
  else{
    return res.status( 401 ).json({ message: 'You are not authenticated!'});
  }
}

app.use(authenticate);

app.use('/admin', indexRouter);
app.use('/', usersRouter);

// app.use((req, res, next) => { // previously on line 44
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   next();
// });
=======
>>>>>>> path-finding


<<<<<<< HEAD
// const whitelist = ['http://localhost:3000', 'http://localhost:443']
// const corsOptions = {
//   origin: function (origin, callback) {
//     console.log("** Origin of request " + origin)
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       console.log("Origin acceptable")
//       callback(null, true)
//     } else {
//       console.log("Origin rejected")
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

// app.use(cors(corsOptions));

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
// Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}
=======

app.use(cors());

// if (process.env.NODE_ENV === 'production') {
//   // Serve any static files
//   app.use(express.static(path.join(__dirname, 'client/build')));
// // Handle React routing, return all requests to React app
//   app.get('*', function(req, res) {
//     res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
//   });
// }


// app.use((req, res, next) => { // line 27
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   next();
// });
>>>>>>> path-finding


// const whitelist = ['http://localhost:3000', 'http://localhost:443'] // line 31
// const corsOptions = {
//   origin: function (origin, callback) {
//     console.log("** Origin of request " + origin)
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       console.log("Origin acceptable")
//       callback(null, true)
//     } else {
//       console.log("Origin rejected")
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }


module.exports = app;
