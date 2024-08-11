# TypeScript Backend Toolkit

Welcome to the TypeScript Backend Toolkit! This project is a robust backend boilerplate designed for scalability, flexibility, and ease of development. It's packed with modern technologies and best practices to kickstart your next backend project.

## Prerequisites

Before you get started, make sure you have the following installed on your machine:

- **Docker + Docker Compose**
- **PNPM**
- **Node.js 20+ (LTS)**

## How to Run

1. **Set up Docker Services**:

   - Run the following command to start MongoDB and Redis instances locally:
     ```sh
     docker compose up -d
     ```

2. **Install Dependencies**:

   - Use pnpm to install all the necessary dependencies:
     ```sh
     pnpm i
     ```

3. **Configure Environment Variables**:
   - Create a `.env` file in the root directory.
   - Use the provided `.env.sample` as a template to enter all the required environment variables.

## What's Included

- **Auth Module**: Includes Google Sign-In support for easy authentication.
- **User Management**: Comprehensive user management functionality.
- **File Upload**: Handles file uploads with Multer and Amazon S3.
- **Data Validation & Serialization**: Zod is used for validation and serialization of data.
- **Configuration Management**: Managed using dotenv-cli and validated with Zod for accuracy and safety.
- **Middlewares**:
  - **Authorization**: Built-in authorization middleware.
  - **Zod Schema Validation**: Ensures your API inputs are correctly validated.
  - **JWT Extraction**: Easily extract and verify JWT tokens.
- **Type-safe Email Handling**: Emails are managed using Nodemailer with EJS templating.
- **Queues**: Powered by BullMQ with Redis for handling background jobs.
- **ESLint Setup**: Pre-configured ESLint setup for consistent code quality.
  ```sh
  pnpm run lint
  ```
- **Development Server**: Run the server in development mode using ts-node-dev:
  ```sh
  pnpm run dev
  ```
- **Build Process**: Efficiently bundle your project using tsup:
  ```sh
  pnpm run build
  ```
- **PM2 Support**: Out-of-the-box support for PM2 to manage your production processes.
- **Socket.io Support (In Progress)**: Adding support for Redis adapter and a chat module.
- **Notification Infrastructure (In Progress)**: Notifications via FCM and Novu.

## Contributions

Feel free to contribute to this project by submitting issues or pull requests. Let's build something amazing together!
