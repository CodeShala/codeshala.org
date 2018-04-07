var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('../db/users.js');

passport.use(new Strategy(
    function (username, password, cb) {
        db.findByUsername(username, function (err, user) {
            if (err) {
                return cb(err);
            }
            if (!user) {
                return cb(null, false);
            }
            if (user.password != password) {
                return cb(null, false);
            }
            return cb(null, user);
        });
    }));

passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    db.findById(id, function (err, user) {
        if (err) {
            return cb(err);
        }
        cb(null, user);
    });
});

var request = require('request');
module.exports = function (app) {
    app.use(require('morgan')('combined'));
    app.use(require('cookie-parser')());
    app.use(require('body-parser').urlencoded({extended: true}));
    app.use(require('express-session')({secret: 'keyboard cat', resave: false, saveUninitialized: false}));

    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/privacy', function (req, res) {
        res.render('pages/privacy-policy');
    })

    app.get('/admin', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        res.render('pages/admin-home');
    })

    app.get('/admin/courses/add', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        res.render('pages/admin-add-courses', {response: ""});
    })

    app.get('/assignments', function (req, res) {
        res.render('pages/restricted-page');
    })

    app.get('/contests', function (req, res) {
        res.render('pages/restricted-page');
    })

    app.get('/ide', function (req, res) {
        res.render('pages/ide');
    })
    app.post('/run', (req, res) => {
        //console.log(req.body.language+" "+req.body.code+" "+req.body.input);
        var language = req.body.language;
        var code = req.body.code;
        var input = req.body.input;
        if (language == "c") {
            /*compile_run.runC(code, input, function (stdout, stderr, err) {
                if(!err){
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ stdout: stdout,stderr: stderr}));
                }
                else{
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ stderr: err}));
                }
            });*/
            request.post({
                    url: 'https://ide.geeksforgeeks.org/main.php',
                    form: {code: code, input: input, lang: language, save: false}
                },
                function (err, httpResponse, body) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(body);
                })
        } else if (language == "c++") {
            /*compile_run.runCpp(code, input, function (stdout, stderr, err) {
                if(!err){
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ stdout: stdout,stderr: stderr}));
                }
                else{
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ stderr: err}));
                }
            });*/
            request.post({
                    url: 'https://ide.geeksforgeeks.org/main.php',
                    form: {code: code, input: input, lang: 'Cpp', save: false}
                },
                function (err, httpResponse, body) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(body);
                })
        } else if (language == "Python") {
            request.post({
                    url: 'https://ide.geeksforgeeks.org/main.php',
                    form: {code: code, input: input, lang: language, save: false}
                },
                function (err, httpResponse, body) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(body);
                })
        } else if (language == "Python3") {
            request.post({
                    url: 'https://ide.geeksforgeeks.org/main.php',
                    form: {code: code, input: input, lang: language, save: false}
                },
                function (err, httpResponse, body) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(body);
                })
        } else {
            console.log('Language Not Supported')
        }
        //res.send("OK");
    })

    app.get('/login',
        function (req, res) {
            res.render('pages/login');
        });

    app.post('/login',
        passport.authenticate('local', {failureRedirect: '/login'}),
        function (req, res) {
            res.redirect('/admin');
        });

    app.get('/logout',
        function (req, res) {
            req.logout();
            res.redirect('/');
        });

    app.get('/profile',
        require('connect-ensure-login').ensureLoggedIn(),
        function (req, res) {
            res.render('pages/profile', {user: req.user});
        });

    app.get('/push', function (req, res) {
        res.render('push');
    })
}