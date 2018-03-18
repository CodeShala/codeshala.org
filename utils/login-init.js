var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var GithubStrategy = require('passport-github').Strategy;

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: process.env.SESSIONS_SECRET, resave: false, saveUninitialized: false }));

module.exports = function (app) {
	app.use(passport.initialize());
	app.use(passport.session());
	// passport.use(new Strategy(
// 	function(username, password, cb) {
// 		db.users.findByUsername(username, function(err, user) {
// 			if (err) { return cb(err); }
// 			if (!user) { return cb(null, false); }
// 			if (user.password != password) { return cb(null, false); }
// 			return cb(null, user);
// 		});
// 	})
// );

passport.use(new GithubStrategy({
	clientID: process.env.GITHUB_CLIENT_ID,
	clientSecret: process.env.GITHUB_CLIENT_SECRET,
	callbackURL: process.env.LOGIN_GITHUB_CALLBACK
},function(accessToken, refreshToken, profile, done) {
	console.log(profile);
	return done(null, profile);
}));

passport.serializeUser(function(user, cb) {
	cb(null, user);
});

passport.deserializeUser(function(user, cb) {
// db.users.findById(id, function (err, user) {
//     if (err) { return cb(err); } 
// });
cb(null, user);
});


}


