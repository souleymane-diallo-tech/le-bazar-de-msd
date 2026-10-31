import {
  createHash,
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { hasPermission, type Permission } from "@/modules/identity/permissions";
import {
  basketSchema,
  checkoutSchema,
  CommerceError,
  transitions,
  type OrderState,
} from "./rules";

type Tx = Prisma.TransactionClient;
export type DemoPolicy = { enabled: boolean; secret: string };
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
function enabled(policy: DemoPolicy) {
  if (!policy.enabled) throw new CommerceError("DISABLED", 403);
}
export async function serial<T>(
  db: PrismaClient,
  fn: (tx: Tx) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.$transaction(fn, {
        isolationLevel: "Serializable",
        timeout: 15000,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        ["P2034", "P2002"].includes(e.code) &&
        attempt < 4
      )
        continue;
      throw e;
    }
  }
}
export async function authorize(
  tx: Tx,
  actorId: string,
  permission: Permission,
) {
  const actor = await tx.user.findUnique({ where: { id: actorId } });
  if (!hasPermission(actor, permission))
    throw new CommerceError("FORBIDDEN", 403);
}
export async function audit(
  tx: Tx,
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  safeDiff: Prisma.InputJsonValue,
) {
  await tx.auditLog.create({
    data: {
      actorId,
      action,
      targetType,
      targetId,
      safeDiff,
      operationKey: randomUUID(),
    },
  });
}
async function calculate(tx: Tx, input: unknown) {
  const data = basketSchema.parse(input);
  await releaseExpired(tx, null);
  const zone = await tx.deliveryZone.findUnique({ where: { id: data.zoneId } });
  if (!zone?.active || !zone.isDemo) throw new CommerceError("INVALID", 400);
  const lines = [];
  for (const item of [...data.items].sort((a, b) =>
    a.variantId.localeCompare(b.variantId),
  )) {
    const variant = await tx.productVariant.findUnique({
      where: { id: item.variantId },
      include: { inventory: true, product: { include: { category: true } } },
    });
    if (
      !variant?.active ||
      variant.product.status !== "PUBLISHED" ||
      variant.product.archivedAt ||
      !variant.product.category.active ||
      !variant.product.isDemo
    )
      throw new CommerceError("STOCK");
    if (
      !variant.inventory ||
      variant.inventory.onHand - variant.inventory.reserved < item.quantity
    )
      throw new CommerceError("STOCK");
    lines.push({
      variantId: variant.id,
      quantity: item.quantity,
      name: `${variant.product.name} · ${variant.label}`,
      sku: variant.sku,
      attributes: variant.attributes ?? {},
      priceXof: variant.priceXof,
      lineTotalXof: variant.priceXof * item.quantity,
    });
  }
  const subtotalXof = lines.reduce((sum, l) => sum + l.lineTotalXof, 0);
  if (subtotalXof + zone.feeXof > 2147483647)
    throw new CommerceError("INVALID", 400);
  return {
    lines,
    zoneId: zone.id,
    zoneName: zone.name,
    deliveryXof: zone.feeXof,
    subtotalXof,
    totalXof: subtotalXof + zone.feeXof,
  };
}
export async function createQuote(
  db: PrismaClient,
  input: unknown,
  policy: DemoPolicy,
) {
  enabled(policy);
  const quote = await serial(db, (tx) => calculate(tx, input));
  const payload = Buffer.from(
    JSON.stringify({
      hash: digest(JSON.stringify(quote)),
      expires: Date.now() + 15 * 60_000,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", policy.secret)
    .update(payload)
    .digest("hex");
  return { ...quote, quoteToken: `${payload}.${signature}` };
}
function verifyQuote(token: string, quote: unknown, secret: string) {
  try {
    const [payload, signature] = token.split(".");
    const expected = createHmac("sha256", secret).update(payload).digest();
    const actual = Buffer.from(signature, "hex");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      throw new Error();
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (
      data.expires < Date.now() ||
      data.hash !== digest(JSON.stringify(quote))
    )
      throw new Error();
  } catch {
    throw new CommerceError("QUOTE_CHANGED");
  }
}
export async function placeOrder(
  db: PrismaClient,
  input: unknown,
  policy: DemoPolicy,
) {
  enabled(policy);
  const data = checkoutSchema.parse(input);
  const { idempotencyKey, accessToken, quoteToken, ...content } = data;
  const requestHash = digest(
    JSON.stringify({
      ...content,
      items: [...content.items].sort((a, b) =>
        a.variantId.localeCompare(b.variantId),
      ),
    }),
  );
  return serial(db, async (tx) => {
    const existing = await tx.order.findUnique({ where: { idempotencyKey } });
    if (existing) {
      if (
        existing.requestHash !== requestHash ||
        existing.accessTokenHash !== digest(accessToken)
      )
        throw new CommerceError("CONFLICT");
      return { reference: existing.reference };
    }
    const quote = await calculate(tx, data);
    verifyQuote(quoteToken, quote, policy.secret);
    const addressSnapshot = {
      district: data.district,
      address: data.address,
      instructions: data.instructions,
      zoneName: quote.zoneName,
    };
    const order = await tx.order.create({
      data: {
        isDemo: true,
        reference: `DEMO-${randomUUID().toUpperCase()}`,
        idempotencyKey,
        requestHash,
        accessTokenHash: digest(accessToken),
        subtotalXof: quote.subtotalXof,
        deliveryXof: quote.deliveryXof,
        totalXof: quote.totalXof,
        addressSnapshot,
        contactSnapshot: { name: data.name, phone: data.phone },
        customer: { create: { name: data.name, phoneNormalized: data.phone } },
        statusHistory: {
          create: {
            toStatus: "PENDING_CONFIRMATION",
            reason: "Commande de démonstration",
          },
        },
        shipment: {
          create: {
            zoneId: quote.zoneId,
            deliveryFeeSnapshot: quote.deliveryXof,
            addressSnapshot,
          },
        },
        payments: {
          create: {
            provider: "CASH_ON_DELIVERY",
            amountXof: quote.totalXof,
            idempotencyKey: `cod:${idempotencyKey}`,
          },
        },
      },
    });
    for (const line of quote.lines) {
      const inventory = await tx.inventory.findUniqueOrThrow({
        where: { variantId: line.variantId },
      });
      const updated = await tx.inventory.updateMany({
        where: {
          id: inventory.id,
          version: inventory.version,
          onHand: { gte: inventory.reserved + line.quantity },
        },
        data: {
          reserved: { increment: line.quantity },
          version: { increment: 1 },
        },
      });
      if (updated.count !== 1) throw new CommerceError("STOCK");
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          variantId: line.variantId,
          nameSnapshot: line.name,
          skuSnapshot: line.sku,
          attributesSnapshot: line.attributes,
          unitPriceXof: line.priceXof,
          quantity: line.quantity,
          lineTotalXof: line.lineTotalXof,
          reservation: {
            create: {
              quantity: line.quantity,
              expiresAt: new Date(Date.now() + 24 * 60 * 60_000),
            },
          },
        },
      });
    }
    return { reference: order.reference };
  });
}
export async function readConfirmation(
  db: PrismaClient,
  reference: string,
  accessToken: string,
) {
  const order = await db.order.findFirst({
    where: { reference, accessTokenHash: digest(accessToken), isDemo: true },
    include: { items: true, payments: true },
  });
  if (!order) throw new CommerceError("NOT_FOUND", 404);
  // Public confirmation deliberately excludes addresses and phone numbers.
  return {
    reference: order.reference,
    status: order.status,
    totalXof: order.totalXof,
    deliveryXof: order.deliveryXof,
    collected: order.payments.some((p) =>
      ["SUCCEEDED", "PARTIALLY_REFUNDED", "REFUNDED"].includes(p.status),
    ),
    items: order.items.map((i) => ({
      name: i.nameSnapshot,
      quantity: i.quantity,
      lineTotalXof: i.lineTotalXof,
    })),
  };
}
async function changeState(
  tx: Tx,
  orderId: string,
  next: OrderState,
  reason: string,
  actorId: string | null,
  expire = false,
) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { reservation: true } } },
  });
  if (!order?.isDemo) throw new CommerceError("NOT_FOUND", 404);
  if (order.status === next) return;
  if (!transitions[order.status].includes(next))
    throw new CommerceError("TRANSITION");
  if (
    next === "CONFIRMED" &&
    order.items.some(
      (i) =>
        !i.reservation ||
        i.reservation.status !== "ACTIVE" ||
        (i.reservation.expiresAt && i.reservation.expiresAt <= new Date()),
    )
  )
    throw new CommerceError("EXPIRED");
  for (const item of order.items) {
    if (
      next === "CANCELLED" ||
      (next === "SHIPPED" && order.status === "PREPARING")
    ) {
      if (item.reservation?.status !== "ACTIVE")
        throw new CommerceError("TRANSITION");
      await tx.inventory.update({
        where: { variantId: item.variantId },
        data: {
          reserved: { decrement: item.quantity },
          ...(next === "SHIPPED"
            ? { onHand: { decrement: item.quantity } }
            : {}),
          version: { increment: 1 },
        },
      });
      await tx.stockReservation.update({
        where: { orderItemId: item.id },
        data: {
          status:
            next === "SHIPPED" ? "CONSUMED" : expire ? "EXPIRED" : "RELEASED",
        },
      });
    }
    if (next === "CONFIRMED")
      await tx.stockReservation.update({
        where: { orderItemId: item.id },
        data: { expiresAt: null },
      });
    if (next === "RETURNED")
      await tx.inventory.update({
        where: { variantId: item.variantId },
        data: {
          onHand: { increment: item.quantity },
          version: { increment: 1 },
        },
      });
    if (
      (next === "SHIPPED" && order.status === "PREPARING") ||
      next === "RETURNED"
    )
      await tx.stockMovement.create({
        data: {
          variantId: item.variantId,
          orderItemId: item.id,
          type: next === "RETURNED" ? "RETURN" : "DISPATCH",
          quantity: next === "RETURNED" ? item.quantity : -item.quantity,
          reason,
          actorId,
          operationKey: `${next}:${item.id}`,
        },
      });
  }
  await tx.order.update({
    where: { id: order.id },
    data: {
      status: next,
      version: { increment: 1 },
      statusHistory: {
        create: { fromStatus: order.status, toStatus: next, actorId, reason },
      },
    },
  });
  const shipmentStatus = {
    SHIPPED: "DISPATCHED",
    DELIVERED: "DELIVERED",
    DELIVERY_FAILED: "FAILED",
    RETURNED: "RETURNED",
  } as const;
  if (next in shipmentStatus)
    await tx.shipment.update({
      where: { orderId },
      data: {
        status: shipmentStatus[next as keyof typeof shipmentStatus],
        ...(next === "SHIPPED" ? { dispatchedAt: new Date() } : {}),
        ...(next === "DELIVERED" ? { deliveredAt: new Date() } : {}),
      },
    });
  if (next === "CANCELLED" || next === "RETURNED")
    await tx.payment.updateMany({
      where: { orderId, status: "PENDING" },
      data: { status: "EXPIRED" },
    });
  if (actorId)
    await audit(tx, actorId, "order.transition", "Order", orderId, {
      from: order.status,
      to: next,
      reason,
    });
}
export async function transitionOrder(
  db: PrismaClient,
  actorId: string,
  orderId: string,
  next: OrderState,
  reason: string,
) {
  if (!reason.trim() || reason.length > 300)
    throw new CommerceError("INVALID", 400);
  return serial(db, async (tx) => {
    await authorize(tx, actorId, "orders:manage");
    await changeState(tx, orderId, next, reason, actorId);
  });
}
export async function expireOrders(db: PrismaClient, actorId: string) {
  return serial(db, async (tx) => {
    await authorize(tx, actorId, "orders:manage");
    return releaseExpired(tx, actorId);
  });
}
async function releaseExpired(tx: Tx, actorId: string | null) {
  const orders = await tx.order.findMany({
    where: {
      isDemo: true,
      status: "PENDING_CONFIRMATION",
      items: {
        some: {
          reservation: { status: "ACTIVE", expiresAt: { lte: new Date() } },
        },
      },
    },
    orderBy: { id: "asc" },
    take: 100,
  });
  for (const order of orders)
    await changeState(
      tx,
      order.id,
      "CANCELLED",
      "Expiration à 24 heures",
      actorId,
      true,
    );
  return orders.length;
}
export async function limitCheckout(db: PrismaClient, key: string) {
  return serial(db, async (tx) => {
    const now = Date.now();
    const previous = await tx.rateLimit.findUnique({ where: { key } });
    if (
      previous &&
      Number(previous.lastRequest) > now - 60_000 &&
      previous.count >= 30
    )
      throw new CommerceError("RATE_LIMIT", 429);
    await tx.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, lastRequest: BigInt(now) },
      update:
        previous && Number(previous.lastRequest) > now - 60_000
          ? { count: { increment: 1 } }
          : { count: 1, lastRequest: BigInt(now) },
    });
    await tx.rateLimit.deleteMany({
      where: {
        key: { startsWith: "checkout:" },
        lastRequest: { lt: BigInt(now - 3600000) },
      },
    });
  });
}
export async function collectCash(
  db: PrismaClient,
  actorId: string,
  orderId: string,
  reference: string,
) {
  if (reference.trim().length < 3 || reference.length > 100)
    throw new CommerceError("INVALID", 400);
  return serial(db, async (tx) => {
    await authorize(tx, actorId, "payments:collect");
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });
    if (!order?.isDemo || order.status !== "DELIVERED")
      throw new CommerceError("TRANSITION");
    const payment = order.payments.find(
      (p) => p.provider === "CASH_ON_DELIVERY",
    );
    if (!payment) throw new CommerceError("NOT_FOUND", 404);
    if (payment.status === "SUCCEEDED") return;
    if (payment.status !== "PENDING") throw new CommerceError("TRANSITION");
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCEEDED", providerReference: reference },
    });
    await audit(tx, actorId, "payment.collect.demo", "Payment", payment.id, {
      amountXof: payment.amountXof,
      reference,
    });
  });
}
