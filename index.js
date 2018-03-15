var express = require('express');
var app = express();
var ga = require('node-ga');
var passport = require('passport');
var dotenv = require('dotenv').config()
var Strategy = require('passport-local').Strategy;
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var GithubStrategy = require('passport-github').Strategy;
var dynamo = require('dynamodb');
var Joi = require('joi');
//var aws_keys = require('./utils/aws-keys.json');
dynamo.AWS.config.update({accessKeyId: process.env.AWS_ACCESS_ID_KEY,
 secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
 region: process.env.AWS_REGION
});

var Account = dynamo.define('Account', {
  hashKey : 'email',
 
  // add the timestamp attributes (updatedAt, createdAt)
  timestamps : true,
 
  schema : {
    email   : Joi.string().email(),
    TweetID : dynamo.types.uuid(),
    name    : Joi.string(),
    age     : Joi.number(),
    roles   : dynamo.types.stringSet(),
    settings : {
      nickname      : Joi.string(),
      acceptedTerms : Joi.boolean().default(false)
    }
  }
});
dynamo.createTables({
  'Account': {readCapacity: 20, writeCapacity: 4}
}, function(err) {
  if (err) {
    console.log('Error creating tables: ', err);
  } else {
    console.log('Tables has been created');
  }
});
//var db = require('./db');

app.use(express.static('static'));


/*passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
}));*/

passport.use(new GithubStrategy({
    clientID: "47530121cf9415a61372",
    clientSecret: "b67f1f0a423c6157cd1c9d1512e2e7961590e237",
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    return done(null, profile);
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(user, cb) {
/*  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    
  });*/
  cb(null, user);
});

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(ga('UA-115351307-1', {
    safe: true
}));
// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');


app.get('/',function(req, res){

if (req.isAuthenticated()) { 
  console.log('AUTH SUCCESS');
  console.log(JSON.stringify(req.user, null, 4));
}
  res.render('pages/index', { user: req.user });
})

app.get('/course',function(req, res){
  res.render('pages/course', { user: req.user });
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
 
app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  }
);
 
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


app.get('/db',function(req,res){
  Account.create({email: 'foo@example.com', name: 'Foo Bar', age: 21}, function (err, acc) {
  res.send('created account in DynamoDB'+ acc.get('email'));
});
})

app.get('/dbupdate',function(req, res){
  Account.update({email: 'foo@example.com', name: 'Bar Tester'}, function (err, acc) {
  res.send('update account'+ acc.get('name'));
});
})

app.get('/dbget',function(req, res){
  Account.get('foo@example.com', {ConsistentRead: true, AttributesToGet : ['name','age']}, function (err, acc) {
  res.send('got account'+ acc.get('email'))
  console.log(acc.get('name'));
  console.log(acc.get('age'));
  console.log(acc.get('email')); // prints null
});
})

app.get('/admin/courses',function(req, res){
  res.render('pages/admin-courses')
})

app.get('/*',function(req, res){
  res.send("404 | Page Not Found<br/>This website is still under development")
})
app.listen(process.env.PORT||3000,function(){
  console.log('SERVER LISTENING');
})