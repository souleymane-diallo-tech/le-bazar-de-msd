import { cartSchema, quoteCart } from "@/modules/cart/rules";
import { getCatalog } from "@/modules/catalog/service";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 12000)
    return Response.json({ error: "Panier trop volumineux." }, { status: 413 });
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Panier invalide." }, { status: 400 });
  }
  const parsed = cartSchema.safeParse(value);
  if (!parsed.success)
    return Response.json({ error: "Panier invalide." }, { status: 400 });
  try {
    return Response.json(quoteCart(parsed.data.items, await getCatalog()), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Impossible de vérifier le panier. Réessayez." },
      { status: 503 },
    );
  }
}
