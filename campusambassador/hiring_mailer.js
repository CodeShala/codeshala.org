'use strict';
const nodemailer = require('nodemailer');

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
var mail_handler1 = ((ToSend, ToSendName) => {
    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAILER_EMAIL,
            pass: process.env.MAILER_PASSWORD
        }
    });

//Add all emails in array where you want the alert of sending email to hired Campus Ambassador
    var maillist = [
        ToSend,
        'prince@codeshala.org',
    ];
    // setup email data with unicode symbols
    let mailOptions = {
        from: '"CODESHALA" <contact@codeshala.org>', // sender address
        to: maillist,// list of receivers
        subject: 'CodeShala Campus Ambassador Program', // Subject line
        text: 'Hello world?', // plain text body
        html: `<p>Hi, <b>${ToSendName}</b><br><p>On behalf of the entire company, I’d like to say that it brings me great pleasure to formally offer you the position for Campus Ambassador at Codeshala. A huge congratulations to you!.This offer is contingent upon the signing of a Non-Disclosure Agreement (attached). You must give acknowledgement of this offer letter. Please email it back to us no more than 7 days.</p><p>Best Regards,</p><p>Prince Batra</p><p>Team CODESHALA</p>` // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
});

module.exports = mail_handler1;
