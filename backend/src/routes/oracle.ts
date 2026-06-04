import { Router, Request, Response } from "express";
import { prisma } from "../db/client";

const router = Router();

router.get("/:address", async (req: Request, res: Response) => {
  const { address } = req.params;
  const market = await prisma.market.findUnique({
    where: { address },
  });

  if (!market) {
    res.status(404).json({ error: "Market not found" });
    return;
  }

  const latest = await prisma.riskScore.findFirst({
    where: { marketId: market.id },
    orderBy: { timestamp: "desc" },
  });

  const history = await prisma.riskScore.findMany({
    where: { marketId: market.id },
    orderBy: { timestamp: "asc" },
    take: 1000,
  });

  res.json({
    protocol: market.protocol,
    address: market.address,
    currentScore: latest ? Number(latest.score) / 1e18 : 0,
    totalShort: market.totalShort,
    totalLong: market.totalLong,
    lastUpdate: latest?.timestamp ?? null,
    history: history.map((h) => ({
      score: Number(h.score) / 1e18,
      timestamp: h.timestamp,
    })),
  });
});

router.get("/:address/feed", async (req: Request, res: Response) => {
  const { address } = req.params;
  const market = await prisma.market.findUnique({
    where: { address },
  });

  if (!market) {
    res.status(404).json({ error: "Market not found" });
    return;
  }

  const latest = await prisma.riskScore.findFirst({
    where: { marketId: market.id },
    orderBy: { timestamp: "desc" },
  });

  const score = latest ? Number(latest.score) / 1e18 : 0;

  // Chainlink-compatible format
  res.json({
    roundId: "1",
    answer: (score * 1e8).toFixed(0),
    decimals: 8,
    description: `Echo Risk Score for ${market.protocol}`,
    updatedAt: latest?.timestamp ?? new Date(),
  });
});

export { router as oracleRouter };
