# CodeDynasty Game Day — Incident Timeline

## Incident details

- Injection:
- Date:
- AWS region: us-east-1
- Incident lead:
- Scribe:
- Start time (UTC):
- Recovery time (UTC):

## Timeline

| UTC timestamp | Event / observation | Evidence source | Action / result |
|---|---|---|---|
| | T0 — failure injected | | |
| | First automated signal | CloudWatch / SNS / EventBridge | |
| | Incident acknowledged | | |
| | Containment started | | |
| | Root cause identified | Logs / X-Ray / CloudTrail | |
| | Remediation applied | | |
| | Recovery verified | | |
| | Incident closed | | |

## Measurements

- Mean time to detect (MTTD):
- Mean time to acknowledge (TTA):
- Mean time to recover (MTTR):
- Signups submitted:
- Signups successfully written:
- Messages remaining in main queue:
- Messages remaining in DLQ:
- Confirmed data loss:
- Duplicate processing observed:
- Alarms that fired:
- Expected signals that did not fire:

## Evidence

- CloudWatch dashboard / alarm:
- Lambda logs:
- X-Ray trace:
- CloudTrail event ID:
- Queue metrics:
- Screenshots or saved evidence:

## Lessons and follow-up

- What worked:
- What did not work:
- Runbook steps that need correction:
- Follow-up action, owner and due date:

## Game Day Preparation Start

- Preparation timestamp: 2026-10-28 10:30:40 UTC
- Baseline signup: HTTP 202; verified in DynamoDB.
- T0 (fault injection): Not started.

## Injection 1 — The Permission That Disappeared

### Timeline and evidence

- T0 — IAM policy detached: 2026-10-28 10:46:42 UTC.
- CloudTrail event: DetachRolePolicy.
- CloudTrail Event ID: 1041030c-7a47-46be-873f-5448560b50d9.
- IAM role affected: signup-worker-role.
- Policy detached: AmazonDynamoDBFullAccess.
- First recorded DLQ alarm transition: codedynasty-dlq-has-messages changed from OK to ALARM at 10:53:18 UTC.
- Time from policy detachment to first recorded alarm: 6 minutes 36 seconds.
- First observed DynamoDB PutItem AccessDeniedException in worker logs: approximately 10:53:30 UTC.
- Additional alarms: codedynasty-dlq-depth-alarm entered ALARM at 10:53:48 UTC; codedynasty-dlq-age-alarm entered ALARM at 10:58:32 UTC.
- Recovery action: AmazonDynamoDBFullAccess was reattached to signup-worker-role.
- Recovery action: messages were redriven from codedynasty-signup-dlq.
- Worker logs showed successful processing at approximately 11:01:22–11:01:27 UTC.
- Alarm recovery: codedynasty-dlq-has-messages returned to OK at 11:04:18 UTC; codedynasty-dlq-age-alarm at 11:04:32 UTC; codedynasty-dlq-depth-alarm at 11:04:48 UTC.

### Impact and recovery verification

- Expected Game Day test registrations: 5.
- Verified registrations found in codedynasty-users: 5.
- Missing registrations: 0.
- Measured data loss for these five test registrations: 0.
- Recovery outcome: all five test registrations were recovered and verified.

### Post-incident review

**Root cause:** AmazonDynamoDBFullAccess was detached from signup-worker-role, preventing the signup worker from writing registrations to DynamoDB and causing AccessDeniedException errors.

**Impact:** Five Game Day test registrations were affected. All five were recovered after the permission was restored and the dead-letter messages were redriven.

**Detection and response:** CloudWatch DLQ alarms recorded the failure. CloudTrail identified the IAM change, and worker logs exposed the DynamoDB permission error. The role policy was restored and queued messages were recovered.

**What went well:**
- CloudTrail provided evidence of the IAM policy change.
- CloudWatch DLQ alarms indicated that signup processing was failing.
- SQS and the dead-letter queue allowed failed test registrations to be recovered.
- DynamoDB verification confirmed all five test registrations were present.

**Improvements:**
- Review alert thresholds and notification delivery to reduce detection delays.
- Monitor and restrict changes to critical IAM permissions.
- Keep the incident runbook and DLQ redrive instructions current.
- Verify application recovery and data completeness after every remediation.

**Final outcome:** Injection 1 recovered; five of five test registrations verified; zero missing.

## Injection 3 — Downstream Throttling and the Retry Storm

### Incident details

- Date: 2026-10-28
- Region: us-east-1
- Worker environment variable: USERS_TABLE
- Throttle-test table: codedynasty-users-gameday (1 WCU / 1 RCU)
- Event source mapping: batch size 5, ReportBatchItemFailures enabled, maxReceiveCount 3
- Worker concurrency: original 5; raised to 20 for injection; reduced to 2 for containment; restored to 5

### Timeline (UTC)

