-- CreateTable
CREATE TABLE "IndexJob" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "IndexJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IndexJob_jobId_key" ON "IndexJob"("jobId");
