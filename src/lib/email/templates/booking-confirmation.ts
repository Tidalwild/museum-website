import { SITE } from "@/config/site";
import { formatLongDateWithWeekday } from "@/lib/booking/dates";
import type { Locale } from "@/lib/i18n/config";

/**
 * ===========================================================================
 * CONFIRMATION EMAIL TEMPLATE
 * ===========================================================================
 * Builds the subject line, the HTML body and a plain-text body.
 *
 * Always send BOTH bodies. Plain text is what shows up in text-only clients,
 * in notification previews, and for people using a screen reader that prefers
 * text — and it stops the message being scored as spam.
 *
 * Email clients strip <style> tags and ignore most modern CSS, so the HTML
 * below deliberately uses inline styles and a table for layout. That is the
 * one place in this project where tables-for-layout is the right answer.
 * ===========================================================================
 */

export type ConfirmationEmailData = {
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  visitDate: string; // "YYYY-MM-DD"
  guests: number;
  locale: Locale;
};

/** Wording for each language, kept next to the template that uses it. */
const COPY = {
  en: {
    subject: (reference: string) => `Your museum visit is confirmed — ${reference}`,
    preheader: "Your admission ticket and visit details are inside.",
    greeting: (name: string) => `Dear ${name},`,
    intro:
      "Thank you for booking a visit to the Shue Yan University History Museum. Your reservation is confirmed.",
    ticketTitle: "Admission Ticket",
    ticketHint: "Show this reference at the entrance, printed or on your phone.",
    referenceLabel: "Booking reference",
    dateLabel: "Date of visitation",
    guestsLabel: "Number of guest(s)",
    nameLabel: "Booked by",
    beforeTitle: "Before you visit",
    before: [
      "Please arrive during opening hours. The museum is closed on Mondays.",
      "You may be asked to present a valid form of identification on entry.",
      "Entry will not be granted without a valid admission ticket.",
    ],
    hoursTitle: "Opening hours",
    hours: ["Tuesday to Thursday: 10am – 5pm", "Friday to Sunday: 10am – 6pm", "Closed on Mondays"],
    addressTitle: "Getting here",
    changeTitle: "Need to change or cancel?",
    change: (email: string) => `Reply to this email or contact us at ${email}, quoting your booking reference.`,
    signOff: "We look forward to welcoming you.",
    team: "Shue Yan University History Museum",
  },
  "zh-Hant": {
    subject: (reference: string) => `您的參觀預約已確認 — ${reference}`,
    preheader: "隨函附上您的入場券及參觀詳情。",
    greeting: (name: string) => `${name} 您好，`,
    intro: "感謝您預約參觀香港樹仁大學校史館，您的預約已確認。",
    ticketTitle: "入場券",
    ticketHint: "請於入口出示此預約編號（列印本或手機畫面均可）。",
    referenceLabel: "預約編號",
    dateLabel: "參觀日期",
    guestsLabel: "參觀人數",
    nameLabel: "預約人",
    beforeTitle: "參觀前須知",
    before: [
      "請於開放時間內到達，本館逢星期一休館。",
      "入場時可能需要出示有效身份證明文件。",
      "未持有效入場券恕不接待。",
    ],
    hoursTitle: "開放時間",
    hours: ["星期二至星期四：上午10時至下午5時", "星期五至星期日：上午10時至下午6時", "星期一休館"],
    addressTitle: "交通位置",
    changeTitle: "需要更改或取消？",
    change: (email: string) => `請回覆本電郵，或電郵至 ${email}，並註明您的預約編號。`,
    signOff: "期待您的蒞臨。",
    team: "樹仁大學校史館",
  },
} as const;

