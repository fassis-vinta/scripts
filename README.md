# scripts

Small automation scripts, grouped by platform. Private repo.

## Layout

One folder per platform. Each script is self-contained. Each folder has its
own README with the details of every script in it.

| Folder | Holds |
| --- | --- |
| [`google-apps-script/`](google-apps-script/README.md) | Google Apps Script projects (`.gs` plus `appsscript.json`) |

Add `python/`, `bash/`, or `powershell/` beside it as needed.

## Scripts

| Script | Does |
| --- | --- |
| [`google-apps-script/forward-anthropic-invoice.gs`](google-apps-script/forward-anthropic-invoice.gs) | Forwards the monthly Anthropic invoice PDF to a second address, such as an accountant. |

## Conventions

- Put every configurable value in one block at the top of the file.
- Use placeholder values only. Never commit a real name, address, or document.
- Write a comment header that says what the script does and how to install it.
- Keep real data out. The `.gitignore` blocks `*.pdf`, `*.eml`, and `*.csv`.
