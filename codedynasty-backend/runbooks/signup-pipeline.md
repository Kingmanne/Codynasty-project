# Runbook: CodeDynasty Signup Pipeline

## Symptoms

- Alarm `codedynasty-queue-backlog-alarm` or `signup-worker-error-alarm` enters ALARM.
- Users report that signup succeeded but their account is missing.
- API returns 5xx responses.
- Queue age or DLQ depth increases unexpectedly.

## Immediate checks (first 3 minutes)

1. Open CloudWatch > Dashboards > `codedynasty-triage`.
2. Check the SQS event source mapping:

   ```bash
   aws lambda get-event-source-mapping \
     --uuid 7a376ac1-c3ca-4637-8371-d4d77cd28f49 \
     --region us-east-1
   ```

3. Check the main queue:

   ```bash
   aws sqs get-queue-attributes \
     --queue-url https://sqs.us-east-1.amazonaws.com/371510064293/codedynasty-signup-queue \
     --attribute-names ApproximateNumberOfMessagesVisible ApproximateNumberOfMessagesNotVisible ApproximateAgeOfOldestMessage \
     --region us-east-1
   ```

4. Check the dead-letter queue:

   ```bash
   aws sqs get-queue-attributes \
     --queue-url https://sqs.us-east-1.amazonaws.com/371510064293/codedynasty-signup-dlq \
     --attribute-names ApproximateNumberOfMessagesVisible ApproximateNumberOfMessagesNotVisible ApproximateAgeOfOldestMessage \
     --region us-east-1
   ```

5. Inspect recent changes in CloudTrail > Event history. Filter to the last two hours and relevant write-management events.

## Decision points

- Worker errors rise, throttles remain low: investigate application errors and IAM permissions.
- Lambda throttles rise: inspect concurrency and event source mapping settings.
- Queue age rises while the worker is idle: inspect the event source mapping and its state.
- DynamoDB throttling rises: inspect table capacity, consumed capacity and retry behaviour.
- API Gateway returns 429: inspect stage and route throttling settings.
- API Gateway returns 5xx: inspect integration status, Lambda errors and request logs.

## Containment

1. Record the incident start time (T0) in UTC.
2. Capture the current alarm state, queue metrics and relevant logs.
3. If processing is unsafe, pause the consumer by disabling the confirmed event source mapping:

   ```bash
   aws lambda update-event-source-mapping \
     --uuid 7a376ac1-c3ca-4637-8371-d4d77cd28f49 \
     --no-enabled \
     --region us-east-1
   ```

4. Confirm the mapping state before proceeding.
5. Do not set reserved concurrency to zero as a substitute for containment.
6. Do not purge either queue.
7. Do not detach policies or change capacity settings outside the approved, isolated game-day injection.

## Recovery

1. Identify the cause from CloudWatch logs, X-Ray traces, CloudTrail events and current configuration.
2. Restore the known-good IAM, Lambda, SQS, DynamoDB or API Gateway configuration appropriate to the incident.
3. Confirm the configuration before re-enabling processing.
4. If the trigger was disabled, restore it:

   ```bash
   aws lambda update-event-source-mapping \
     --uuid 7a376ac1-c3ca-4637-8371-d4d77cd28f49 \
     --enabled \
     --region us-east-1
   ```

5. Monitor the main queue and DLQ. Redrive DLQ messages only after confirming that the underlying cause is fixed and redrive is safe.
6. For archived events, validate the replay scope before starting a replay. Check idempotency and reconcile resulting records.
7. For infrastructure drift, identify the actual application stack and review the proposed changes before redeployment.

## Escalation

Escalate if the cause remains unknown after 15 minutes, if data loss is suspected, or if recovery is not completed within the 30-minute game-day hard stop.

For the exercise, stop the injection and restore known-good settings at the hard stop. Do not begin another injection while the current one remains unresolved.

## Verification

- Event source mapping is in the intended state.
- Main queue depth and oldest-message age are falling.
- DLQ messages have been investigated and reconciled.
- CloudWatch alarms have returned to the expected state.
- A controlled test signup has been confirmed in `codedynasty-users`.
- The account record does not expose password hashes through GET /users.
- A healthy canary completes two consecutive runs.
- Record timestamps, counts, evidence and any runbook corrections.

## Evidence to capture

- UTC timestamp of injection, first signal, containment and recovery.
- CloudWatch alarm history and dashboard graphs.
- Relevant Lambda logs and X-Ray trace IDs.
- CloudTrail event IDs for configuration or IAM changes.
- Queue and DLQ counts before and after recovery.
- Number of submitted signups, created records, duplicates and unreconciled messages.