/** Escapes user-supplied text so a name like `O'Brien & Sons <x>` cannot break the HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildConfirmationEmail(data: ConfirmationEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const t = COPY[data.locale] ?? COPY.en;
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const prettyDate = formatLongDateWithWeekday(data.visitDate, data.locale);

  /* ----------------------------- PLAIN TEXT ----------------------------- */
  const text = [
    t.greeting(fullName),
    "",
    t.intro,
    "",
    `=== ${t.ticketTitle} ===`,
    `${t.referenceLabel}: ${data.reference}`,
    `${t.nameLabel}: ${fullName}`,
    `${t.dateLabel}: ${prettyDate}`,
    `${t.guestsLabel}: ${data.guests}`,
    t.ticketHint,
    "",
    `${t.beforeTitle}:`,
    ...t.before.map((line) => `- ${line}`),
    "",
    `${t.hoursTitle}:`,
    ...t.hours.map((line) => `- ${line}`),
    "",
    `${t.addressTitle}:`,
    `${SITE.address.line1} ${SITE.address.line2}`,
    SITE.address.mapsUrl,
    "",
    `${t.changeTitle} ${t.change(SITE.contactEmail)}`,
    "",
    t.signOff,
    t.team,
  ].join("\n");

  /* -------------------------------- HTML -------------------------------- */
  const listItems = (items: readonly string[]) =>
    items
      .map(
        (item) =>
          `<li style="margin:0 0 6px 0;line-height:1.6;">${escapeHtml(item)}</li>`,
      )
      .join("");

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:6px 0;font-size:13px;color:#4a3d2f;width:45%;">${escapeHtml(label)}</td>
      <td style="padding:6px 0;font-size:15px;color:#2a2118;font-weight:bold;">${escapeHtml(value)}</td>
    </tr>`;

  const html = `<!doctype html>
<html lang="${data.locale === "zh-Hant" ? "zh-Hant-HK" : "en"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(t.subject(data.reference))}</title>
</head>
<body style="margin:0;padding:0;background:#e5e1d6;">
  <!-- Preheader: the grey preview line in an inbox list. Hidden in the body. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(t.preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e5e1d6;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;font-family:Georgia,'Times New Roman',serif;">

        <!-- Header -->
        <tr><td style="background:#0a5449;padding:22px 28px;">
          <div style="color:#ffffff;font-size:20px;letter-spacing:1px;">樹仁大學校史館</div>
          <div style="color:#d9d2c0;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding-top:4px;">Shue Yan University History Museum</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:28px;color:#2a2118;font-size:15px;line-height:1.7;">
          <p style="margin:0 0 14px 0;">${escapeHtml(t.greeting(fullName))}</p>
          <p style="margin:0 0 22px 0;">${escapeHtml(t.intro)}</p>

          <!-- Admission ticket -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px dashed #b7ae9a;border-radius:12px;background:#f6f1e4;">
            <tr><td style="padding:20px 22px;">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5b442c;">${escapeHtml(t.ticketTitle)}</div>
              <div style="font-size:30px;letter-spacing:3px;font-weight:bold;color:#0a5449;padding:8px 0 4px 0;">${escapeHtml(data.reference)}</div>
              <div style="font-size:12px;color:#4a3d2f;padding-bottom:12px;">${escapeHtml(t.ticketHint)}</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #d5cdb8;">
                ${row(t.nameLabel, fullName)}
                ${row(t.dateLabel, prettyDate)}
                ${row(t.guestsLabel, String(data.guests))}
              </table>
            </td></tr>
          </table>

          <h2 style="font-size:16px;color:#5b442c;margin:26px 0 8px 0;">${escapeHtml(t.beforeTitle)}</h2>
          <ul style="margin:0;padding-left:20px;font-size:14px;color:#2a2118;">${listItems(t.before)}</ul>

          <h2 style="font-size:16px;color:#5b442c;margin:22px 0 8px 0;">${escapeHtml(t.hoursTitle)}</h2>
          <ul style="margin:0;padding-left:20px;font-size:14px;color:#2a2118;">${listItems(t.hours)}</ul>

          <h2 style="font-size:16px;color:#5b442c;margin:22px 0 8px 0;">${escapeHtml(t.addressTitle)}</h2>
          <p style="margin:0 0 6px 0;font-size:14px;">${escapeHtml(SITE.address.line1)}<br>${escapeHtml(SITE.address.line2)}</p>
          <p style="margin:0;font-size:14px;"><a href="${SITE.address.mapsUrl}" style="color:#0a5449;">${escapeHtml(SITE.address.mapsUrl)}</a></p>

          <h2 style="font-size:16px;color:#5b442c;margin:22px 0 8px 0;">${escapeHtml(t.changeTitle)}</h2>
          <p style="margin:0 0 22px 0;font-size:14px;">${escapeHtml(t.change(SITE.contactEmail))}</p>

          <p style="margin:0;">${escapeHtml(t.signOff)}<br><strong>${escapeHtml(t.team)}</strong></p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#1a3a4e;padding:16px 28px;color:#d9d2c0;font-size:11px;">
          ${escapeHtml(SITE.name)} · ${escapeHtml(SITE.address.line2)}
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject: t.subject(data.reference), html, text };
}
