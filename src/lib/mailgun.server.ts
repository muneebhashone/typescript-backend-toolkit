import formData from "form-data";
import Mailgun from "mailgun.js";
import config from "../config/config.service";

const mailgun = new Mailgun(formData);

const mailgunClient = mailgun.client({
	username: "api",
	key: config.MAILGUN_API_KEY,
});

export default mailgunClient;
