-- CreateTable
CREATE TABLE "SubmissionContent" (
    "hash" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionContent_pkey" PRIMARY KEY ("hash")
);
