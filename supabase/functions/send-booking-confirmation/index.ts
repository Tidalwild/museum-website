// =============================================================================
// SUPABASE EDGE FUNCTION — send-booking-confirmation
// =============================================================================
// OPTIONAL. Use this only if you want email handling to live inside Supabase
// rather than in the Next.js server. The Next.js app can already send email on
// its own (see src/lib/email/send.ts) — this is the alternative, not a
// requirement.
//
// DEPLOYING
//   1. Install the CLI:      npm install -g supabase
//   2. Log in and link:      supabase login && supabase link --project-ref <ref>
//   3. Set the secrets:      supabase secrets set RESEND_API_KEY=re_xxx \
//                                                 EMAIL_FROM="SYU History Museum <museum@your-domain>"
//   4. Deploy:               supabase functions deploy send-booking-confirmation
//   5. In the Next.js app's .env.local, add:  EMAIL_TRANSPORT=edge-function
//
// This file runs on Deno, not Node, which is why the import URL looks unusual
// and why it is excluded from the project's tsconfig.
// =============================================================================

// @ts-nocheck — this file is type-checked by Deno, not by the Next.js build.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

type Payload = {
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  visitDate: string;
  guests: number;
  locale: "en" | "zh-Hant";
};

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Only our own server should be able to trigger an email. Supabase already
  // requires an Authorization header on functions by default; this is a second
  // check that the caller holds the service role key.
  const authHeader = request.headers.get("Authorization") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceRoleKey && authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: Payload;
  try {
    payload = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!payload?.email || !payload?.reference) {
    return new Response("Missing email or reference", { status: 400 });
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    return new Response("RESEND_API_KEY is not configured", { status: 500 });
  }

  const from =
    Deno.env.get("EMAIL_FROM") ?? "SYU History Museum <onboarding@resend.dev>";

  const isChinese = payload.locale === "zh-Hant";
  const fullName = `${payload.firstName} ${payload.lastName}`.trim();
  const prettyDate = new Intl.DateTimeFormat(isChinese ? "zh-Hant-HK" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Hong_Kong",
  }).format(new Date(`${payload.visitDate}T12:00:00`));

  const subject = isChinese
    ? `您的參觀預約已確認 — ${payload.reference}`
    : `Your museum visit is confirmed — ${payload.reference}`;

  const escape = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:#0a5449;color:#fff;padding:22px 28px;">
        <div style="font-size:20px;">樹仁大學校史館</div>
        <div style="font-size:11px;letter-spacing:2px;opacity:.8;">SHUE YAN UNIVERSITY HISTORY MUSEUM</div>
      </div>
      <div style="padding:28px;color:#2a2118;line-height:1.7;">
        <p>${escape(isChinese ? `${fullName} 您好，` : `Dear ${fullName},`)}</p>
        <p>${
          isChinese
            ? "感謝您預約參觀香港樹仁大學校史館，您的預約已確認。"
            : "Thank you for booking a visit to the Shue Yan University History Museum. Your reservation is confirmed."
        }</p>
        <div style="border:2px dashed #b7ae9a;border-radius:12px;background:#f6f1e4;padding:20px 22px;margin:22px 0;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5b442c;">
            ${isChinese ? "入場券" : "Admission Ticket"}
          </div>
          <div style="font-size:30px;letter-spacing:3px;font-weight:bold;color:#0a5449;padding:8px 0;">
            ${escape(payload.reference)}
          </div>
          <div style="font-size:14px;">${escape(fullName)}</div>
          <div style="font-size:14px;">${escape(prettyDate)}</div>
          <div style="font-size:14px;">${isChinese ? "參觀人數" : "Guests"}: ${payload.guests}</div>
        </div>
        <p style="font-size:14px;">${
          isChinese
            ? "請於入口出示此預約編號。本館逢星期一休館。"
            : "Please show this reference at the entrance. The museum is closed on Mondays."
        }</p>
      </div>
    </div>`;

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [payload.email], subject, html }),
  });

  if (!response.ok) {
    return new Response(await response.text(), { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
