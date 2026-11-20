import { expect, it } from "vitest";
import { orderWhatsAppLink } from "@/modules/orders/whatsapp";
const order = {
  reference: "DEMO-EXAMPLE",
  status: "PENDING_CONFIRMATION" as const,
  totalXof: 2500,
  deliveryXof: 500,
  contactSnapshot: { name: "Client test", phone: "+221770000000" },
  addressSnapshot: {
    address: "Adresse fictive",
    district: "Quartier test",
    zoneName: "Zone test",
    instructions: "Sans livraison",
  },
  items: [
    {
      nameSnapshot: "Horloge",
      skuSnapshot: "HOR-TEST",
      quantity: 2,
      lineTotalXof: 2000,
    },
  ],
};
it("prépare tous les éléments utiles sans jeton privé ni confirmation de paiement", () => {
  const url = new URL(orderWhatsAppLink("+12025550123", order)!);
  expect(url.origin).toBe("https://wa.me");
  const message = url.searchParams.get("text")!;
  for (const part of [
    "DEMO-EXAMPLE",
    "2 × Horloge",
    "HOR-TEST",
    "2500 FCFA",
    "500 FCFA",
    "Client test",
    "+221770000000",
    "Adresse fictive",
    "Quartier test",
    "Zone test",
    "Sans livraison",
    "aucune vente réelle",
  ])
    expect(message).toContain(part);
  expect(message).not.toContain("accessToken");
});
it("masque un contact absent ou une ancienne adresse invalide", () => {
  expect(orderWhatsAppLink("", order)).toBeNull();
  expect(
    orderWhatsAppLink("+12025550123", { ...order, addressSnapshot: {} }),
  ).toBeNull();
});
