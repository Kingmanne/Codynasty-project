// Lambda: listUsers  |  Trigger: API Gateway GET /users
// 🔧 CONCURRENCY DEMO: set reserved concurrency to 2, then hammer with 10 requests
// Watch: 429 TooManyRequestsException in CloudWatch
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb")
const { unmarshall } = require("@aws-sdk/util-dynamodb")
const jwt = require("jsonwebtoken")

const db = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" })
const TABLE = process.env.USERS_TABLE || "codedynasty-users"
const JWT_SECRET = process.env.JWT_SECRET

exports.handler = async (event) => {
  // Validate JWT
  const auth = event.headers?.Authorization || event.headers?.authorization
  if (!auth) return res(401, { message: "Missing authorization header" })

  try {
    jwt.verify(auth.replace("Bearer ", ""), JWT_SECRET)
  } catch {
    return res(401, { message: "Invalid or expired token" })
  }

  try {
    // Paginated scan — handles tables larger than 1MB
    let items = []
    let lastKey = undefined

    do {
      const result = await db.send(new ScanCommand({
        TableName: TABLE,
        ExclusiveStartKey: lastKey,
        // 🔒 Never return passwordHash — projection expression enforces it at DB level
        ProjectionExpression: "#n, email, createdAt",
        ExpressionAttributeNames: { "#n": "name" } // 'name' is a reserved word in DynamoDB
      }))

      items = items.concat(result.Items.map(item => unmarshall(item)))
      lastKey = result.LastEvaluatedKey
    } while (lastKey)

    return res(200, { users: items })

  } catch (err) {
    console.error("listUsers error:", err)
    return res(500, { message: "Internal server error" })
  }
}

const res = (statusCode, body) => ({
  statusCode, body: JSON.stringify(body),
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
})