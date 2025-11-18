import { RequestHandler } from "express";

function detectType(message: string): "text" | "unicode" {
  // Basic detection: if message contains non-ASCII chars (e.g., Bangla), use unicode
  return /[^\x00-\x7F]/.test(message) ? "unicode" : "text";
}

export const sendViaBulkSMSBD: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.BULKSMSBD_API_KEY;
    const senderId = process.env.BULKSMSBD_SENDER_ID;

    if (!apiKey || !senderId) {
      return res.status(500).json({
        success: false,
        error: "Missing BULKSMSBD_API_KEY or BULKSMSBD_SENDER_ID environment variables",
      });
    }

    const { to, message } = req.body as { to?: string | string[]; message?: string };

    if (!message || !to || (Array.isArray(to) && to.length === 0)) {
      return res.status(400).json({ success: false, error: "'to' and 'message' are required" });
    }

    const numbers = Array.isArray(to) ? to.join(",") : to;
    const type = detectType(message);

    const params = new URLSearchParams();
    params.set("api_key", apiKey);
    params.set("type", type);
    params.set("number", numbers);
    params.set("senderid", senderId);
    params.set("message", message);

    const response = await fetch("https://bulksmsbd.net/api/smsapi", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const text = await response.text();
    let data: any = text;
    try {
      data = JSON.parse(text);
    } catch {
      // keep text
    }

    if (!response.ok) {
      return res.status(response.status).json({ success: false, providerResponse: data });
    }

    return res.status(200).json({ success: true, providerResponse: data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Unknown error" });
  }
};
