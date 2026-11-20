import { z } from "zod";
import { whatsappLink } from "@/modules/settings/rules";
import { stateLabels, type OrderState } from "./rules";

const contactSchema = z.object({ name: z.string(), phone: z.string() });
const addressSchema = z.object({
  district: z.string(),
  address: z.string(),
  zoneName: z.string(),
  instructions: z.string().optional(),
});
export function orderWhatsAppLink(
  number: string,
  order: {
    reference: string;
    status: OrderState;
    totalXof: number;
    deliveryXof: number;
    contactSnapshot: unknown;
    addressSnapshot: unknown;
    items: {
      nameSnapshot: string;
      skuSnapshot: string;
      quantity: number;
      lineTotalXof: number;
    }[];
  },
) {
  const contact = contactSchema.safeParse(order.contactSnapshot);
  const address = addressSchema.safeParse(order.addressSnapshot);
  if (!contact.success || !address.success) return null;
  const line = (value: string) =>
    Array.from(value, (character) =>
      character.charCodeAt(0) < 32 ? " " : character,
    ).join("");
  return whatsappLink(
    number,
    [
      "Le Bazar de MSD — COMMANDE DE TEST, aucune vente réelle",
      `Référence : ${order.reference}`,
      `État lors de la préparation : ${stateLabels[order.status]}`,
      ...order.items.map(
        (item) =>
          `${item.quantity} × ${line(item.nameSnapshot)} [${line(item.skuSnapshot)}] : ${item.lineTotalXof} FCFA`,
      ),
      `Livraison fictive : ${order.deliveryXof} FCFA`,
      `Total fictif : ${order.totalXof} FCFA — paiement à la livraison simulé`,
      `Nom : ${line(contact.data.name)}`,
      `Téléphone : ${line(contact.data.phone)}`,
      `Zone : ${line(address.data.zoneName)}`,
      `Quartier : ${line(address.data.district)}`,
      `Adresse : ${line(address.data.address)}`,
      `Instructions : ${line(address.data.instructions ?? "")}`,
      "Merci de vérifier cette référence dans l’administration avant traitement. Ce message ne confirme aucun paiement.",
    ].join("\n"),
  );
}
