import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
	userName: string;
	resetLink: string;
}

export const ResetPasswordEmail = ({
	userName,
	resetLink,
}: ResetPasswordEmailProps) => {
	return (
		<Html>
			<Head />
			<Preview>Reset your password</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={heading}>Password Reset Request</Heading>
					<Text style={text}>Hi {userName},</Text>
					<Text style={text}>
						We received a request to reset your password. Click the button below
						to create a new password:
					</Text>
					<Section style={buttonContainer}>
						<Button style={button} href={resetLink}>
							Reset Password
						</Button>
					</Section>
					<Text style={text}>
						If you didn't request this password reset, you can safely ignore
						this email.
					</Text>
					<Text style={text}>
						This link will expire in 1 hour for security reasons.
					</Text>
					<Text style={footer}>
						If you're having trouble clicking the button, copy and paste this
						URL into your web browser: {resetLink}
					</Text>
				</Container>
			</Body>
		</Html>
	);
};

const main = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "20px 0 48px",
	marginBottom: "64px",
};

const heading = {
	fontSize: "24px",
	letterSpacing: "-0.5px",
	lineHeight: "1.3",
	fontWeight: "400",
	color: "#484848",
	padding: "17px 0 0",
};

const text = {
	margin: "0 0 12px",
	fontSize: "16px",
	lineHeight: "24px",
	color: "#484848",
};

const buttonContainer = {
	padding: "27px 0 27px",
};

const button = {
	backgroundColor: "#5469d4",
	borderRadius: "4px",
	color: "#ffffff",
	fontSize: "16px",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "block",
	padding: "12px 20px",
};

const footer = {
	fontSize: "13px",
	lineHeight: "24px",
	color: "#777",
	padding: "0 20px",
};

export default ResetPasswordEmail;
