import crypto from "node:crypto";

const VOUCHER_SECRET = process.env.VOUCHER_SECRET || "change-me-in-production";

export interface VoucherPayload {
  id: string;
  amount: number;
  signature: string;
}

export function signVoucher(id: string, amount: number): string {
  const data = `${id}:${amount}`;
  return crypto.createHmac("sha256", VOUCHER_SECRET).update(data).digest("hex");
}

export function verifySignature(
  id: string,
  amount: number,
  signature: string,
): boolean {
  const expected = signVoucher(id, amount);
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex"),
  );
}

export function createVoucherPayload(
  id: string,
  amount: number,
): VoucherPayload {
  return {
    id,
    amount,
    signature: signVoucher(id, amount),
  };
}

export function parseQrContent(qrContent: string): VoucherPayload | null {
  try {
    const parsed = JSON.parse(qrContent);
    if (
      typeof parsed.id === "string" &&
      typeof parsed.amount === "number" &&
      typeof parsed.signature === "string"
    ) {
      return parsed as VoucherPayload;
    }
    return null;
  } catch {
    return null;
  }
}
