export interface SendSMSRequest {
  to: string | string[];
  message: string;
}

export interface SendSMSResponse {
  success: boolean;
  providerResponse?: unknown;
  error?: string;
}

export async function sendBulkSMSBD(req: SendSMSRequest): Promise<SendSMSResponse> {
  const res = await fetch("/api/sms/bulksmsbd", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  const data = await res.json();
  return data as SendSMSResponse;
}
