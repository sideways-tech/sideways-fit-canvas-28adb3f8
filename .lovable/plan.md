

## Problem Diagnosis

The email_send_log shows every assessment email fails with:

```text
Email API error: 404 {"type":"run_not_found","message":"Run not found or expired"}
```

**Root cause:** The `send-assessment-report` function generates a random `run_id` via `uuidv4()` and includes it in the queue payload. When `process-email-queue` calls `sendLovableEmail`, it passes this fabricated `run_id` to the email API, which rejects it because no such run exists on the server.

For transactional emails sent without a pre-created email run, the payload must omit `run_id` and instead use an `idempotency_key`. The email API will then create a run inline.

## Plan

### Step 1: Fix the email payload in `send-assessment-report`

In `supabase/functions/send-assessment-report/index.ts`, change the enqueued payload:

- **Remove** `run_id: uuidv4()` — this is the field causing the 404
- **Add** `idempotency_key: messageId` — uses the existing UUID as a deduplication key, which triggers inline run creation on the API side

The rest of the payload (`to`, `from`, `sender_domain`, `subject`, `html`, `text`, `purpose`, `label`, `message_id`) stays the same.

### Step 2: Redeploy the edge function

Deploy `send-assessment-report` so the fix takes effect.

### Step 3: Verify

Check edge function logs and email_send_log after a test submission to confirm emails transition from `pending` to `sent`.

---

**Technical detail:** The Lovable email API requires either a valid pre-existing `run_id` (from a prior API call) or an `idempotency_key` with `purpose: "transactional"` (to create a run inline). The current code fabricates a UUID for `run_id`, which the API cannot find, hence the 404.

