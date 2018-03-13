/********************
 ****Importing Required Modules
 ********************
**/
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var app = express();
var db = require('./db');
/****************************************
 ****Configuring Folder for Static Assets   
 ****************************************
**/
app.use(express.static('static'));


passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
}));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());
/******************************************************
 ****Configuring rendering engine for webpage rendering   
 ******************************************************
**/
app.set('view engine', 'ejs');


app.get('/',function(req, res){
	res.render('pages/index', { user: req.user });
})

app.get('/login',
  function(req, res){
    res.render('pages/login');
  });
  
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('pages/profile', { user: req.user });
});
/******************************************************
 ****Spinning up the server on a port   
 ******************************************************
**/
app.listen(process.env.PORT||3000,function(){
	console.log('SERVER LISTENING');
})