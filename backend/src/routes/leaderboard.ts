import { Router, Request, Response } from "express";
import { prisma } from "../db/client";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const chain = req.query.chain as string | undefined;
  const category = req.query.category as string | undefined;

  // Basic leaderboard by verified finds
  const researchers = await prisma.researcher.findMany({
    orderBy: { verifiedFinds: "desc" },
    take: 100,
  });

  const ranked = researchers.map((r, i) => ({
    rank: i + 1,
    address: r.address,
    verifiedFinds: r.verifiedFinds,
    totalEarned: r.totalEarned,
    winRate: r.winRate,
    openPositions: r.openPositions,
  }));

  res.json(ranked);
});

export { router as leaderboardRouter };
