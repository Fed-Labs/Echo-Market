import express, { Request, Response } from "express";
import cors from "cors";
import { prisma } from "../db/client";
import { marketsRouter } from "../routes/markets";
import { oracleRouter } from "../routes/oracle";
import { arbitrationRouter } from "../routes/arbitration";
import { leaderboardRouter } from "../routes/leaderboard";
import { submissionsRouter } from "../routes/submissions";

export function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/markets", marketsRouter);
  app.use("/oracle", oracleRouter);
  app.use("/arbitration", arbitrationRouter);
  app.use("/leaderboard", leaderboardRouter);
  app.use("/submissions", submissionsRouter);

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return app;
}
