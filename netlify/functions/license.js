import crypto from "crypto";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// מחזיר חתימה HMAC - SHA256 על האובייקט JSON
const sign = obj =>
  crypto
    .createHmac("sha256", process.env.SECRET)
    .update(JSON.stringify(obj))
    .digest("hex");

export async function handler(event) {
  // PayPal שולח payer_email בגוף הבקשה (IPN‏ / PDT)
  const email =
    new URLSearchParams(event.body).get("payer_email") ||
    "unknown@example.com";

  const license = {
    email,
    issued_at: new Date().toISOString(),
    valid_to: "2026-12-31",
  };
  const signature = sign(license);

  const file = JSON.stringify({ ...license, signature }, null, 2);

  // שולחים אימייל עם הקובץ כ-attachment
  await sgMail.send({
    to: email,
    from: "ljinoo0@gmail.com",
    subject: "Your Auto-Updater license",
    text:
      "Place the attached license.json in C:\\ProgramData\\AutoUpdater\\",
    attachments: [
      {
        filename: "license.json",
        content: Buffer.from(file).toString("base64"),
        type: "application/json",
        disposition: "attachment",
      },
    ],
  });

  return { statusCode: 200, body: "OK" };
}
