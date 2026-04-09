# HealthCare Backend

A basic backend API for a healthcare application built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Features

- Authentication and authorization
- Patient registration and login
- Doctor creation flow
- Specialty management
- Prisma ORM with PostgreSQL
- Better Auth integration
- Stripe webhook support
- Cloudinary-based file upload support
- Email/OTP-based verification flow

## Tech Stack

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Better Auth
- Stripe
- Cloudinary
- Zod

## Project Structure

```text
src/
  app/
    config/
    errorHelpers/
    interfaces/
    lib/
    middleware/
    module/
    routes/
    shared/
    templates/
    utils/
  app.ts
  server.ts

prisma/
  migrations/
  schema/
```

## Available API Base Path

The main API base path is:

```text
/api/v1
```

Currently connected route groups:

- `/api/v1/auth`
- `/api/v1/user`
- `/api/v1/specialty`
- `/api/auth` for Better Auth handlers
- `/webhook` for Stripe webhook events

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add the required values.

You can start from `.env.example`.

Required variables used by the app:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:5000

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRES_IN=7d
BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN=1d
BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE=7d

EMAIL_SENDER_SMTP_HOST=
EMAIL_SENDER_SMTP_PORT=587
EMAIL_SENDER_SMTP_USER=
EMAIL_SENDER_SMTP_PASS=
EMAIL_SENDER_FROM=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
FRONTEND_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### 4. Generate Prisma client

```bash
npm run generate
```

### 5. Run database migrations

```bash
npm run migrate
```

### 6. Start the development server

```bash
npm run dev
```

The server will run at:

```text
http://localhost:5000
```

## Scripts

- `npm run dev` - start development server with watch mode
- `npm run build` - compile TypeScript
- `npm start` - run compiled server
- `npm run lint` - run ESLint
- `npm run generate` - generate Prisma client
- `npm run migrate` - run Prisma migrations
- `npm run studio` - open Prisma Studio
- `npm run push` - push schema to database
- `npm run pull` - pull schema from database
- `npm run stripe-webhook` - forward Stripe webhook events to local server

## Root Endpoints

- `GET /` returns a basic welcome response
- `POST /webhook` handles Stripe webhook events

## Notes

- Build output is generated in the `dist/` folder.
- The app uses EJS templates for some auth and email-related views.
- Some modules exist in the codebase but are not yet connected through the main route registry.

## License

This project is licensed under the ISC License.
