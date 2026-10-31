import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { PrismaClient } from "@/generated/prisma/client";
import { authorize, audit, serial } from "@/modules/orders/service";
import { CommerceError, money } from "@/modules/orders/rules";
import { safeImage } from "@/modules/catalog/repository";

const text = z.string().trim().min(1).max(100);
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(100);
const productInput = z.object({
  id: z.string().optional(),
  updatedAt: z.string().optional(),
  name: text,
  slug,
  description: z.string().trim().max(5000),
  categoryId: text,
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  image: z.string().refine((value) => !!safeImage(value)),
  alt: text,
});
export async function saveProduct(
  db: PrismaClient,
  actorId: string,
  input: unknown,
) {
  const data = productInput.parse(input);
  return serial(db, async (tx) => {
    await authorize(tx, actorId, "catalog:write");
    if (data.id) {
      const current = await tx.product.findUnique({ where: { id: data.id } });
      if (
        !current?.isDemo ||
        current.updatedAt.toISOString() !== data.updatedAt
      )
        throw new CommerceError("CONFLICT");
    }
    const { id, updatedAt: _updatedAt, image, alt, ...values } = data;
    void _updatedAt;
    const changes = {
      ...values,
      isDemo: true,
      archivedAt: values.status === "ARCHIVED" ? new Date() : null,
    };
    const product = id
      ? await tx.product.update({ where: { id }, data: changes })
      : await tx.product.create({ data: changes });
    await tx.productImage.deleteMany({ where: { productId: product.id } });
    await tx.productImage.create({
      data: { productId: product.id, objectKey: image, alt },
    });
    await audit(
      tx,
      actorId,
      id ? "catalog.update" : "catalog.create",
      "Product",
      product.id,
      { name: product.name, status: product.status },
    );
    return product.id;
  });
}
export async function saveVariant(
  db: PrismaClient,
  actorId: string,
  input: unknown,
) {
  const data = z
    .object({
      id: z.string().optional(),
      updatedAt: z.string().optional(),
      productId: text,
      sku: text,
      label: text,
      priceXof: money,
      active: z.boolean(),
    })
    .parse(input);
  return serial(db, async (tx) => {
    await authorize(tx, actorId, "catalog:write");
    const product = await tx.product.findUnique({
      where: { id: data.productId },
    });
    if (!product?.isDemo) throw new CommerceError("FORBIDDEN", 403);
    if (data.id) {
      const current = await tx.productVariant.findUnique({
        where: { id: data.id },
      });
      if (
        current?.productId !== data.productId ||
        current.updatedAt.toISOString() !== data.updatedAt
      )
        throw new CommerceError("CONFLICT");
    }
    const { id, updatedAt: _updatedAt, ...values } = data;
    void _updatedAt;
    const variant = id
      ? await tx.productVariant.update({ where: { id }, data: values })
      : await tx.productVariant.create({
          data: { ...values, inventory: { create: {} } },
        });
    await audit(tx, actorId, "variant.save", "ProductVariant", variant.id, {
      priceXof: variant.priceXof,
      active: variant.active,
    });
  });
}
export async function adjustStock(
  db: PrismaClient,
  actorId: string,
  input: unknown,
) {
  const data = z
    .object({
      variantId: text,
      onHand: z.number().int().min(0).max(1000000),
      version: z.number().int().min(0),
      reason: z.string().trim().min(3).max(300),
    })
    .parse(input);
  return serial(db, async (tx) => {
    await authorize(tx, actorId, "inventory:write");
    const inventory = await tx.inventory.findUnique({
      where: { variantId: data.variantId },
      include: { variant: { include: { product: true } } },
    });
    if (!inventory?.variant.product.isDemo)
      throw new CommerceError("FORBIDDEN", 403);
    if (inventory.version !== data.version) throw new CommerceError("CONFLICT");
    if (data.onHand < inventory.reserved) throw new CommerceError("STOCK");
    const delta = data.onHand - inventory.onHand;
    if (!delta) return;
    await tx.inventory.update({
      where: { id: inventory.id },
      data: { onHand: data.onHand, version: { increment: 1 } },
    });
    await tx.stockMovement.create({
      data: {
        variantId: data.variantId,
        quantity: delta,
        type: "ADJUSTMENT",
        reason: data.reason,
        actorId,
        operationKey: randomUUID(),
      },
    });
    await audit(tx, actorId, "inventory.adjust", "Inventory", inventory.id, {
      before: inventory.onHand,
      after: data.onHand,
      reason: data.reason,
    });
  });
}
export async function saveZone(
  db: PrismaClient,
  actorId: string,
  input: unknown,
) {
  const data = z
    .object({
      id: z.string().optional(),
      name: text,
      feeXof: money,
      active: z.boolean(),
    })
    .parse(input);
  return serial(db, async (tx) => {
    await authorize(tx, actorId, "settings:write");
    if (
      data.id &&
      !(await tx.deliveryZone.findUnique({ where: { id: data.id } }))?.isDemo
    )
      throw new CommerceError("FORBIDDEN", 403);
    const { id, ...values } = data;
    const zone = id
      ? await tx.deliveryZone.update({ where: { id }, data: values })
      : await tx.deliveryZone.create({ data: { ...values, isDemo: true } });
    await audit(tx, actorId, "zone.save", "DeliveryZone", zone.id, {
      feeXof: zone.feeXof,
      active: zone.active,
    });
  });
}
export async function saveCategory(
  db: PrismaClient,
  actorId: string,
  input: unknown,
) {
  const data = z
    .object({
      id: z.string().optional(),
      name: text,
      slug,
      active: z.boolean(),
    })
    .parse(input);
  return serial(db, async (tx) => {
    await authorize(tx, actorId, "catalog:write");
    if (
      data.id &&
      (await tx.product.count({
        where: { categoryId: data.id, isDemo: false },
      }))
    )
      throw new CommerceError("FORBIDDEN", 403);
    const { id, ...values } = data;
    const category = id
      ? await tx.category.update({ where: { id }, data: values })
      : await tx.category.create({ data: values });
    await audit(tx, actorId, "category.save", "Category", category.id, {
      name: category.name,
      active: category.active,
    });
  });
}
export async function refundCash(
  db: PrismaClient,
  actorId: string,
  input: unknown,
) {
  const data = z
    .object({
      orderId: text,
      amountXof: money.refine((n) => n > 0),
      reason: z.string().trim().min(3).max(300),
      operationKey: z.uuid(),
    })
    .parse(input);
  return serial(db, async (tx) => {
    await authorize(tx, actorId, "payments:refund");
    const payment = await tx.payment.findFirst({
      where: {
        orderId: data.orderId,
        provider: "CASH_ON_DELIVERY",
        order: { isDemo: true },
        status: { in: ["SUCCEEDED", "PARTIALLY_REFUNDED", "REFUNDED"] },
      },
      include: { refunds: true },
    });
    if (!payment) throw new CommerceError("TRANSITION");
    const existing = await tx.refund.findUnique({
      where: { operationKey: data.operationKey },
    });
    if (existing) {
      if (
        existing.paymentId !== payment.id ||
        existing.amountXof !== data.amountXof ||
        existing.reason !== data.reason
      )
        throw new CommerceError("CONFLICT");
      return;
    }
    const refunded = payment.refunds
      .filter((r) => r.status === "SUCCEEDED")
      .reduce((s, r) => s + r.amountXof, 0);
    if (refunded + data.amountXof > payment.amountXof)
      throw new CommerceError("INVALID", 400);
    await tx.refund.create({
      data: {
        paymentId: payment.id,
        amountXof: data.amountXof,
        reason: data.reason,
        operationKey: data.operationKey,
        actorId,
        status: "SUCCEEDED",
      },
    });
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status:
          refunded + data.amountXof === payment.amountXof
            ? "REFUNDED"
            : "PARTIALLY_REFUNDED",
      },
    });
    await audit(tx, actorId, "payment.refund.demo", "Payment", payment.id, {
      amountXof: data.amountXof,
      reason: data.reason,
    });
  });
}
export async function correctAddress(
  db: PrismaClient,
  actorId: string,
  input: unknown,
) {
  const data = z
    .object({
      orderId: text,
      version: z.number().int().min(0),
      district: text,
      address: z.string().trim().min(5).max(300),
      instructions: z.string().max(300),
      reason: z.string().trim().min(3).max(300),
    })
    .parse(input);
  return serial(db, async (tx) => {
    await authorize(tx, actorId, "orders:manage");
    const order = await tx.order.findUnique({ where: { id: data.orderId } });
    if (
      !order?.isDemo ||
      !["PENDING_CONFIRMATION", "CONFIRMED", "PREPARING"].includes(
        order.status,
      ) ||
      order.version !== data.version
    )
      throw new CommerceError("TRANSITION");
    const snapshot = {
      ...(order.addressSnapshot as Record<string, string>),
      district: data.district,
      address: data.address,
      instructions: data.instructions,
    };
    await tx.order.update({
      where: { id: order.id },
      data: { addressSnapshot: snapshot, version: { increment: 1 } },
    });
    await tx.shipment.update({
      where: { orderId: order.id },
      data: { addressSnapshot: snapshot },
    });
    await audit(tx, actorId, "order.address", "Order", order.id, {
      fields: ["district", "address", "instructions"],
      reason: data.reason,
    });
  });
}
