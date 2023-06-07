import { prisma, Prisma } from "../../db/prisma";

export class IndexingJobRepository {
  constructor(private prisma: Prisma) {}

  getJob(jobId: number, saleorApiUrl: string) {
    return this.prisma.indexJob.findFirst({
      where: {
        AND: {
          ownerSaleor: saleorApiUrl,
          jobId,
        },
      },
    });
  }

  createPendingJob(
    saleorApiUrl: string,
    job: {
      jobId: number;
      createdByEmail: string;
      secretKey: string;
    }
  ) {
    return this.prisma.indexJob.create({
      data: {
        ownerSaleor: saleorApiUrl,
        jobId: job.jobId,
        createdBy: job.createdByEmail,
        status: "PENDING",
      },
    });
  }
}

export const indexingJobRepository = new IndexingJobRepository(prisma);
