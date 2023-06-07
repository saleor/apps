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

  getJobs(saleorApiUrl: string) {
    return this.prisma.indexJob.findMany({
      where: {
        ownerSaleor: saleorApiUrl,
      },
    });
  }

  createPendingJob(
    saleorApiUrl: string,
    job: {
      jobId: number;
      createdByEmail: string;
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

  // todo should repository verify saleorApiUrl for protection?
  updateJobStatus(saleorApiUrl: string, jobId: number, status: "ERROR" | "SUCCESS") {
    return this.prisma.indexJob.update({
      where: {
        jobId: jobId,
      },
      data: {
        status,
      },
    });
  }
}

export const indexingJobRepository = new IndexingJobRepository(prisma);
