import { z } from "zod";

export const money = z.number().int().min(0).max(20_000_000);
export const orderStates = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "DELIVERY_FAILED",
  "CANCELLED",
  "RETURNED",
] as const;
export type OrderState = (typeof orderStates)[number];
export const paymentLabels = {
  PENDING: "En attente",
  SUCCEEDED: "Encaissé",
  FAILED: "Échoué",
  EXPIRED: "Clôturé sans encaissement",
  PARTIALLY_REFUNDED: "Partiellement remboursé",
  REFUNDED: "Remboursé",
};
export const reservationLabels = {
  ACTIVE: "Active",
  RELEASED: "Libérée",
  CONSUMED: "Expédiée",
  EXPIRED: "Expirée",
};
export const transitions: Record<OrderState, readonly OrderState[]> = {
  PENDING_CONFIRMATION: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "DELIVERY_FAILED"],
  DELIVERY_FAILED: ["SHIPPED", "RETURNED"],
  DELIVERED: [],
  CANCELLED: [],
  RETURNED: [],
};
export const stateLabels: Record<OrderState, string> = {
  PENDING_CONFIRMATION: "À confirmer",
  CONFIRMED: "Confirmée",
  PREPARING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  DELIVERY_FAILED: "Livraison échouée",
  CANCELLED: "Annulée",
  RETURNED: "Retournée",
};
export const basketSchema = z.object({
  zoneId: z.string().min(1).max(100),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1).max(100),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(20)
    .refine(
      (items) => new Set(items.map((i) => i.variantId)).size === items.length,
      "Variantes dupliquées",
    ),
});
export const checkoutSchema = basketSchema.extend({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .transform((s) => s.replace(/[\s()-]/g, ""))
    .pipe(z.string().regex(/^\+2217[05678]\d{7}$/)),
  district: z.string().trim().min(2).max(100),
  address: z.string().trim().min(5).max(300),
  instructions: z.string().trim().max(300).default(""),
  idempotencyKey: z.uuid(),
  accessToken: z.string().regex(/^[a-f0-9]{64}$/),
  quoteToken: z.string().min(1).max(16000),
  demoAcknowledged: z.literal(true),
});
export class CommerceError extends Error {
  constructor(
    public readonly code: string,
    public readonly status = 409,
  ) {
    super(code);
  }
}
export const errorMessages: Record<string, string> = {
  RATE_LIMIT: "Trop de demandes. Patientez une minute avant de réessayer.",
  DISABLED: "Les commandes sont désactivées.",
  INVALID: "Vérifiez les champs du formulaire.",
  STOCK: "Le stock a changé. Revenez au panier pour ajuster votre sélection.",
  QUOTE_CHANGED:
    "Le prix, les frais ou le devis ont changé. Vérifiez le nouveau total avant de confirmer.",
  CONFLICT: "Cette opération a déjà été utilisée avec un contenu différent.",
  FORBIDDEN: "Accès refusé.",
  NOT_FOUND: "Commande introuvable.",
  TRANSITION: "Cette transition n’est plus possible. Actualisez la page.",
  EXPIRED:
    "La réservation a expiré. Annulez la commande pour libérer le stock.",
};
