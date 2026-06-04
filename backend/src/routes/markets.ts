import { Router, Request, Response } from "express";
import { prisma } from "../db/client";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const markets = await prisma.market.findMany({
    include: {
      _count: { select: { positions: true, exploits: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const withRisk = await Promise.all(
    markets.map(async (m) => {
      const latest = await prisma.riskScore.findFirst({
        where: { marketId: m.id },
        orderBy: { timestamp: "desc" },
      });
      return {
        ...m,
        riskScore: latest ? Number(latest.score) / 1e18 : 0,
      };
    })
  );

  res.json(withRisk);
});

router.get("/:address", async (req: Request, res: Response) => {
  const { address } = req.params;
  const market = await prisma.market.findUnique({
    where: { address },
    include: {
      positions: true,
      exploits: true,
    },
  });

  if (!market) {
    res.status(404).json({ error: "Market not found" });
    return;
  }

  const latestRisk = await prisma.riskScore.findFirst({
    where: { marketId: market.id },
    orderBy: { timestamp: "desc" },
  });

  res.json({
    ...market,
    riskScore: latestRisk ? Number(latestRisk.score) / 1e18 : 0,
  });
});

router.get("/:address/history", async (req: Request, res: Response) => {
  const { address } = req.params;
  const hours = Math.min(parseInt(req.query.hours as string) || 24, 168);

  const market = await prisma.market.findUnique({ where: { address } });
  if (!market) {
    res.status(404).json({ error: "Market not found" });
    return;
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const scores = await prisma.riskScore.findMany({
    where: {
      marketId: market.id,
      timestamp: { gte: since },
    },
    orderBy: { timestamp: "asc" },
  });

  // Bucket into 1-hour candles
  const buckets = new Map<string, typeof scores>();
  for (const s of scores) {
    const hourKey = new Date(s.timestamp).toISOString().slice(0, 13) + ":00";
    if (!buckets.has(hourKey)) buckets.set(hourKey, []);
    buckets.get(hourKey)!.push(s);
  }

  const candles = Array.from(buckets.entries()).map(([time, items]) => {
    const prices = items.map((i) => Number(i.score) / 1e18);
    const vols = items.map((i) => Number(i.totalShort) + Number(i.totalLong));
    return {
      time: new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      open: Number(prices[0].toFixed(2)),
      high: Number(Math.max(...prices).toFixed(2)),
      low: Number(Math.min(...prices).toFixed(2)),
      close: Number(prices[prices.length - 1].toFixed(2)),
      volume: Math.floor(vols.reduce((a, b) => a + b, 0) / 1e6),
    };
  });

  res.json({ address, hours, candles });
});

export { router as marketsRouter };
