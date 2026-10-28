// Lambda: signupProducer
// Trigger: API Gateway POST /signup

const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const {
  DynamoDBClient,
  GetItemCommand
} = require("@aws-sdk/client-dynamodb");

const { marshall } = require("@aws-sdk/util-dynamodb");


const sqs = new SQSClient({
  region: process.env.AWS_REGION || "us-east-1"
});

const db = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1"
});


const TABLE = process.env.USERS_TABLE;


exports.handler = async (event) => {

  try {

    const {
      name,
      email,
      password
    } = JSON.parse(event.body || "{}");


    if (!name || !email || !password) {
      return res(400, {
        message: "name, email, and password are required"
      });
    }


    // Check if email already exists
    const existing = await db.send(
      new GetItemCommand({
        TableName: TABLE,
        Key: marshall({
          email
        })
      })
    );


    if (existing.Item) {
      return res(409, {
        message: "Email already exists"
      });
    }


    // Send message to SQS
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,

        MessageBody: JSON.stringify({
          name,
          email,
          password
        })
      })
    );


    return res(202, {
      message: "Registration queued. You'll appear in the registry shortly."
    });


  } catch (error) {

    console.error("Signup producer failed:", error);

    return res(500, {
      message: "Internal Server Error"
    });

  }

};


const res = (statusCode, body) => ({
  statusCode,

  body: JSON.stringify(body),

  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST"
  }
});