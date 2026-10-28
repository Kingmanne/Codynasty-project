# Post-Incident Review: Injection 3, Downstream Throttling and the Retry Storm

Date: 2026-10-28 | Region: us-east-1 | Owner of all actions: me

## 1. Summary
A game-day injection pointed the signup worker at a DynamoDB table limited to 1 write per second and sent 1,500 signups. DynamoDB throttled the writes, SQS retried them, and 154 messages were dead-lettered, including 108 whose records had already been written. Nothing was permanently lost: all 1,500 signups were recovered. Service was verified restored at 15:28:31 UTC, 46m49s after the storm began.

## 2. Impact (measured)
- Sent: 1,500 signups (run 2, from 14:41:42 UTC). The loop's per-status counts were not captured.
- Written during the storm: 1,454. Dead-lettered and not written: 46.
- DLQ held 154 messages (153 distinct emails sampled, 154 redriven). 108 of them were already written.
- Peak throttling: 461 WriteThrottleEvents per minute (14:44).
- Final loss after redrive: 0 of 1,500 (reconciled against both tables: 1,500 present, 0 missing, 108 in both).
- Run 1 (400 requests) caused 21 throttle events and no loss.

## 3. Timeline (UTC, 2026-10-28)
| Time | Event | Source |
|---|---|---|
| 14:32:19 | T0, run 1 start | date -u |
| 14:32:37 | Worker repointed to throttle-test table | Lambda LastModified |
| 14:34:09 | Run 1: 400 requests, all 202 | terminal |
| 14:35 | Run 1: 21 throttle events, absorbed | CloudWatch |
| 14:41:42 | Run 2: 1,500 requests start | date -u |
| 14:43:02 | anomalydetectionalarm OK to ALARM | alarm history |
| 14:43:32 | signup-worker-error-alarm OK to ALARM | alarm history |
| 14:44 | Throttle peak, 461 per minute | CloudWatch |
| ~14:45 | Queue 429 visible / 223 in flight | SQS |
| 14:46:03 | Concurrency cut 20 to 2 | Lambda LastModified |
| 14:48:05 | DLQ 12 | SQS |
| 14:53:07 | DLQ 150 | SQS |
| 15:03:16 | Main queue empty | SQS |
| 15:18:26 | Table restored, concurrency restored to 5 | Lambda |
| ~15:22 | DLQ redriven at 5 messages per second | SQS |
| ~15:24 | 154 records in production table | DynamoDB |
| 15:28:31 | Fresh signup verified | get-item |

## 4. Detection
| Injection | MTTD | Data lost | First signal | Should have fired |
|---|---|---|---|---|
| 1 IAM permission | 6m36s | 0 of 5 | codedynasty-dlq-has-messages | Worker error alarm (Errors stayed flat) |
| 2 Visibility timeout | never detected | not measured | none | Business-level metric (records created vs signups accepted) |
| 3 DynamoDB throttling | 1m20s from run 2 start | 0 of 1,500 | anomalydetectionalarm | WriteThrottleEvents > 0 |
| 4 API Gateway throttle | 1m29s | 0 | anomalydetectionalarm | 4xx-rate alarm separate from 5xx |

anomalydetectionalarm watches Invocations of signup-producer, so it flagged unusual traffic, not the database throttling. Nothing watched WriteThrottleEvents.

## 5. Root cause (five whys)
1. Why were signups dead-lettered? They reached maxReceiveCount (3) without succeeding.
2. Why? Throttled writes failed and returned to the queue, and every receive counts, including waits in a deep backlog under a low concurrency cap (likely, partly inferred).
3. Why did 108 already-written signups also go to the DLQ? The worker reports ConditionalCheckFailedException on a repeat as a failure.
4. Why was it not caught early? No alarm watches DynamoDB throttling, and SDK retries hid the first throttle events.
5. Root cause: the queue retry budget and worker error handling were not designed for a throttled dependency, and no alarm watched that dependency.

## 6. Resolution
- 14:46:03: concurrency 20 to 2. This stopped throttling and in-flight churn but did not speed the drain (the 1 WCU ceiling caps it at about 1 write per second) and did not stop dead-lettering.
- 15:18: worker restored to the production table, concurrency restored to 5.
- ~15:22: all 154 DLQ messages redriven at 5 per second.
- The course's claim that fewer writers finish sooner was not supported by this data.

## 7. What went well
- Conditional write prevented overwrites.
- The DLQ preserved every failed message, which made full recovery possible.
- The anomaly alarm fired within 1m20s.
- Reconciliation by email list gave a defensible zero-loss figure.

## 8. Corrections of error
| # | Action | Owner | Due | Verify |
|---|---|---|---|---|
| 1 | Alarm on WriteThrottleEvents > 0 for the users table | me | 2026-11-04 | Alarm fires in a repeat 1 WCU test |
| 2 | Treat ConditionalCheckFailedException as success in the worker | me | 2026-11-04 | Duplicate delivery no longer reaches the DLQ |
| 3 | Business metric: signups accepted vs records created, with alarm | me | 2026-11-11 | Would have caught Injection 2 |
| 4 | Raise maxReceiveCount to at least 5 and test with capped concurrency | me | 2026-11-11 | Repeat storm: no untried dead-letters |
| 5 | Alarm on API 4xx rate and 5xx separately | me | 2026-11-11 | Repeat Injection 4 pages on 4xx |
| 6 | Stop queueing plaintext passwords | me | 2026-11-25 | Queue bodies contain no password |
| 7 | Codify the backend in SAM/CloudFormation and reconcile repo with deployed code | me | 2026-11-30 | Drift detection reports IN_SYNC |

## Also found
- Original values were not recorded before every change (concurrency, env var).
- Worker logs err.message only, not err.name.
- DetailedMetricsEnabled is false on the API stage.
- The canary passed during Injection 4 (15:47:09 and 15:52:09, both 202): it measures path availability, not capacity.
