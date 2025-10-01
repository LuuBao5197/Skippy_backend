const transporter = require('@configs/nodemailer/index.js');
const pug = require('pug');
const path = require('path');

async function sendEmail(to, subject, templateName, context) {
    try {
        // render file Pug thành HTML

        const templatePath = require.resolve(`@templates/${templateName}.pug`);
        const html = pug.renderFile(templatePath, context);
        const mailOptions = {
            from: '"Skipply App" <baolpb5197@gmail.com>', // phải trùng với email verified trên SendGrid
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.response);
        return info;
    } catch (err) {
        console.error('Fail!!!! Error sending email:', err);
        throw err;
    }
}

module.exports = { sendEmail };
