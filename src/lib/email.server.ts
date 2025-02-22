import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import config from "../config/config.service";

const mailer = nodemailer.createTransport({
	host: config.SMTP_HOST,
	port: config.SMTP_PORT,
	auth: {
		user: config.SMTP_USERNAME,
		pass: config.SMTP_PASSWORD,
	},
} as SMTPTransport.Options);

export default mailer;
