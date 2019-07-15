// Email Connection
// •••••••••••••••••••••••••••••••

const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    secure: 'true',
    port: '465',
    auth: {
        user: '',
        pass: '',
    }
});

module.exports = {
    sendMail: function(req, res) {
        let mailOptions = {
            from: 'Inventory Management',
            to: req.body.mail_to,
            subject: req.body.mail_subject,
            text: req.body.mail_body
        };

        transporter.sendMail(mailOptions, (e, r) => {
            if (e) {
                console.log(e, 'error');
            } else {
                console.log(r, 'something else');
            }
            transporter.close();
            res.redirect("/admin");
        });
    }
}