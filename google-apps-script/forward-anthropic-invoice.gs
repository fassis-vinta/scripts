/**
 * Forwards only the "Invoice-*.pdf" attachment from the monthly
 * Anthropic statement email to a second address.
 *
 * The source email carries two PDFs (Invoice-*.pdf and Receipt-*.pdf).
 * This script sends the Invoice one only.
 *
 * Setup:
 *   1. Go to https://script.google.com and make a new project.
 *   2. Paste this file into Code.gs and set FORWARD_TO below.
 *   2b. Set the project timezone to America/Sao_Paulo (UTC-3):
 *       Project Settings -> Time zone -> "(GMT-03:00) Sao Paulo".
 *       Triggers use this value. The code does not control it.
 *   3. Run forwardAnthropicInvoice() once. Accept the Gmail permission.
 *   4. Run installTrigger() once. It then runs on the 13th of each month.
 */

// ---- Configuration -------------------------------------------------------
var FORWARD_TO   = 'CHANGE-ME@example.com';
var MY_NAME      = 'Jane Doe';          // shown in the subject line
var RECIPIENT    = 'John';              // first word of the greeting
var SENDER       = 'invoice+statements@mail.anthropic.com';
var FILE_PREFIX  = 'Invoice';          // attachment name must start with this
var DONE_LABEL   = 'invoice-forwarded'; // stops a second send of the same mail
var LOOKBACK     = 'newer_than:3d';     // mail arrives on the 12th; we run on the 13th
var RUN_DAY      = 13;                  // day of the month for the trigger
var RUN_HOUR     = 9;                   // hour of the day, in the project timezone
var EXPECT_TZ    = 'America/Sao_Paulo'; // UTC-3, Brasilia. Must match Project Settings.
// --------------------------------------------------------------------------

function forwardAnthropicInvoice() {
  var label = GmailApp.getUserLabelByName(DONE_LABEL) ||
              GmailApp.createLabel(DONE_LABEL);

  var query = 'from:' + SENDER +
              ' has:attachment filename:pdf' +
              ' -label:' + DONE_LABEL +
              ' ' + LOOKBACK;

  var threads = GmailApp.search(query, 0, 20);

  threads.forEach(function (thread) {
    var sent = 0;

    thread.getMessages().forEach(function (message) {
      var invoices = message.getAttachments().filter(function (file) {
        var name = file.getName();
        return name.indexOf(FILE_PREFIX) === 0 && /\.pdf$/i.test(name);
      });

      if (invoices.length === 0) { return; }

      var received = message.getDate();
      // Period comes from the arrival date, read in the project timezone.
      // Arrival month is the billing month: Anthropic charges up front.
      var period = Utilities.formatDate(received, Session.getScriptTimeZone(), 'yyyy/MM');

      // Prefix each file with the period, so the recipient can sort by name.
      // copyBlob() renames a copy; the file on the original mail is untouched.
      var stamp = Utilities.formatDate(received, Session.getScriptTimeZone(), 'yyyy-MM') + '_';
      var renamed = invoices.map(function (file) {
        return file.copyBlob().setName(stamp + file.getName());
      });

      GmailApp.sendEmail(FORWARD_TO,
        '[Anthropic][Invoice] ' + period + ' - ' + MY_NAME,
        'Hey ' + RECIPIENT + ',\n\n' +
        'Find attached the invoice I got from Anthropic on ' +
        received.toDateString() + '.\n\n' +
        '-\n\n' +
        'Sent by an automated Apps Script rule.',
        { attachments: renamed, name: 'Invoice forwarder' });

      sent += invoices.length;
    });

    // Label the thread only after a successful send. A failure lets the
    // next run try again instead of losing the invoice.
    if (sent > 0) {
      thread.addLabel(label);
      Logger.log('Forwarded %s file(s) from thread "%s"', sent, thread.getFirstMessageSubject());
    }
  });
}

/** Runs the check on the 13th of each month. Run this function one time only. */
function installTrigger() {
  // Refuse to install at the wrong hour. The project timezone drives the
  // trigger, so a mismatch here fires the job in the wrong local time.
  var actualTz = Session.getScriptTimeZone();
  if (actualTz !== EXPECT_TZ) {
    throw new Error(
      'Project timezone is "' + actualTz + '", not "' + EXPECT_TZ + '". ' +
      'Open Project Settings, set Time zone to "(GMT-03:00) Sao Paulo", ' +
      'then run installTrigger again.');
  }

  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'forwardAnthropicInvoice') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  ScriptApp.newTrigger('forwardAnthropicInvoice')
    .timeBased()
    .onMonthDay(RUN_DAY)
    .atHour(RUN_HOUR)
    .create();
  Logger.log('Monthly trigger installed: day %s, about %s:00 %s.',
    RUN_DAY, RUN_HOUR, Session.getScriptTimeZone());
}
