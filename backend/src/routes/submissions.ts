import { Router } from "express";
import { prisma } from "../db/client";

const router = Router();

router.post("/", async (req, res) => {
  const { hash, content } = req.body;
  if (!hash || typeof hash !== "string" || hash.length !== 66) {
    return res.status(400).json({ error: "Invalid hash" });
  }
  if (!content || typeof content !== "string" || content.length > 500_000) {
    return res.status(400).json({ error: "Invalid content" });
  }
  try {
    await prisma.submissionContent.upsert({
      where: { hash },
      update: { content },
      create: { hash, content },
    });
    res.json({ success: true });
  } catch (err) {
    console.error("[Submissions] Store error:", err);
    res.status(500).json({ error: "Failed to store submission" });
  }
});

router.get("/:hash", async (req, res) => {
  const { hash } = req.params;
  try {
    const record = await prisma.submissionContent.findUnique({
      where: { hash },
    });
    if (!record) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json({ hash: record.hash, content: record.content });
  } catch (err) {
    console.error("[Submissions] Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
});

export { router as submissionsRouter };
