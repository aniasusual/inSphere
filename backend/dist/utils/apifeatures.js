"use strict";
// import nodemailer from 'nodemailer';
// import path from 'path';
// interface EmailOptions {
//     email: string;
//     subject: string;
//     message: string;
// }
// // Corrected hbsOptions
// const hbsOptions = {
//     viewEngine: {
//         extname: '.hbs', // Ensure the template files are treated as .hbs
//         partialsDir: path.resolve('./backend/views/partials'), // Path to partials (if any)
//         layoutsDir: path.resolve('./backend/views/layouts'), // Path to layouts (if any)
//         defaultLayout: 'main', // Set default layout (can be removed if you don't have a layout)
//     },
//     viewPath: path.resolve('./backend/views'),
//     extName: '.hbs',
// };
// export const sendEmail = async ({ email, subject, message }: EmailOptions): Promise<void> => {
//     try {
//         // Create Nodemailer transporter
//         const transporter = nodemailer.createTransport({
//             service: 'Gmail',
//             auth: {
//                 user: process.env.SMPT_MAIL,
//                 pass: process.env.SMPT_PASSWORD,
//             },
//         });
//         const hbs = await import('nodemailer-express-handlebars');
//         transporter.use('compile', hbs.default(hbsOptions));
//         // Prepare the email options
//         const mailOptions = {
//             from: process.env.SMPT_MAIL,
//             to: email,
//             subject: subject,
//             template: 'welcomeMessage',
//             // context: {
//             //     message, 
//             // },
//             context: {
//                 firstName: "John",
//                 verificationUrl: "https://hyperlocal.app/verify-email/token"
//             },
//         };
//         // Send the email
//         await transporter.sendMail(mailOptions);
//     } catch (error) {
//         console.log("error in sendMail: ", error);
//     }
// };
