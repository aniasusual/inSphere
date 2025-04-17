"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const nodemailer_express_handlebars_1 = __importDefault(require("nodemailer-express-handlebars"));
const path_1 = __importDefault(require("path"));
// Corrected hbsOptions
const hbsOptions = {
    viewEngine: {
        extname: '.hbs', // Ensure the template files are treated as .hbs
        partialsDir: path_1.default.resolve('./backend/views/partials'), // Path to partials (if any)
        layoutsDir: path_1.default.resolve('./backend/views/layouts'), // Path to layouts (if any)
        defaultLayout: 'main', // Set default layout (can be removed if you don't have a layout)
    },
    viewPath: path_1.default.resolve('./backend/views'),
    extName: '.hbs',
};
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, subject, message }) {
    try {
        // Create Nodemailer transporter
        const transporter = nodemailer_1.default.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.SMPT_MAIL,
                pass: process.env.SMPT_PASSWORD,
            },
        });
        transporter.use('compile', (0, nodemailer_express_handlebars_1.default)(hbsOptions));
        // Prepare the email options
        const mailOptions = {
            from: process.env.SMPT_MAIL,
            to: email,
            subject: subject,
            template: 'welcomeMessage',
            // context: {
            //     message, 
            // },
            context: {
                firstName: "John",
                verificationUrl: "https://hyperlocal.app/verify-email/token"
            },
        };
        // Send the email
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.log("error in sendMail: ", error);
    }
});
exports.sendEmail = sendEmail;
