CREATE TYPE "NotificationState" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'UNCERTAIN', 'SIMULATED', 'CANCELLED');
CREATE TABLE "OrderNotification" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "kind" TEXT NOT NULL DEFAULT 'ORDER_CREATED',
 "recipient" TEXT NOT NULL,
 "mode" TEXT NOT NULL,
 "state" "NotificationState" NOT NULL DEFAULT 'PENDING',
 "attempts" INTEGER NOT NULL DEFAULT 0 CHECK ("attempts" >= 0),
 "attemptId" TEXT,
 "providerMessageId" TEXT,
 "errorCode" TEXT,
 "nextAttemptAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "leaseUntil" TIMESTAMPTZ(3),
 "queuedAt" TIMESTAMPTZ(3),
 "deliveredAt" TIMESTAMPTZ(3),
 "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMPTZ(3) NOT NULL
);
CREATE UNIQUE INDEX "OrderNotification_orderId_kind_key" ON "OrderNotification"("orderId", "kind");
CREATE UNIQUE INDEX "OrderNotification_attemptId_key" ON "OrderNotification"("attemptId");
CREATE UNIQUE INDEX "OrderNotification_providerMessageId_key" ON "OrderNotification"("providerMessageId");
CREATE INDEX "OrderNotification_state_nextAttemptAt_idx" ON "OrderNotification"("state", "nextAttemptAt");
