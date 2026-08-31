# scripts

Small automation scripts, grouped by platform. Private repo.

## Layout

One folder per platform. Each script is self-contained.

| Folder | Holds |
| --- | --- |
| `google-apps-script/` | Google Apps Script projects (`.gs` plus `appsscript.json`) |

Add `python/`, `bash/`, or `powershell/` beside it as needed.

## Conventions

- Put every configurable value in one block at the top of the file.
- Use placeholder values only. Never commit a real name, address, or document.
- Write a comment header that says what the script does and how to install it.
- Keep real data out. The `.gitignore` blocks `*.pdf`, `*.eml`, and `*.csv`.

## google-apps-script/

### forward-anthropic-invoice.gs

Forwards the monthly Anthropic invoice PDF to a second address, such as an
accountant. The source email carries two PDFs. This script sends only the
one whose name starts with `Invoice`.

What it does on each run:

1. Searches Gmail for the statement mail from Anthropic.
2. Keeps the `Invoice*.pdf` attachment and drops the receipt.
3. Renames the file to `yyyy-MM_<original name>`.
4. Sends it under the subject `[Anthropic][Invoice] yyyy/MM - <your name>`.
5. Labels the thread `invoice-forwarded`, which also prevents a second send.

Install:

1. Open <https://script.google.com> and create a project.
2. Paste `forward-anthropic-invoice.gs` into `Code.gs`.
3. Set the values in the configuration block, including `FORWARD_TO`.
4. Set the project timezone in Project Settings. It must match `EXPECT_TZ`,
   or `installTrigger` refuses to run.
5. Run `forwardAnthropicInvoice` once and accept the Gmail permission.
6. Run `installTrigger` once. It then runs monthly on `RUN_DAY`.

Note: the label goes on only after a successful send, so a failed run is
retried instead of losing the invoice.