| UTC time | Event | Evidence source |
|---|---|---|
| 14:32:19 | T0 — Run 1 started | UTC timestamp |
| 14:32:37 | Worker repointed to codedynasty-users-gameday | Lambda LastModified |
| 14:34:09 | Run 1 load started: 400 requests, all HTTP 202 | Terminal |
| 14:35 | Run 1: 21 WriteThrottleEvents, absorbed by SDK retries; no measured loss or alarm | CloudWatch |
| 14:41:42 | Run 2 load started: 1,500 requests (stormB1–stormB1500) | UTC timestamp |
| 14:43:02 | First signal: anomalydetectionalarm changed from OK to ALARM | Alarm history |
| 14:43:32 | signup-worker-error-alarm changed from OK to ALARM | Alarm history |
| 14:44 | WriteThrottleEvents peaked at 461 per minute | CloudWatch |
| Approximately 14:45 | Main queue: 429 visible, 223 in flight; DLQ: 0 | SQS |
| 14:46:03 | Containment: maximum concurrency reduced from 20 to 2 | Lambda LastModified |
| 14:48:05 | In flight: 26; DLQ: 12 | SQS |
| 14:53:07 | DLQ: 150; no throttle datapoints after 14:46 | SQS / CloudWatch |
| 14:57:38 | DLQ: 154; drain approximately 55 writes per minute | SQS |
| 15:03:16 | Main queue empty; throttle-test table contained 1,860 records | SQS / DynamoDB |
| Approximately 15:18 | Worker table restored to codedynasty-users; concurrency restored to 5 at 15:18:26 | Lambda configuration |
| Approximately 15:22 | DLQ redrive completed: 154 messages returned to main queue | SQS |
| Approximately 15:24 | 154 stormB records reported in codedynasty-users after redrive | DynamoDB |
| 15:28:31 | Fresh signup verified in codedynasty-users; recovery-time upper bound | GetItem |

### Measurements

- Run 1 load: 400 requests; 21 WriteThrottleEvents; no alarm; no measured loss.
- Run 2 load: 1,500 requests submitted; all reportedly received HTTP 202, but per-status-code counts were not captured.
- Run 2 records written to throttle-test table: 1,454.
- Run 2 messages dead-lettered and reported as never written: 46.
- DLQ sample: 153 distinct emails among 154 messages; approximately 107 were already written before being dead-lettered.
- Messages redriven to the main queue: 154.
- Records reported in production after redrive: 154 stormB records.
- Final data loss: not yet independently confirmed. Reconcile all 1,500 submitted emails against both tables and the DLQ before declaring zero loss.
- MTTD: 1 minute 20 seconds from Run 2 load start; 10 minutes 43 seconds from Run 1 T0.
- Time to containment: 4 minutes 21 seconds from Run 2 load start.
- Service MTTR upper bound: 56 minutes 12 seconds from T0; 46 minutes 49 seconds from Run 2 start.
- Alarms that fired: anomalydetectionalarm and signup-worker-error-alarm.
- Missing signal: an alarm for WriteThrottleEvents greater than zero on the users table.

### Findings

- The 400-request Run 1 was absorbed by burst capacity; the 1,500-request Run 2 produced sustained throttling and a retry storm.
- SDK retries absorbed some throttling without triggering the current alarms.
- Reducing concurrency from 20 to 2 stopped observed throttling and in-flight churn, but the evidence does not show that it made the backlog drain faster.
- The DLQ grew to 154 messages. At 15:03:16, the main queue was empty and the throttle-test table held 1,860 records.
- The record stormB357 had no worker log lines and no table record; it was reported as dead-lettered without processing.
- Approximately 107 DLQ messages appeared to correspond to records already present in DynamoDB. The worker treated ConditionalCheckFailedException as a failure rather than an idempotent success.
- maxReceiveCount of 3 may be too low for a capped-concurrency consumer handling a deep backlog; validate a higher threshold through controlled testing.
- Worker logs record err.message only, making exception types harder to search.
- The producer queues plaintext passwords. This is a security issue requiring remediation.
- Repository code does not match the deployed signup-worker; reconcile and review before the next deployment.
- API stage DetailedMetricsEnabled is false.

### Corrective actions

| Action | Owner | Due date | Status |
|---|---|---|---|
| Add an alarm for WriteThrottleEvents greater than zero on the users table | TBD | TBD | Open |
| Evaluate increasing maxReceiveCount to at least 5 under controlled testing | TBD | TBD | Open |
| Treat ConditionalCheckFailedException as success when it represents an already-processed registration | TBD | TBD | Open |
| Log err.name as well as a safe error message | TBD | TBD | Open |
| Remove plaintext passwords from queued messages; use a secure credential-handling design | TBD | TBD | Open |
| Reconcile deployed signup-worker with repository code and review the differences | TBD | TBD | Open |
| Record original configuration values before every fault injection or remediation | TBD | TBD | Open |

### Post-incident review

**Root cause:** The 1 WCU throttle-test table could not sustain the injected write load. Increased worker concurrency and SQS redelivery created a retry storm and moved messages to the DLQ.

**Detection:** The anomaly alarm fired 1 minute 20 seconds after Run 2 started. The current alarm set did not detect the initial throttling absorbed by SDK retries.

**Containment:** Worker concurrency was reduced from 20 to 2 at 14:46:03 UTC. Throttling datapoints stopped after approximately 14:46, but messages continued to reach the DLQ.

**Recovery:** The worker was restored to codedynasty-users and concurrency to 5. The 154 DLQ messages were redriven. The notes report 154 stormB records in production afterward and a fresh signup verified at 15:28:31 UTC.

**Data integrity qualification:** Do not claim zero data loss until all 1,500 submitted emails have been reconciled against the throttle-test table, production table, and DLQ evidence. Accepted HTTP 202 responses alone do not prove that every registration was ultimately persisted.

**Final outcome:** Service recovery was observed. Complete data reconciliation and the corrective actions above remain to be verified or completed.
