exports.handler = async (event) => {
  const failures = []

  for (const record of event.Records) {
    try {
      const { name, email, password } = JSON.parse(record.body)

      const existing = await db.send(new GetItemCommand({
        TableName: TABLE,
        Key: marshall({ email }),
      }))
      if (existing.Item) { console.log("Duplicate ignored:", email); continue }

      const passwordHash = await bcrypt.hash(password, 10)
      await db.send(new PutItemCommand({
        TableName: TABLE,
        Item: marshall({ email, name, passwordHash, createdAt: new Date().toISOString() }),
      }))
      console.log("Registered:", email)

    } catch (err) {
      console.error("Failed to process record:", record.messageId, err)
      failures.push({ itemIdentifier: record.messageId })
    }
  }

  // Only failed records go back to SQS for retry — successes are NOT retried
  return { batchItemFailures: failures }
}