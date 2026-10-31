import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { getEnvironment } from "@/lib/env";
import { getOrderPolicy } from "@/modules/orders/runtime";
import {
  createQuote,
  placeOrder,
  readConfirmation,
  limitCheckout,
  digest,
} from "@/modules/orders/service";
import { CommerceError, errorMessages } from "@/modules/orders/rules";

export async function POST(request: Request) {
  try {
    if (
      request.headers.get("origin") !== new URL(getEnvironment().APP_URL).origin
    )
      throw new CommerceError("FORBIDDEN", 403);
    const raw = await request.text();
    if (raw.length > 24000) throw new CommerceError("INVALID", 400);
    const { action, data } = JSON.parse(raw);
    const policy = getOrderPolicy();
    if (!policy.enabled) throw new CommerceError("DISABLED", 403);
    // Vercel overwrites this platform header. Local traffic shares a test bucket.
    const source = process.env.VERCEL
      ? (request.headers.get("x-vercel-forwarded-for") ?? "unknown")
      : "local";
    await limitCheckout(getDb(), `checkout:${digest(source)}`);
    let result;
    if (action === "quote") result = await createQuote(getDb(), data, policy);
    else if (action === "place")
      result = await placeOrder(getDb(), data, policy);
    else if (action === "read") {
      const input = z
        .object({
          reference: z.string().max(100),
          accessToken: z.string().regex(/^[a-f0-9]{64}$/),
        })
        .parse(data);
      result = await readConfirmation(
        getDb(),
        input.reference,
        input.accessToken,
      );
    } else throw new CommerceError("INVALID", 400);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    const code =
      e instanceof CommerceError
        ? e.code
        : e instanceof z.ZodError || e instanceof SyntaxError
          ? "INVALID"
          : "UNAVAILABLE";
    return NextResponse.json(
      {
        error:
          errorMessages[code] ??
          "Service momentanément indisponible. Réessayez sans changer votre demande.",
        code,
      },
      {
        status:
          e instanceof CommerceError
            ? e.status
            : code === "INVALID"
              ? 400
              : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
