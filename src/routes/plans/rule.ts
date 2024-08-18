import nodemailer from 'nodemailer';

// إعداد النقل عبر البريد الإلكتروني
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abedalrhmnhassan@gmail.com',
    pass: 'matador 2024',
  },
});

const sendNotification = (email:string, subject:string, message:string) => {
  const mailOptions = {
    from: 'abedalrhmnhassan@gmail.com',
    to: email,
    subject: subject,
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};
export default sendNotification;