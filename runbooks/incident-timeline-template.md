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
