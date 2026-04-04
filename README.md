# WAMDIN Alumni Portal Backend

Node.js/Express backend for the WAMDIN Alumni Portal.

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Nodemailer
- Socket.IO (realtime messaging support)

## Prerequisites
- Node.js 18+
- npm 9+
- MongoDB connection string

## Environment Variables
Copy `.env.example` to `.env` and set real values.

```bash
cp .env.example .env
```

Required variables:
- `PORT` (default: `5000`)
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `EMAIL_USER`
- `EMAIL_PASS`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`

## Install
```bash
npm install
```

## Run
Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## Available Scripts
- `npm start`: runs `server.js`
- `npm run dev`: runs `nodemon server.js`

## Base API Routes
- `/api/auth`
- `/api/users`

Additional routes exist in this codebase for admin, resources, events, messages, and groups.

## Project Structure
- `config/` database and external service config
- `controllers/` request handlers
- `middleware/` auth and error middleware
- `models/` Mongoose models
- `routes/` API route modules
- `utils/` helper modules

## Notes
- Keep `.env` and secrets out of source control.
- `node_modules/` is ignored by `.gitignore`.
