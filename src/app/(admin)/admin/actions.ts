"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getActor } from "@/modules/identity/session";
import { getDb } from "@/lib/db";
import { getEnvironment } from "@/lib/env";
import {
  CommerceError,
  errorMessages,
  orderStates,
} from "@/modules/orders/rules";
import {
  collectCash,
  expireOrders,
  transitionOrder,
} from "@/modules/orders/service";
import {
  adjustStock,
  correctAddress,
  refundCash,
  saveCategory,
  saveProduct,
  saveVariant,
  saveZone,
} from "@/modules/admin/service";
export async function adminAction(
  _previous: { message: string; ok: boolean },
  form: FormData,
) {
  try {
    const actor = await getActor();
    if (!actor || getEnvironment().APP_ENV === "production")
      throw new CommerceError("FORBIDDEN", 403);
    const data: Record<string, unknown> = Object.fromEntries(form);
    for (const key of ["feeXof", "priceXof", "onHand", "version", "amountXof"])
      if (key in data) data[key] = Number(data[key]);
    data.active = form.get("active") === "on";
    const db = getDb();
    switch (data.action) {
      case "product":
        await saveProduct(db, actor.id, data);
        break;
      case "variant":
        await saveVariant(db, actor.id, data);
        break;
      case "stock":
        await adjustStock(db, actor.id, data);
        break;
      case "zone":
        await saveZone(db, actor.id, data);
        break;
      case "category":
        await saveCategory(db, actor.id, data);
        break;
      case "address":
        await correctAddress(db, actor.id, data);
        break;
      case "refund":
        await refundCash(db, actor.id, data);
        break;
      case "expire":
        await expireOrders(db, actor.id);
        break;
      case "transition": {
        const input = z
          .object({
            orderId: z.string().max(100),
            next: z.enum(orderStates),
            reason: z.string().trim().min(3).max(300),
          })
          .parse(data);
        await transitionOrder(
          db,
          actor.id,
          input.orderId,
          input.next,
          input.reason,
        );
        break;
      }
      case "collect": {
        const input = z
          .object({
            orderId: z.string().max(100),
            reference: z.string().trim().min(3).max(100),
          })
          .parse(data);
        await collectCash(db, actor.id, input.orderId, input.reference);
        break;
      }
      default:
        throw new CommerceError("INVALID", 400);
    }
    revalidatePath("/", "layout");
    return { message: "Modification enregistrée.", ok: true };
  } catch (e) {
    return {
      message:
        e instanceof CommerceError
          ? (errorMessages[e.code] ?? "Opération refusée.")
          : e instanceof z.ZodError
            ? "Vérifiez les champs et les limites du formulaire."
            : "Impossible d’enregistrer. Vérifiez les identifiants uniques puis actualisez la page.",
      ok: false,
    };
  }
}
