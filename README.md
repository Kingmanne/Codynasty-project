# CodeDynasty

[![AWS](https://img.shields.io/badge/AWS-Lambda%20%7C%20API%20Gateway%20%7C%20SQS%20%7C%20DynamoDB-FF9900?logo=amazonaws&logoColor=white)](https://aws.amazon.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

An event-driven, serverless user-management system built on AWS — designed as both a working full-stack reference project and a teaching tool for the **AWS DevOps Professional** track (Domain 3: Resilient Cloud Solutions).

A React frontend talks to a serverless backend where signup is decoupled through a message queue, login and listing are handled synchronously, and every piece of compute, messaging, and storage is provisioned as a discrete, least-privilege AWS resource.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [AWS Resources](#aws-resources)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [License](#license)

---

## Architecture Overview

The system has two distinct request paths: a **synchronous path** for login and listing, and an **asynchronous, queue-backed path** for signup.

```
                                   ┌─────────────────────┐
                                   │   React Frontend     │
                                   │   (Vite, port 5173)  │
                                   └──────────┬───────────┘
                                              │ HTTPS
                                              ▼
                                   ┌─────────────────────┐
                                   │  Amazon API Gateway   │
                                   │   (HTTP API)          │
                                   └──────────┬───────────┘
                     ┌────────────────────────┼────────────────────────┐
                     │ POST /signup            │ POST /login            │ GET /users
                     ▼                         ▼                         ▼
          ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
          │  signup-producer     │   │       login          │   │     list-users        │
          │  (Lambda)             │   │     (Lambda)          │   │     (Lambda)           │
          └──────────┬───────────┘   └──────────┬───────────┘   └──────────┬───────────┘
                     │ sends message              │ GetItem                  │ Scan
                     ▼                            ▼                          ▼
          ┌─────────────────────┐                          ┌─────────────────────┐
          │  Amazon SQS           │                          │   Amazon DynamoDB     │
          │  signup-queue         │                          │   codedynasty-users   │
          └──────────┬───────────┘                          └──────────┬───────────┘
                     │ triggers (batch size 1)                          ▲
                     ▼                                                  │
          ┌─────────────────────┐                                      │
          │  signup-worker        │ ── PutItem ──────────────────────────┘
          │  (Lambda)              │
          └──────────┬───────────┘
                     │ on repeated failure (maxReceiveCount = 3)
                     ▼
          ┌─────────────────────┐
          │  Amazon SQS            │
          │  signup-dlq            │
          └─────────────────────┘
```

**Why signup is queued but login/listing are not:** signup is a write that can tolerate a few hundred milliseconds of asynchronous delay, and decoupling it behind SQS means a traffic spike gets absorbed by the queue instead of overwhelming DynamoDB write capacity or the Lambda concurrency pool. Login and listing are reads the caller is actively waiting on, so they go straight to DynamoDB and return a response in the same request.

Every Lambda function has its own IAM execution role scoped to only what that function needs — `signup-producer` can send to SQS but cannot touch DynamoDB; `login` and `list-users` are read-only.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Compute | AWS Lambda (Node.js 18.x) |
| API | Amazon API Gateway (HTTP API) |
| Messaging | Amazon SQS (Standard queue + dead-letter queue) |
| Database | Amazon DynamoDB |
| Shared dependencies | AWS Lambda Layers |
| Access control | AWS IAM (per-function least-privilege roles) |
| Observability | Amazon CloudWatch (Logs + Alarms) |

---

## Project Structure

```
codedynasty/                     # Frontend (React + Vite)
├── node_modules/
├── public/
├── src/
│   ├── api/
│   │   └── client.js            # reads VITE_API_URL, wraps fetch calls
│   └── ...
├── .env.example
├── .env.local                   # not committed — see Environment Variables
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js

codedynasty-backend/             # Backend (AWS Lambda functions)
├── functions/
│   ├── config/                  # shared constants module
│   ├── signup/
│   │   └── signup-producer.zip  # validates input, sends message to SQS
│   ├── signupWorker/
│   │   └── signup-worker.zip    # consumes SQS, writes user to DynamoDB
│   ├── login/
│   │   └── login.zip            # validates credentials against DynamoDB
│   └── listUsers/
│       └── list-users.zip       # Scan operation, returns all users
├── layers/
│   └── common/
│       ├── nodejs/              # shared node_modules (AWS SDK clients, bcrypt, uuid)
│       └── layer.zip
├── package.json
└── README.md
```

> **Download instead of clone:** if you received this project as a ZIP (e.g. via GitHub's **Code → Download ZIP**), extract it and you'll see exactly this layout — the frontend (`codedynasty/`) and backend (`codedynasty-backend/`) sit side by side as two independent projects.

---

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm
- An AWS account (only needed if you intend to deploy the backend — the frontend can run against an already-deployed API)

### 1. Get the code

Clone the repository, or download it as a ZIP from GitHub (**Code → Download ZIP**) and extract it.

```bash
git clone https://github.com/<your-org>/codedynasty.git
cd codedynasty
```

### 2. Frontend setup

```bash
cd codedynasty
npm install
cp .env.example .env.local
```

Edit `.env.local` and set `VITE_API_URL` to your deployed API Gateway Invoke URL (see [Environment Variables](#environment-variables)).

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 3. Backend setup (optional — only if deploying your own AWS resources)

The backend functions in `codedynasty-backend/functions/` are pre-packaged as deployment-ready `.zip` files. To rebuild a function after changing its source:

```bash
cd codedynasty-backend/functions/signup
npm install
npm run build   # produces signup-producer.zip
```

Repeat for `signupWorker`, `login`, and `listUsers`, then upload each zip to its corresponding Lambda function in the AWS Console (or via your IaC/CI pipeline once that's in place). See [AWS Resources](#aws-resources) and [Deployment](#deployment) below for what needs to exist on the AWS side.

---

## Environment Variables

### Frontend (`codedynasty/.env.local`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the deployed API Gateway HTTP API | `https://abc123.execute-api.us-east-1.amazonaws.com` |

> `.env.local` is gitignored. Never commit real environment files — use `.env.example` as the template for what variables are required, without real values.

### Backend (Lambda environment variables, set per-function in the AWS Console or IaC)

| Function | Variable | Description |
|---|---|---|
| `signup-producer` | `SQS_QUEUE_URL` | URL of the `codedynasty-signup-queue` |
| `signup-worker` | `USERS_TABLE_NAME` | Name of the DynamoDB table (`codedynasty-users`) |
| `login` | `USERS_TABLE_NAME` | Name of the DynamoDB table (`codedynasty-users`) |
| `list-users` | `USERS_TABLE_NAME` | Name of the DynamoDB table (`codedynasty-users`) |

> Anything more sensitive than a queue URL or table name (database credentials, signing secrets) belongs in **AWS Secrets Manager** or **SSM Parameter Store**, not a plain Lambda environment variable.

---

## API Reference

Base URL: your API Gateway Invoke URL (e.g. `https://abc123.execute-api.us-east-1.amazonaws.com`)

### `POST /signup`

Enqueues a new signup request for asynchronous processing.

**Request body**
```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response — `202 Accepted`**
```json
{
  "message": "Signup request received and is being processed."
}
```

### `POST /login`

Validates credentials synchronously against DynamoDB.

**Request body**
```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response — `200 OK`**
```json
{
  "message": "Login successful.",
  "email": "user@example.com"
}
```

**Response — `401 Unauthorized`**
```json
{
  "message": "Invalid email or password."
}
```

### `GET /users`

Returns all registered users. Password hashes are stripped from the response.

**Response — `200 OK`**
```json
{
  "users": [
    { "email": "user@example.com", "createdAt": "2026-06-10T12:00:00Z" }
  ]
}
```

---

## AWS Resources

| Resource | Name | Purpose |
|---|---|---|
| DynamoDB table | `codedynasty-users` | Partition key `email` · On-Demand capacity · stores user records |
| SQS queue | `codedynasty-signup-queue` | Buffers signup requests between producer and worker |
| SQS dead-letter queue | `codedynasty-signup-dlq` | Captures signup messages that fail after 3 attempts |
| Lambda layer | `common` | Shared dependencies (AWS SDK clients, bcrypt, uuid) used by all four functions |
| Lambda function | `signup-producer` | Validates input, sends message to SQS |
| Lambda function | `signup-worker` | Triggered by SQS, writes new user to DynamoDB |
| Lambda function | `login` | Reads from DynamoDB, validates credentials |
| Lambda function | `list-users` | Scans DynamoDB, returns all users |
| API Gateway | `codedynasty-api` (HTTP API) | Routes: `POST /signup`, `POST /login`, `GET /users` |
| IAM roles | `signup-producer-role`, `signup-worker-role`, `login-role`, `list-users-role` | One least-privilege role per function |
| CloudWatch | `/aws/lambda/<function-name>` log groups + `signup-worker-error-alarm` | Logs (14-day retention) and a baseline error alarm |

---

## Deployment

This project is currently deployed manually through the AWS Management Console as a teaching exercise (see the accompanying class material for the full console walkthrough). At a high level:

1. Create the DynamoDB table.
2. Create the SQS queue and dead-letter queue.
3. Create the shared Lambda layer.
4. Create the four IAM roles.
5. Deploy the four Lambda functions and attach the layer + roles.
6. Create the HTTP API in API Gateway and wire up the three routes.
7. Attach the SQS trigger to `signup-worker`.
8. Configure CloudWatch log retention and a baseline alarm.
9. Point the frontend's `VITE_API_URL` at the API's Invoke URL.

> **Roadmap note:** this manual process is intentional for now — it's the foundation for the Infrastructure as Code (CloudFormation / Terraform) and CI/CD material later in the course, where the same nine steps get automated instead of clicked through.

---

## Roadmap

- [ ] Replace manual console deployment with CloudFormation or Terraform
- [ ] Add a CI/CD pipeline (build, package, deploy on push)
- [ ] Replace DynamoDB `Scan` in `list-users` with a `Query` against a GSI for pagination at scale
- [ ] Move configuration secrets to AWS Secrets Manager / SSM Parameter Store
- [ ] Add request authentication (JWT or Lambda authorizer) ahead of `/users`
- [ ] Add X-Ray tracing across the signup flow for distributed tracing

---

## License

MIT — see `LICENSE` for details.