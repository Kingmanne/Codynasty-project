// Lambda: login  |  Trigger: API Gateway POST /login
// Reserved concurrency: set higher than other functions (always-warm candidate)

const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const secretsClient = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const TABLE = process.env.USERS_TABLE;

// Cache secret during Lambda warm executions
let cachedSecret;

// Fetch JWT secret from Secrets Manager
async function getJwtSecret() {
  if (cachedSecret) {
    return cachedSecret;
  }

  const result = await secretsClient.send(
    new GetSecretValueCommand({
      SecretId: process.env.JWT_SECRET_ID,
    }),
  );

  cachedSecret = JSON.parse(result.SecretString).jwtSecret;

  return cachedSecret;
}

exports.handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body || "{}");

    if (!email || !password) {
      return res(400, {
        message: "email and password are required",
      });
    }

    const result = await db.send(
      new GetItemCommand({
        TableName: TABLE,

        Key: marshall({
          email,
        }),
      }),
    );

    if (!result.Item) {
      return res(401, {
        message: "Invalid email or password",
      });
    }

    const user = unmarshall(result.Item);

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return res(401, {
        message: "Invalid email or password",
      });
    }

    // Get JWT secret from Secrets Manager
    const JWT_SECRET = await getJwtSecret();

    const token = jwt.sign(
      {
        email: user.email,
        name: user.name,
      },

      JWT_SECRET,

      {
        expiresIn: "7d",
      },
    );

    return res(200, {
      token,

      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);

    return res(500, {
      message: "Internal server error",
    });
  }
};

const res = (statusCode, body) => ({
  statusCode,

  body: JSON.stringify(body),

  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});
