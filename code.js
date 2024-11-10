
function genCode() {
    return Math.random().toString(36).slice(2)
}
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth: {
        user: "sumnyj.kloun@gmail.com",
        pass: "doru ozaf sfwu zjne",
    },
});

// async..await is not allowed in global scope, must use a wrapper
function sendCode(to,code) {
    // send mail with defined transport object



    const info = {
        from: 'sumnyj.kloun@gmail.com', // sender address
        to, // list of receivers
        subject: "Your code", // Subject line
         // plain text body
        html: `<b>${code}</b>`
    }


    transporter.sendMail(info);
    console.log(to,code);

}
module.exports = {sendCode,genCode}