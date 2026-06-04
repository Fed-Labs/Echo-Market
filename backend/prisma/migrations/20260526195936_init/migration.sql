-- CreateTable
CREATE TABLE "Market" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "windowDuration" INTEGER NOT NULL,
    "minStake" TEXT NOT NULL,
    "maxStake" TEXT NOT NULL,
    "insuranceBps" INTEGER NOT NULL,
    "totalShort" TEXT NOT NULL DEFAULT '0',
    "totalLong" TEXT NOT NULL DEFAULT '0',
    "status" TEXT NOT NULL DEFAULT 'Open',
    "openingTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "positionId" INTEGER NOT NULL,
    "marketId" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "posType" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "entryPrice" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exploit" (
    "id" TEXT NOT NULL,
    "submissionId" INTEGER NOT NULL,
    "marketId" TEXT NOT NULL,
    "researcher" TEXT NOT NULL,
    "ipfsCID" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "slashAmount" TEXT NOT NULL DEFAULT '0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exploit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskScore" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "score" TEXT NOT NULL,
    "totalShort" TEXT NOT NULL,
    "totalLong" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Researcher" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "verifiedFinds" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" TEXT NOT NULL DEFAULT '0',
    "winRate" INTEGER NOT NULL DEFAULT 0,
    "openPositions" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Researcher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Market_address_key" ON "Market"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Position_marketId_positionId_key" ON "Position"("marketId", "positionId");

-- CreateIndex
CREATE INDEX "RiskScore_protocol_timestamp_idx" ON "RiskScore"("protocol", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Researcher_address_key" ON "Researcher"("address");

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exploit" ADD CONSTRAINT "Exploit_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskScore" ADD CONSTRAINT "RiskScore_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
