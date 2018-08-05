var mail_handler = require('../mailer');
var mail_handler1 = require('../hiring_mailer');
var Campus_ambassador = require('../models/campus_ambassador');
var nodemailer = require('nodemailer');
var flash = require('connect-flash');
var expressValidator = require('express-validator');

module.exports = function (app) {
    app.use(expressValidator());
    app.use(flash());

    app.get('/campus-ambassador', function (req, res) {
        res.render('campusambassador/campus_ambassador', {message: req.flash('RegisterMessage')});
    });

    app.post('/request', function (req, res) {
        var current_status = req.body.status;
        var id1 = req.body.id;
        var current_email = req.body.email;
        var current_name = req.body.name;

        if (current_status == '1') {
            var myquery = {_id: id1};
            var newvalues = {$set: {status: "Hired"}};
            Campus_ambassador.updateOne(myquery, newvalues, function (err, res) {
                if (err) throw err;
            });
            mail_handler1(current_email, current_name);
        }
        else {
            var myquery = {_id: id1};
            var newvalues = {$set: {status: "Rejected"}};
            Campus_ambassador.updateOne(myquery, newvalues, function (err, res) {
                if (err) throw err;
            });
        }

    });

    app.post('/campus-ambassador', function (req, res) {
        var name = req.body.name;
        var mobile = req.body.mobile;
        var email = req.body.email;
        var college = req.body.college;
        var state = req.body.state;
        var branch = req.body.branch;
        var year_of_graduation = req.body.year_of_graduation;
        var codeshala_student = req.body.codeshala_student;
        var any_society = req.body.any_society;
        var social_links = req.body.social_links;
        var other_profile = req.body.other_profile;
        var why_you = req.body.why_you;
        var new_idea = req.body.new_idea;
        var additional_info = req.body.additional_info;
        var status = "Waiting";
        req.checkBody('name', 'Name cannot be empty.').notEmpty();
        req.checkBody('mobile', 'Mobile number must be of 10 digits.').isLength({min: 10, max: 10});
        req.checkBody('email', 'Email is not valid.').isEmail();
        req.checkBody('college', 'college cannot be empty.').notEmpty();
        req.checkBody('year_of_graduation', 'Year of graduation field cannot be empty.').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            req.flash('RegisterMessage', errors);
            res.render('campusambassador/campus_ambassador', {message: req.flash('RegisterMessage')});
        }
        else {
            var newCampus_ambassador = new Campus_ambassador({
                name: name,
                mobile: mobile,
                email: email,
                college: college,
                state: state,
                branch: branch,
                year_of_graduation: year_of_graduation,
                codeshala_student: codeshala_student,
                any_society: any_society,
                social_links: social_links,
                other_profile: other_profile,
                why_you: why_you,
                new_idea: new_idea,
                additional_info: additional_info,
                status: status
            });
            Campus_ambassador.create(newCampus_ambassador, function (err, campus_ambassador) {
                if (err) {
                    // console.log('Errors are present');
                    res.render('campusambassador/campus_ambassador');
                }
                else {
                    mail_handler(campus_ambassador.email, campus_ambassador.name);
                    a = [{msg: "Registered Successful"}]
                    req.flash('RegisterMessage', a);
                    res.render('campusambassador/campus_ambassador', {message: req.flash('RegisterMessage')});
                }
            })
        }
    });

    app.get('/admin/campus-ambassador', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        var myCursor = Campus_ambassador.find({}, function (err, result) {
            if (err)
                console.log("Something went wrong at Routes/campus_ambassador.");
            else
                res.render("campusambassador/campus_ambassador_admin", {applicants: result});
        });
    });

    app.post('/admin/campus-ambassador', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {

        if (req.body.waiting == "on") {
            var current_status = "Waiting";
            var myCursor = Campus_ambassador.find({status: current_status}, function (err, result) {
                if (err)
                    console.log("Something went wrong at Routes/campus_ambassador.");
                else
                    res.render("campusambassador/campus_ambassador_admin", {applicants: result});
            });
        }
        else if (req.body.hired == "on") {
            var current_status = "Hired";
            var myCursor = Campus_ambassador.find({status: current_status}, function (err, result) {
                if (err)
                    console.log("Something went wrong at Routes/campus_ambassador.");
                else
                    res.render("campusambassador/campus_ambassador_admin", {applicants: result});
            });
        }
        else {
            var current_status = "Rejected";
            var myCursor = Campus_ambassador.find({status: current_status}, function (err, result) {
                if (err)
                    console.log("Something went wrong at Routes/campus_ambassador.");
                else
                    res.render("campusambassador/campus_ambassador_admin", {applicants: result});
            });
        }
    });

};
