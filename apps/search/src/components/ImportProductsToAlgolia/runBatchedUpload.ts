const PENDING_UPLOADS_BATCH_SIZE = 10;

export const runBatchedUpload = async <T>(
  generator: AsyncGenerator<T[]>,
  upload: (batch: T[]) => Promise<void>,
  incrementTotal: (total: number) => void,
) => {
  let pendingUploads: Promise<void>[] = [];

  for await (const batch of generator) {
    incrementTotal(batch.length);
    pendingUploads.push(upload(batch));

    if (pendingUploads.length >= PENDING_UPLOADS_BATCH_SIZE) {
      await Promise.all(pendingUploads);
      pendingUploads = [];
    }
  }

  if (pendingUploads.length > 0) {
    await Promise.all(pendingUploads);
  }
};
