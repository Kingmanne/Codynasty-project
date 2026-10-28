# CodeDynasty — Backend Lambdas

Node.js 20 Lambda functions for the CodeDynasty app.

## Functions

| Function | Trigger | Purpose |
|---|---|---|
| `signup/producer.js` | API Gateway POST /signup | Pushes signup to SQS, returns 202 |
| `signup/index.js` | SQS event | Reads queue, hashes password, writes to DynamoDB |
| `login/index.js` | API Gateway POST /login | Verifies password, returns JWT |
| `listUsers/index.js` | API Gateway GET /users | Returns all members (JWT protected) |
| `config/index.js` | API Gateway GET /config | Returns AppConfig feature flags |

## Environment Variables (set in Lambda console)

```
USERS_TABLE=codedynasty-users
JWT_SECRET=<generate a strong random string>
SIGNUP_QUEUE_URL=https://sqs.eu-north-1.amazonaws.com/<account>/codedynasty-signup
AWS_REGION=eu-north-1
APPCONFIG_APP=CodeDynasty
APPCONFIG_ENV=Production
APPCONFIG_PROFILE=CodeDynastyConfig
```

## DynamoDB Table

- Table name: `codedynasty-users`
- Partition key: `email` (String)
- No sort key needed

## Concurrency Settings (for teaching demos)

- `listUsers`: set Reserved Concurrency = 2, then load test to demo throttling
- `login`: candidate for Provisioned Concurrency (always warm, critical path)
- `signup/index.js` (worker): Reserved Concurrency = 5 (controls queue processing speed)

## SQS Setup

- Queue: `codedynasty-signup` (Standard Queue)
- Dead Letter Queue: `codedynasty-signup-dlq` (maxReceiveCount: 3)
- Visibility timeout: 30s (must be >= Lambda timeout)
