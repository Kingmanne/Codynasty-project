// Lambda: signupProducer  |  Trigger: API Gateway POST /signup
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs")
const sqs = new SQSClient({ region: process.env.AWS_REGION || "us-east-1" })

exports.handler = async (event) => {
  const { name, email, password } = JSON.parse(event.body || '{}')
  if (!name || !email || !password)
    return res(400, { message: "name, email, and password are required" })

  await sqs.send(new SendMessageCommand({
    QueueUrl: process.env.SQS_QUEUE_URL,
    MessageBody: JSON.stringify({ name, email, password }),
  }))

  return res(202, { message: "Registration queued. You'll appear in the registry shortly." })
}

const res = (statusCode, body) => ({
  statusCode, body: JSON.stringify(body),
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
})
