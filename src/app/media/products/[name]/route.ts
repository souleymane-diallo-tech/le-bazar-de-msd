import { getDb } from "@/lib/db";
import { getActor } from "@/modules/identity/session";
import {
  readProductImage,
  uploadName,
  uploadsEnabled,
} from "@/modules/catalog/uploads";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!uploadsEnabled() || !uploadName.test(name))
    return new Response(null, { status: 404 });
  const objectKey = `/media/products/${name}`;
  let image = await getDb().productImage.findFirst({
    where: {
      objectKey,
      product: {
        isDemo: true,
        status: "PUBLISHED",
        archivedAt: null,
        category: { active: true },
      },
    },
    select: { id: true },
  });
  if (!image && (await getActor()))
    image = await getDb().productImage.findFirst({
      where: { objectKey, product: { isDemo: true } },
      select: { id: true },
    });
  if (!image) return new Response(null, { status: 404 });
  const bytes = await readProductImage(name);
  if (!bytes) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
