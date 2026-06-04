import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/client";

const router = Router();

const submitSchema = z.object({
  market: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  ipfsCID: z.string(),
  calldata: z.string(),
  stakeAmount: z.string(),
});

router.post("/submit", async (req: Request, res: Response) => {
  const parse = submitSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.flatten() });
    return;
  }

  const { market, ipfsCID } = parse.data;

  const dbMarket = await prisma.market.findUnique({
    where: { address: market },
  });
  if (!dbMarket) {
    res.status(404).json({ error: "Market not found" });
    return;
  }

  res.json({
    status: "ready_for_signature",
    payload: { market, ipfsCID },
  });
});

router.get("/submissions", async (_req: Request, res: Response) => {
  const submissions = await prisma.exploit.findMany({
    include: { market: true },
    orderBy: { submittedAt: "desc" },
  });
  res.json(submissions);
});

router.get("/submissions/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const submission = await prisma.exploit.findFirst({
    where: { submissionId: id },
    include: { market: true },
  });

  if (!submission) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }

  res.json(submission);
});

export { router as arbitrationRouter };
