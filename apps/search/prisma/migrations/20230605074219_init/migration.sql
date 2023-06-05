-- CreateTable
CREATE TABLE "AlgoliaConfiguration" (
    "id" SERIAL NOT NULL,
    "appId" TEXT NOT NULL,
    "indexNamePrefix" TEXT,
    "secretKey" TEXT NOT NULL,
    "saleorApiUrl" TEXT NOT NULL,

    CONSTRAINT "AlgoliaConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlgoliaConfiguration_saleorApiUrl_key" ON "AlgoliaConfiguration"("saleorApiUrl");
