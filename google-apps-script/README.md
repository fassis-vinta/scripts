# google-apps-script/

Google Apps Script projects. Each `.gs` file is one standalone project.

`appsscript.json` is the manifest. It sets the project timezone to
`America/Sao_Paulo` and the runtime to V8.

To install a script, open <https://script.google.com>, create a project, and
paste the `.gs` file into `Code.gs`. Each script below lists its own steps.

---

## forward-anthropic-invoice.gs

Forwards the monthly Anthropic invoice PDF to a second address, such as an
accountant. The source email carries two PDFs. This script sends only the
one whose name starts with `Invoice`.

What it does on each run:

1. Searches Gmail for the statement mail from Anthropic.
2. Keeps the `Invoice*.pdf` attachment and drops the receipt.
3. Renames the file to `yyyy-MM_<original name>`.
4. Sends it under the subject `[Anthropic][Invoice] yyyy/MM - <your name>`.
5. Labels the thread `invoice-forwarded`, which also prevents a second send.

### Configuration

All values sit in one block at the top of the file.

| Name | Does |
| --- | --- |
| `FORWARD_TO` | Address that receives the invoice. Set this first. |
| `MY_NAME` | Shown at the end of the subject line. |
| `RECIPIENT` | First word of the greeting in the message body. |
| `SENDER` | Address the statement mail comes from. |
| `FILE_PREFIX` | Attachment name must start with this. Default `Invoice`. |
| `DONE_LABEL` | Label that marks a thread as sent. Default `invoice-forwarded`. |
| `LOOKBACK` | Gmail search window. Default `newer_than:3d`. |
| `RUN_DAY` | Day of the month for the trigger. Default `13`. |
| `RUN_HOUR` | Hour of the day, in the project timezone. Default `9`. |
| `EXPECT_TZ` | Timezone the trigger expects. Must match Project Settings. |

### Install

1. Open <https://script.google.com> and create a project.
2. Paste `forward-anthropic-invoice.gs` into `Code.gs`.
3. Set the values in the configuration block, including `FORWARD_TO`.
4. Set the project timezone in Project Settings. It must match `EXPECT_TZ`,
   or `installTrigger` refuses to run.
5. Run `forwardAnthropicInvoice` once and accept the Gmail permission.
6. Run `installTrigger` once. It then runs monthly on `RUN_DAY`.

### Notes

- The label goes on only after a successful send, so a failed run is retried
  instead of losing the invoice.
- The period in the subject comes from the arrival date of the mail. Anthropic
  charges up front, so the arrival month is the billing month.
- The rename applies to a copy of the attachment. The file on the original
  mail stays as it is.
- `installTrigger` deletes any earlier trigger for the same function first.
  You can run it again after a configuration change.
