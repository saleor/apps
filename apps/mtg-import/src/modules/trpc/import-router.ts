/**
 * tRPC router for import job management.
 *
 * Endpoints:
 * - jobs.list — List jobs with pagination and filtering
 * - jobs.get — Get a single job by ID
 * - jobs.create — Create a new import job (set import or bulk)
 * - jobs.cancel — Cancel a running job
 * - jobs.retry — Retry a failed job
 * - sets.list — List available sets from Scryfall
 * - sets.importStatus — Get import status for sets
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { ImportJobStatus, ImportJobType } from "@/generated/prisma";

import { createLogger } from "@/lib/logger";
import { env } from "@/lib/env";
import { ScryfallClient, BulkDataManager, createCardFilter } from "../scryfall";
import { JobProcessor } from "../import/job-processor";
import { ATTRIBUTE_DEFS, NEW_ATTRIBUTE_SLUGS } from "../import/attribute-map";
import { SaleorImportClient } from "../saleor";
import { MtgjsonBulkDataManager } from "../mtgjson";
import { buildAttributeIdMap, buildProductAttributes } from "../import/attribute-map";
import { protectedClientProcedure } from "./protected-client-procedure";
import { router } from "./trpc-server";

/**
 * Reverse lookup: variant display name → canonical condition value for dropdown.
 * Variant names use full condition names (e.g., "Near Mint - Non-Foil").
 */
const CONDITION_REVERSE: Record<string, string> = {
  "Near Mint": "Near Mint",
  "Lightly Played": "Lightly Played",
  "Moderately Played": "Moderately Played",
  "Heavily Played": "Heavily Played",
  "Damaged": "Damaged",
  // Short codes (just in case)
  "NM": "Near Mint",
  "LP": "Lightly Played",
  "MP": "Moderately Played",
  "HP": "Heavily Played",
  "DMG": "Damaged",
};

/**
 * Reverse lookup: variant display name → canonical finish value for dropdown.
 */
const FINISH_REVERSE: Record<string, string> = {
  "Non-Foil": "Non-Foil",
  "Nonfoil": "Non-Foil",
  "Foil": "Foil",
  "Etched": "Etched",
  // Short codes
  "NF": "Non-Foil",
  "F": "Foil",
  "E": "Etched",
};

const logger = createLogger("ImportRouter");

// Shared Scryfall client (singleton per process)
let scryfallClient: ScryfallClient | null = null;
function getScryfallClient(): ScryfallClient {
  if (!scryfallClient) {
    scryfallClient = new ScryfallClient({
      contactEmail: env.SCRYFALL_CONTACT_EMAIL,
    });
  }
  return scryfallClient;
}

// Active processors (for cancellation)
const activeProcessors = new Map<string, JobProcessor>();

// Graceful shutdown: checkpoint and mark jobs as interrupted on SIGTERM
function handleShutdown(signal: string) {
  if (activeProcessors.size === 0) return;
  logger.info(`${signal} received, cancelling ${activeProcessors.size} active import job(s)`);
  for (const [jobId, processor] of activeProcessors) {
    logger.info("Cancelling job due to shutdown", { jobId });
    processor.cancel();
  }
}
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

// --- Jobs Router ---

const jobsRouter = router({
  /** List import jobs with optional filtering */
  list: protectedClientProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where = {
        installationId: ctx.installationId,
        ...(input?.status && { status: input.status }),
      };

      const jobs = await ctx.prisma.importJob.findMany({
        where,
        orderBy: [
          { status: "asc" },
          { priority: "asc" },
          { createdAt: "desc" },
        ],
        take: input?.limit ?? 20,
        ...(input?.cursor && {
          skip: 1,
          cursor: { id: input.cursor },
        }),
      });

      return {
        jobs,
        nextCursor: jobs.length > 0 ? jobs[jobs.length - 1].id : undefined,
      };
    }),

  /** Get a single job with its imported products */
  get: protectedClientProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.prisma.importJob.findFirst({
        where: {
          id: input.id,
          installationId: ctx.installationId,
        },
        include: {
          importedProducts: {
            take: 50,
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: { importedProducts: true },
          },
        },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Import job not found" });
      }

      return job;
    }),

  /** Create a new import job */
  create: protectedClientProcedure
    .input(
      z.object({
        type: z.enum(["SET", "BULK", "BACKFILL"]),
        setCode: z.string().min(2).max(10).optional(),
        priority: z.number().min(0).max(2).default(2),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate: SET type requires setCode; BACKFILL is optional (omit = full scan)
      if (input.type === "SET" && !input.setCode) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "setCode is required for SET import type",
        });
      }

      // Check for existing running/pending jobs with same parameters
      const existing = await ctx.prisma.importJob.findFirst({
        where: {
          installationId: ctx.installationId,
          status: { in: ["PENDING", "RUNNING"] },
          type: input.type as ImportJobType,
          ...(input.setCode && { setCode: input.setCode.toLowerCase() }),
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `A ${input.type} job for ${input.setCode ?? "all sets"} is already ${existing.status.toLowerCase()}`,
        });
      }

      // Pre-flight validation: ensure Saleor is configured with current settings
      const settings = await ctx.prisma.importSettings.findUnique({
        where: { installationId: ctx.installationId },
      });
      const saleor = new SaleorImportClient(ctx.apiClient!);
      try {
        await saleor.resolveImportContext(
          settings?.channelSlugs ?? ["webstore", "singles-builder"],
          settings?.productTypeSlug ?? "mtg-card",
          settings?.categorySlug ?? "mtg-singles",
          settings?.warehouseSlugs ?? [],
        );
      } catch (err) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Saleor is not properly configured for imports: ${err instanceof Error ? err.message : String(err)}`,
        });
      }

      // Get card count for SET/BACKFILL imports (also validates the set code)
      let cardsTotal = 0;
      if ((input.type === "SET" || input.type === "BACKFILL") && input.setCode) {
        try {
          const set = await getScryfallClient().getSet(input.setCode.toLowerCase());
          cardsTotal = set.card_count;

          // Reject digital-only sets when physicalOnly is enabled
          if (set.digital && (settings?.physicalOnly ?? true)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Set "${set.name}" (${input.setCode}) is digital-only. Disable "Physical Only" in settings to import digital sets.`,
            });
          }
        } catch (err) {
          if (err instanceof TRPCError) throw err;
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Set "${input.setCode}" not found on Scryfall`,
          });
        }
      }

      const job = await ctx.prisma.importJob.create({
        data: {
          installationId: ctx.installationId,
          type: input.type as ImportJobType,
          status: "PENDING",
          priority: input.priority,
          setCode: input.setCode?.toLowerCase() ?? null,
          cardsTotal,
        },
      });

      logger.info("Import job created", {
        jobId: job.id,
        type: job.type,
        setCode: job.setCode,
        priority: job.priority,
      });

      // Start processing asynchronously (fire and forget)
      void startJobProcessing(job.id, ctx.prisma, ctx.apiClient!);

      return job;
    }),

  /** Cancel a running job */
  cancel: protectedClientProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.prisma.importJob.findFirst({
        where: {
          id: input.id,
          installationId: ctx.installationId,
        },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Import job not found" });
      }

      if (job.status !== "RUNNING" && job.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot cancel a ${job.status.toLowerCase()} job`,
        });
      }

      // Signal abort to active processor
      const processor = activeProcessors.get(job.id);
      if (processor) {
        processor.cancel();
        activeProcessors.delete(job.id);
      }

      await ctx.prisma.importJob.update({
        where: { id: job.id },
        data: { status: "CANCELLED" },
      });

      logger.info("Import job cancelled", { jobId: job.id });
      return { success: true };
    }),

  /** Retry a failed job (creates a new job with resume from checkpoint) */
  retry: protectedClientProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const originalJob = await ctx.prisma.importJob.findFirst({
        where: {
          id: input.id,
          installationId: ctx.installationId,
        },
      });

      if (!originalJob) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Import job not found" });
      }

      if (originalJob.status !== "FAILED" && originalJob.status !== "CANCELLED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Can only retry failed or cancelled jobs`,
        });
      }

      // Create new job resuming from the original's checkpoint
      const retryJob = await ctx.prisma.importJob.create({
        data: {
          installationId: ctx.installationId,
          type: originalJob.type,
          status: "PENDING",
          priority: originalJob.priority,
          setCode: originalJob.setCode,
          cardsTotal: originalJob.cardsTotal,
          lastCheckpoint: originalJob.lastCheckpoint,
        },
      });

      logger.info("Import job retry created", {
        originalJobId: originalJob.id,
        retryJobId: retryJob.id,
        checkpoint: retryJob.lastCheckpoint,
      });

      void startJobProcessing(retryJob.id, ctx.prisma, ctx.apiClient!);

      return retryJob;
    }),

  /** Create batch backfill jobs for multiple sets */
  createBatch: protectedClientProcedure
    .input(
      z.object({
        setCodes: z.array(z.string().min(2).max(10)).min(1).max(50),
        priority: z.number().min(0).max(2).default(2),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const jobs = [];
      for (const code of input.setCodes) {
        const setCode = code.toLowerCase();

        // Skip if already running/pending
        const existing = await ctx.prisma.importJob.findFirst({
          where: {
            installationId: ctx.installationId,
            status: { in: ["PENDING", "RUNNING"] },
            setCode,
          },
        });
        if (existing) continue;

        let cardsTotal = 0;
        try {
          const set = await getScryfallClient().getSet(setCode);
          cardsTotal = set.card_count;
        } catch {
          // continue with 0
        }

        const job = await ctx.prisma.importJob.create({
          data: {
            installationId: ctx.installationId,
            type: "BACKFILL" as ImportJobType,
            status: "PENDING",
            priority: input.priority,
            setCode,
            cardsTotal,
          },
        });

        void startJobProcessing(job.id, ctx.prisma, ctx.apiClient!);
        jobs.push(job);
      }

      logger.info("Batch jobs created", { count: jobs.length, setCodes: input.setCodes });
      return { created: jobs.length, jobs };
    }),
});

// --- Sets Router ---

const setsRouter = router({
  /** List available sets from Scryfall (filtered by configured set types) */
  list: protectedClientProcedure.query(async ({ ctx }) => {
    const defaultSetTypes = ["core", "expansion", "masters", "draft_innovation", "commander", "starter", "funny"];

    // Load importable set types and physicalOnly toggle from settings
    const settings = await ctx.prisma.importSettings.findUnique({
      where: { installationId: ctx.installationId },
      select: { importableSetTypes: true, physicalOnly: true },
    });
    const setTypes = settings?.importableSetTypes?.length ? settings.importableSetTypes : defaultSetTypes;
    const physicalOnly = settings?.physicalOnly ?? true;

    const sets = await getScryfallClient().listSets();
    const importable = sets
      .filter((s) => !physicalOnly || !s.digital)
      .filter((s) => setTypes.includes(s.set_type))
      .sort((a, b) => {
        const dateA = a.released_at ?? "";
        const dateB = b.released_at ?? "";
        return dateB.localeCompare(dateA);
      });

    return importable;
  }),

  /** Get import status for sets we've imported */
  importStatus: protectedClientProcedure.query(async ({ ctx }) => {
    const audits = await ctx.prisma.setAudit.findMany({
      where: { installationId: ctx.installationId },
      orderBy: { lastImportedAt: "desc" },
    });
    return audits;
  }),

  /** Verify a specific set's import completeness */
  verify: protectedClientProcedure
    .input(z.object({ setCode: z.string().min(2).max(10) }))
    .query(async ({ ctx, input }) => {
      const setCode = input.setCode.toLowerCase();

      // Get Scryfall set info for reference count
      let scryfallTotal = 0;
      let setName = setCode.toUpperCase();
      try {
        const scryfallSet = await getScryfallClient().getSet(setCode);
        scryfallTotal = scryfallSet.card_count;
        setName = scryfallSet.name;
      } catch {
        // If Scryfall unavailable, use our stored total
      }

      // Get our audit record
      const audit = await ctx.prisma.setAudit.findUnique({
        where: {
          installationId_setCode: {
            installationId: ctx.installationId,
            setCode,
          },
        },
      });

      // Count imported products by status
      const [successCount, duplicateCount, failedCount] = await Promise.all([
        ctx.prisma.importedProduct.count({
          where: { setCode, success: true, saleorProductId: { not: "existing" } },
        }),
        ctx.prisma.importedProduct.count({
          where: { setCode, success: true, saleorProductId: "existing" },
        }),
        ctx.prisma.importedProduct.count({
          where: { setCode, success: false },
        }),
      ]);

      const totalImported = successCount + duplicateCount;
      const totalFromScryfall = scryfallTotal || audit?.totalCards || 0;
      const completeness = totalFromScryfall > 0
        ? Math.round((totalImported / totalFromScryfall) * 100)
        : 0;

      return {
        setCode,
        setName,
        scryfallTotal: totalFromScryfall,
        imported: totalImported,
        newlyCreated: successCount,
        alreadyExisted: duplicateCount,
        failed: failedCount,
        completeness,
        lastImportedAt: audit?.lastImportedAt ?? null,
      };
    }),
  /** Scan a set for missing/failed cards vs Scryfall */
  scan: protectedClientProcedure
    .input(z.object({ setCode: z.string().min(2).max(10) }))
    .query(async ({ ctx, input }) => {
      const setCode = input.setCode.toLowerCase();
      logger.info("Scan started", { setCode });

      // Get set metadata from Scryfall
      let setName = setCode.toUpperCase();
      try {
        const scryfallSet = await getScryfallClient().getSet(setCode);
        setName = scryfallSet.name;
      } catch {
        // Will still scan via search API
      }

      // Get all ImportedProduct records for this set
      const imported = await ctx.prisma.importedProduct.findMany({
        where: { setCode },
        select: {
          scryfallId: true,
          success: true,
          errorMessage: true,
          cardName: true,
          collectorNumber: true,
          rarity: true,
        },
      });

      const successfulIds = new Set<string>();
      const failedCards: Array<{
        scryfallId: string;
        name: string;
        collectorNumber: string;
        rarity: string;
        errorMessage: string | null;
      }> = [];

      for (const record of imported) {
        if (record.success) {
          successfulIds.add(record.scryfallId);
        } else {
          failedCards.push({
            scryfallId: record.scryfallId,
            name: record.cardName,
            collectorNumber: record.collectorNumber,
            rarity: record.rarity,
            errorMessage: record.errorMessage,
          });
        }
      }

      // Load settings to build configurable card filter
      const settings = await ctx.prisma.importSettings.findUnique({
        where: { installationId: ctx.installationId },
      });
      const cardFilter = createCardFilter({
        physicalOnly: settings?.physicalOnly ?? true,
        includeOversized: settings?.includeOversized ?? false,
        includeTokens: settings?.includeTokens ?? false,
        importableSetTypes: new Set(settings?.importableSetTypes ?? ["core", "expansion", "masters", "draft_innovation", "commander", "starter", "funny"]),
      });

      // Search Scryfall for all cards in this set (paginated API, much faster than bulk data)
      const client = getScryfallClient();
      const missingCards: Array<{
        scryfallId: string;
        name: string;
        collectorNumber: string;
        rarity: string;
      }> = [];
      let scryfallTotal = 0;

      try {
        for await (const card of client.searchAll(`set:${setCode}`, { unique: "prints" })) {
          if (!cardFilter(card)) continue;
          scryfallTotal++;

          if (!successfulIds.has(card.id)) {
            // Check if it's already in the failed list
            const alreadyFailed = failedCards.some((f) => f.scryfallId === card.id);
            if (!alreadyFailed) {
              missingCards.push({
                scryfallId: card.id,
                name: card.name,
                collectorNumber: card.collector_number,
                rarity: card.rarity,
              });
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Unable to scan: Scryfall API unavailable. ${msg}`,
        });
      }

      logger.info("Scan complete", {
        setCode,
        scryfallTotal,
        importedCount: successfulIds.size,
        missingCount: missingCards.length,
        failedCount: failedCards.length,
      });

      return {
        setCode,
        setName,
        scannedAt: new Date().toISOString(),
        scryfallTotal,
        importedCount: successfulIds.size,
        missingCount: missingCards.length,
        failedCount: failedCards.length,
        missingCards,
        failedCards,
      };
    }),

  /** Audit product attributes against expected attribute definitions */
  auditAttributes: protectedClientProcedure
    .input(z.object({ setCode: z.string().min(2).max(10) }))
    .query(async ({ ctx, input }) => {
      const setCode = input.setCode.toLowerCase();
      const saleor = new SaleorImportClient(ctx.apiClient!);

      const products = await saleor.getProductsBySetCode(setCode);
      const expectedSlugs = ATTRIBUTE_DEFS.map((d) => d.slug);

      const attributeIssues: Array<{
        saleorProductId: string;
        cardName: string;
        missingAttributes: string[];
        staleAttributes: string[];
        imageStale: boolean;
      }> = [];

      let productsMissingAttributes = 0;
      let productsStaleAttributes = 0;
      let productsStaleImages = 0;

      for (const product of products) {
        const existingSlugs = new Set(product.attributes.map((a) => a.attribute.slug));

        const missing = expectedSlugs.filter((slug) => !existingSlugs.has(slug));
        const stale = product.attributes
          .filter((a) => expectedSlugs.includes(a.attribute.slug))
          .filter((a) => a.values.length === 0 || a.values.every((v) => !v.name && !v.plainText))
          .map((a) => a.attribute.slug);

        const imageStale = product.media.length === 0;

        if (missing.length > 0) productsMissingAttributes++;
        if (stale.length > 0) productsStaleAttributes++;
        if (imageStale) productsStaleImages++;

        if (missing.length > 0 || stale.length > 0 || imageStale) {
          attributeIssues.push({
            saleorProductId: product.id,
            cardName: product.name,
            missingAttributes: missing,
            staleAttributes: stale,
            imageStale,
          });
        }
      }

      return {
        productsAudited: products.length,
        summary: {
          totalIssues: attributeIssues.length,
          productsMissingAttributes,
          productsStaleAttributes,
          productsStaleImages,
        },
        attributeIssues,
      };
    }),

  /** Repair missing attributes by triggering a backfill job */
  repairAttributes: protectedClientProcedure
    .input(z.object({ setCode: z.string().min(2).max(10) }))
    .mutation(async ({ ctx, input }) => {
      const setCode = input.setCode.toLowerCase();

      // Check for existing running/pending backfill
      const existing = await ctx.prisma.importJob.findFirst({
        where: {
          installationId: ctx.installationId,
          status: { in: ["PENDING", "RUNNING"] },
          type: "BACKFILL",
          setCode,
        },
      });

      if (existing) {
        return { repaired: 0, failed: 0, message: "A backfill job is already running for this set" };
      }

      let cardsTotal = 0;
      try {
        const set = await getScryfallClient().getSet(setCode);
        cardsTotal = set.card_count;
      } catch {
        // continue with 0
      }

      const job = await ctx.prisma.importJob.create({
        data: {
          installationId: ctx.installationId,
          type: "BACKFILL" as ImportJobType,
          status: "PENDING",
          priority: 1,
          setCode,
          cardsTotal,
        },
      });

      void startJobProcessing(job.id, ctx.prisma, ctx.apiClient!);

      logger.info("Repair job created", { setCode, jobId: job.id });
      return { repaired: cardsTotal, failed: 0, jobId: job.id };
    }),

  /** Repair missing images by calling productMediaCreate for products with mediaAttached=false */
  repairImages: protectedClientProcedure
    .input(z.object({ setCode: z.string().min(2).max(10) }))
    .mutation(async ({ ctx, input }) => {
      const setCode = input.setCode.toLowerCase();
      const saleor = new SaleorImportClient(ctx.apiClient!);

      // Find products needing image attachment
      const products = await ctx.prisma.importedProduct.findMany({
        where: {
          setCode,
          mediaAttached: false,
          success: true,
          saleorProductId: { not: "existing" },
        },
        select: {
          id: true,
          saleorProductId: true,
          cardName: true,
        },
      });

      if (products.length === 0) {
        return { repaired: 0, failed: 0, errors: [] as string[] };
      }

      logger.info("Repairing images", { setCode, count: products.length });

      let repaired = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const product of products) {
        // Fetch image URL from product metadata
        const metadata = await saleor.getProductMetadata(product.saleorProductId);
        const imageUrl = metadata?.find((m) => m.key === "scryfall_image_url")?.value;

        if (!imageUrl) {
          // No scryfall_image_url — likely imported before two-phase code.
          // Mark as handled so it doesn't appear in future repair runs.
          await ctx.prisma.importedProduct.update({
            where: { id: product.id },
            data: { mediaAttached: true },
          });
          continue;
        }

        const media = await saleor.createProductMedia(
          product.saleorProductId,
          imageUrl,
          product.cardName.substring(0, 250)
        );

        if (media) {
          await ctx.prisma.importedProduct.update({
            where: { id: product.id },
            data: { mediaAttached: true },
          });
          repaired++;
        } else {
          failed++;
          errors.push(`${product.cardName}: productMediaCreate failed`);
        }
      }

      logger.info("Image repair complete", { setCode, repaired, failed });
      return { repaired, failed, errors: errors.slice(0, 50) };
    }),

  /** Scan all imported sets for completeness summary */
  scanAll: protectedClientProcedure.query(async ({ ctx }) => {
    const audits = await ctx.prisma.setAudit.findMany({
      where: { installationId: ctx.installationId },
      orderBy: { lastImportedAt: "desc" },
    });

    const results = await Promise.all(
      audits.map(async (audit) => {
        let scryfallTotal = audit.totalCards;
        try {
          const set = await getScryfallClient().getSet(audit.setCode);
          scryfallTotal = set.card_count;
        } catch {
          // use stored total
        }

        return {
          setCode: audit.setCode,
          importedCards: audit.importedCards,
          scryfallTotal,
          completeness: scryfallTotal > 0
            ? Math.round((audit.importedCards / scryfallTotal) * 100)
            : 0,
          lastImportedAt: audit.lastImportedAt,
        };
      })
    );

    const incomplete = results.filter((r) => r.completeness < 100);
    return {
      totalSets: results.length,
      incompleteSets: incomplete.length,
      completeSets: results.length - incomplete.length,
      sets: results,
    };
  }),

  /** Backfill variant attributes (mtg-condition, mtg-finish) by parsing variant names */
  backfillAttributes: protectedClientProcedure
    .input(z.object({ setCode: z.string().min(2).max(10) }))
    .mutation(async ({ ctx, input }) => {
      const setCode = input.setCode.toLowerCase();
      const saleor = new SaleorImportClient(ctx.apiClient!);

      // Resolve variant attribute IDs from product type
      const productType = await saleor.getProductType();
      const variantAttrMap = buildAttributeIdMap(productType.variantAttributes);
      const condAttrId = variantAttrMap.get("mtg-condition");
      const finishAttrId = variantAttrMap.get("mtg-finish");

      if (!condAttrId || !finishAttrId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Product type missing mtg-condition or mtg-finish variant attributes",
        });
      }

      // Fetch all products with variants for this set
      const products = await saleor.getProductsWithVariants(setCode);

      let productsScanned = 0;
      let variantsUpdated = 0;
      let variantsSkipped = 0;
      const errors: string[] = [];

      for (const product of products) {
        productsScanned++;
        const variantUpdates: Array<{ id: string; attributes: Array<Record<string, unknown>> }> = [];

        for (const variant of product.variants) {
          // Check if variant already has both attributes populated
          const hasCondition = variant.attributes.some(
            (a) => a.attribute.slug === "mtg-condition" && a.values.length > 0 && a.values[0].name
          );
          const hasFinish = variant.attributes.some(
            (a) => a.attribute.slug === "mtg-finish" && a.values.length > 0 && a.values[0].name
          );

          if (hasCondition && hasFinish) {
            variantsSkipped++;
            continue;
          }

          // Parse variant name: "Near Mint - Non-Foil"
          const parts = variant.name.split(" - ");
          if (parts.length < 2) {
            errors.push(`Cannot parse variant name: "${variant.name}" (product: ${product.name})`);
            continue;
          }

          const conditionPart = parts[0].trim();
          const finishPart = parts.slice(1).join(" - ").trim();

          const conditionValue = CONDITION_REVERSE[conditionPart];
          const finishValue = FINISH_REVERSE[finishPart];

          if (!conditionValue) {
            errors.push(`Unknown condition: "${conditionPart}" in variant "${variant.name}" (product: ${product.name})`);
            continue;
          }
          if (!finishValue) {
            errors.push(`Unknown finish: "${finishPart}" in variant "${variant.name}" (product: ${product.name})`);
            continue;
          }

          const attrs: Array<Record<string, unknown>> = [];
          if (!hasCondition) {
            attrs.push({ id: condAttrId, dropdown: { value: conditionValue } });
          }
          if (!hasFinish) {
            attrs.push({ id: finishAttrId, dropdown: { value: finishValue } });
          }

          if (attrs.length > 0) {
            variantUpdates.push({ id: variant.id, attributes: attrs });
          }
        }

        if (variantUpdates.length > 0) {
          try {
            const result = await saleor.bulkUpdateVariants(product.id, variantUpdates);
            variantsUpdated += result.count;

            // Collect row-level errors
            for (const row of result.results) {
              for (const err of row.errors) {
                errors.push(`Update error (${product.name}): ${err.message ?? err.code}`);
              }
            }
          } catch (err) {
            errors.push(`Failed to update variants for ${product.name}: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      }

      logger.info("Backfill attributes complete", {
        setCode,
        productsScanned,
        variantsUpdated,
        variantsSkipped,
        errorCount: errors.length,
      });

      return { productsScanned, variantsUpdated, variantsSkipped, errors };
    }),

  /** Backfill variant attributes for ALL imported sets */
  backfillAllAttributes: protectedClientProcedure
    .mutation(async ({ ctx }) => {
      const saleor = new SaleorImportClient(ctx.apiClient!);

      // Validate prerequisites before starting background work
      const productType = await saleor.getProductType();
      const variantAttrMap = buildAttributeIdMap(productType.variantAttributes);
      const condAttrId = variantAttrMap.get("mtg-condition");
      const finishAttrId = variantAttrMap.get("mtg-finish");

      if (!condAttrId || !finishAttrId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Product type missing mtg-condition or mtg-finish variant attributes",
        });
      }

      // Get all imported sets
      const audits = await ctx.prisma.setAudit.findMany({
        where: { installationId: ctx.installationId },
        select: { setCode: true },
      });

      if (audits.length === 0) {
        return { totalSets: 0, message: "No imported sets found. Run Rebuild Audits first." };
      }

      // Fire-and-forget: process sets in the background so we don't hit ALB timeout.
      // Capture references needed for the async work before returning.
      const prisma = ctx.prisma;
      const installationId = ctx.installationId;

      const processInBackground = async () => {
        let setsProcessed = 0;
        let totalVariantsUpdated = 0;
        let totalErrors = 0;

        for (const audit of audits) {
          try {
            const products = await saleor.getProductsWithVariants(audit.setCode);

            for (const product of products) {
              const variantUpdates: Array<{ id: string; attributes: Array<Record<string, unknown>> }> = [];

              for (const variant of product.variants) {
                const hasCondition = variant.attributes.some(
                  (a) => a.attribute.slug === "mtg-condition" && a.values.length > 0 && a.values[0].name
                );
                const hasFinish = variant.attributes.some(
                  (a) => a.attribute.slug === "mtg-finish" && a.values.length > 0 && a.values[0].name
                );

                if (hasCondition && hasFinish) continue;

                const parts = variant.name.split(" - ");
                if (parts.length < 2) continue;

                const conditionValue = CONDITION_REVERSE[parts[0].trim()];
                const finishValue = FINISH_REVERSE[parts.slice(1).join(" - ").trim()];

                if (!conditionValue || !finishValue) continue;

                const attrs: Array<Record<string, unknown>> = [];
                if (!hasCondition) attrs.push({ id: condAttrId, dropdown: { value: conditionValue } });
                if (!hasFinish) attrs.push({ id: finishAttrId, dropdown: { value: finishValue } });

                if (attrs.length > 0) {
                  variantUpdates.push({ id: variant.id, attributes: attrs });
                }
              }

              if (variantUpdates.length > 0) {
                try {
                  const result = await saleor.bulkUpdateVariants(product.id, variantUpdates);
                  totalVariantsUpdated += result.count;
                } catch {
                  totalErrors++;
                }
              }
            }

            setsProcessed++;
            if (setsProcessed % 25 === 0) {
              logger.info("Fix all attrs progress", {
                setsProcessed,
                totalSets: audits.length,
                totalVariantsUpdated,
              });
            }
          } catch {
            totalErrors++;
          }
        }

        logger.info("Fix all attrs background job complete", {
          setsProcessed,
          totalSets: audits.length,
          totalVariantsUpdated,
          totalErrors,
        });
      };

      // Start background processing — don't await
      processInBackground().catch((err) => {
        logger.error("Fix all attrs background job failed", {
          error: err instanceof Error ? err.message : String(err),
        });
      });

      // Return immediately
      return {
        totalSets: audits.length,
        message: `Processing ${audits.length} sets in the background. Check logs for progress.`,
      };
    }),

  /**
   * Backfill the 7 new product-level attributes on existing imported products.
   * Uses ImportedProduct table for scryfallId→saleorProductId mapping,
   * streams Scryfall bulk data, and calls productUpdate concurrently in batches.
   * Fire-and-forget: returns immediately, processes in background.
   */
  backfillProductAttributes: protectedClientProcedure
    .input(z.object({ setCode: z.string().min(2).max(10).optional() }))
    .mutation(async ({ ctx, input }) => {
      const saleor = new SaleorImportClient(ctx.apiClient!);

      // Resolve product-level attribute IDs, filtered to only new slugs
      const productType = await saleor.getProductType();
      const fullAttrMap = buildAttributeIdMap(productType.productAttributes);
      const attrMap = new Map<string, string>();
      for (const slug of NEW_ATTRIBUTE_SLUGS) {
        const id = fullAttrMap.get(slug);
        if (id) attrMap.set(slug, id);
      }

      if (attrMap.size === 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `None of the new attribute slugs found on product type. Run setupAttributes first. Expected: ${[...NEW_ATTRIBUTE_SLUGS].join(", ")}`,
        });
      }

      // Build scryfallId → saleorProductId lookup from ImportedProduct
      const setFilter = input.setCode ? { setCode: input.setCode.toLowerCase() } : {};
      const imported = await ctx.prisma.importedProduct.findMany({
        where: {
          success: true,
          saleorProductId: { not: "existing" },
          importJob: { installationId: ctx.installationId },
          ...setFilter,
        },
        select: { scryfallId: true, saleorProductId: true },
      });

      if (imported.length === 0) {
        return {
          totalProducts: 0,
          message: "No imported products found matching criteria.",
        };
      }

      const idMap = new Map<string, string>();
      for (const row of imported) {
        idMap.set(row.scryfallId, row.saleorProductId);
      }

      logger.info("Backfill product attributes starting", {
        setCode: input.setCode ?? "ALL",
        attributesMapped: attrMap.size,
        importedProducts: idMap.size,
      });

      // Fire-and-forget background processing
      const processInBackground = async () => {
        const BATCH_SIZE = 25;
        const CONCURRENCY = 10;
        let batch: Array<{ id: string; input: Record<string, unknown> }> = [];
        let batchesSent = 0;
        let productsMatched = 0;
        let productsSkipped = 0;
        let totalUpdated = 0;
        let totalErrors = 0;

        const flushBatch = async () => {
          if (batch.length === 0) return;
          try {
            const result = await saleor.updateProductsBatch(batch, CONCURRENCY);
            totalUpdated += result.updated;
            totalErrors += result.failed;
            batchesSent++;

            if (batchesSent % 100 === 0) {
              logger.info("Backfill product attrs progress", {
                batchesSent,
                productsMatched,
                totalUpdated,
                totalErrors,
              });
            }
          } catch (err) {
            totalErrors += batch.length;
            logger.error("Backfill product attrs batch failed", {
              batchNumber: batchesSent + 1,
              batchSize: batch.length,
              error: err instanceof Error ? err.message : String(err),
            });
          }
          batch = [];
        };

        // Stream cards from Scryfall bulk data
        const bulkData = new BulkDataManager({ client: getScryfallClient() });
        const stream = input.setCode
          ? bulkData.streamSet(input.setCode.toLowerCase())
          : bulkData.streamCards();

        for await (const card of stream) {
          const saleorProductId = idMap.get(card.id);
          if (!saleorProductId) {
            productsSkipped++;
            continue;
          }

          const attributes = buildProductAttributes(card, attrMap);
          if (attributes.length === 0) continue;

          batch.push({ id: saleorProductId, input: { attributes } });
          productsMatched++;

          if (batch.length >= BATCH_SIZE) {
            await flushBatch();
          }
        }

        // Flush remaining
        await flushBatch();

        logger.info("Backfill product attrs complete", {
          setCode: input.setCode ?? "ALL",
          productsMatched,
          productsSkipped,
          batchesSent,
          totalUpdated,
          totalErrors,
        });
      };

      processInBackground().catch((err) => {
        logger.error("Backfill product attrs background job failed", {
          error: err instanceof Error ? err.message : String(err),
        });
      });

      return {
        totalProducts: idMap.size,
        attributeCount: attrMap.size,
        message: `Processing ${idMap.size} products in background (${attrMap.size} attributes). Check logs for progress.`,
      };
    }),

  /**
   * Rebuild setAudit records from importedProduct data.
   * Useful after a BULK import which doesn't create per-set audits,
   * or to reconcile audit state from existing imported products.
   */
  rebuildAudits: protectedClientProcedure
    .mutation(async ({ ctx }) => {
      // Group imported products by setCode with counts
      const setCounts = await ctx.prisma.importedProduct.groupBy({
        by: ["setCode"],
        where: {
          success: true,
          importJob: { installationId: ctx.installationId },
        },
        _count: { _all: true },
      });

      if (setCounts.length === 0) {
        return { setsCreated: 0, setsUpdated: 0, totalSets: 0, errors: [] };
      }

      // Fetch all Scryfall sets in one call for metadata lookup
      const scryfallSets = await getScryfallClient().listSets();
      const scryfallMap = new Map(scryfallSets.map((s) => [s.code, s]));

      let setsCreated = 0;
      let setsUpdated = 0;
      const errors: string[] = [];

      for (const group of setCounts) {
        try {
          const scryfall = scryfallMap.get(group.setCode);
          const setName = scryfall?.name ?? group.setCode.toUpperCase();
          const totalCards = scryfall?.card_count ?? group._count._all;
          const releasedAt = scryfall?.released_at ? new Date(scryfall.released_at) : null;
          const setType = scryfall?.set_type ?? null;
          const iconSvgUri = scryfall?.icon_svg_uri ?? null;

          const existing = await ctx.prisma.setAudit.findUnique({
            where: {
              installationId_setCode: {
                installationId: ctx.installationId,
                setCode: group.setCode,
              },
            },
          });

          await ctx.prisma.setAudit.upsert({
            where: {
              installationId_setCode: {
                installationId: ctx.installationId,
                setCode: group.setCode,
              },
            },
            update: {
              importedCards: group._count._all,
              totalCards,
              lastImportedAt: new Date(),
              setName,
              releasedAt,
              setType,
              iconSvgUri,
            },
            create: {
              installationId: ctx.installationId,
              setCode: group.setCode,
              setName,
              totalCards,
              importedCards: group._count._all,
              lastImportedAt: new Date(),
              releasedAt,
              setType,
              iconSvgUri,
            },
          });

          if (existing) {
            setsUpdated++;
          } else {
            setsCreated++;
          }
        } catch (err) {
          errors.push(`${group.setCode}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      logger.info("Rebuild audits complete", {
        setsCreated,
        setsUpdated,
        totalSets: setCounts.length,
        errorCount: errors.length,
      });

      return {
        setsCreated,
        setsUpdated,
        totalSets: setCounts.length,
        errors: errors.slice(0, 50),
      };
    }),
});

// --- System Router ---

const systemRouter = router({
	/** Check system readiness for imports */
	readiness: protectedClientProcedure.query(async ({ ctx }) => {
		const checks: Array<{
			name: string;
			status: "pass" | "fail" | "warn";
			message: string;
			detail?: string;
		}> = [];

		// Check 1: Channels
		try {
			const saleor = new SaleorImportClient(ctx.apiClient!);
			const channels = await saleor.getChannels();
			if (channels.length === 0) {
				checks.push({
					name: "channels",
					status: "fail",
					message: "No channels found",
					detail: "Create at least one channel in Saleor Dashboard → Configuration → Channels",
				});
			} else {
				checks.push({
					name: "channels",
					status: "pass",
					message: `${channels.length} channel(s) found`,
				});
			}
		} catch (err) {
			checks.push({
				name: "channels",
				status: "fail",
				message: "Failed to fetch channels",
				detail: err instanceof Error ? err.message : String(err),
			});
		}

		// Check 2: Product type "mtg-card"
		let productType: any = null;
		try {
			const saleor = new SaleorImportClient(ctx.apiClient!);
			productType = await saleor.getProductType();
			checks.push({
				name: "product-type",
				status: "pass",
				message: `Product type "${productType.slug}" found`,
			});
		} catch (err) {
			checks.push({
				name: "product-type",
				status: "fail",
				message: 'Product type "mtg-card" not found',
				detail: err instanceof Error ? err.message : "Create a product type named 'mtg-card' in Saleor Dashboard → Configuration → Product Types",
			});
		}

		// Check 3: Attributes on product type
		if (productType) {
			const existingSlugs = new Set(
				productType.productAttributes.map((a: any) => a.slug),
			);
			const missingSlugs = ATTRIBUTE_DEFS.filter((d) => !existingSlugs.has(d.slug)).map(
				(d) => d.slug,
			);
			if (missingSlugs.length === 0) {
				checks.push({
					name: "attributes",
					status: "pass",
					message: `All ${ATTRIBUTE_DEFS.length} attributes configured`,
				});
			} else {
				checks.push({
					name: "attributes",
					status: "fail",
					message: `${missingSlugs.length} attribute(s) missing`,
					detail: `Missing: ${missingSlugs.join(", ")}`,
				});
			}
		} else {
			checks.push({
				name: "attributes",
				status: "fail",
				message: "Cannot check attributes without product type",
			});
		}

		// Check 4: Category "mtg-singles"
		try {
			const saleor = new SaleorImportClient(ctx.apiClient!);
			const category = await saleor.getCategory();
			checks.push({
				name: "category",
				status: "pass",
				message: `Category "${category.slug}" found`,
			});
		} catch {
			checks.push({
				name: "category",
				status: "fail",
				message: 'Category "mtg-singles" not found',
				detail: "Create a category named 'mtg-singles' in Saleor Dashboard → Catalog → Categories",
			});
		}

		// Check 5: Warehouse
		try {
			const saleor = new SaleorImportClient(ctx.apiClient!);
			const warehouse = await saleor.getWarehouse();
			checks.push({
				name: "warehouse",
				status: "pass",
				message: `Warehouse "${warehouse.name}" found`,
			});
		} catch {
			checks.push({
				name: "warehouse",
				status: "fail",
				message: "No warehouse found",
				detail: "Create a warehouse in Saleor Dashboard → Configuration → Warehouses",
			});
		}

		const allPass = checks.every((c) => c.status !== "fail");
		return { ready: allPass, checks };
	}),

	/** Create missing attributes and assign them to the mtg-card product type */
	setupAttributes: protectedClientProcedure.mutation(async ({ ctx }) => {
		const saleor = new SaleorImportClient(ctx.apiClient!);

		// Require the product type to exist first
		let productType;
		try {
			productType = await saleor.getProductType();
		} catch {
			throw new TRPCError({
				code: "PRECONDITION_FAILED",
				message: 'Product type "mtg-card" must exist before creating attributes.',
			});
		}

		// Find missing attribute slugs
		const existingSlugs = new Set(
			productType.productAttributes.map((a) => a.slug),
		);
		const missingDefs = ATTRIBUTE_DEFS.filter((d) => !existingSlugs.has(d.slug));

		if (missingDefs.length === 0) {
			return {
				created: 0,
				assigned: 0,
				errors: [] as string[],
				message: "All attributes already exist",
			};
		}

		logger.info("Creating missing attributes", {
			count: missingDefs.length,
			slugs: missingDefs.map((d) => d.slug),
		});

		const result = await saleor.createMissingAttributes(missingDefs, productType.id);

		const message = result.errors.length > 0
			? `Created ${result.created}, assigned ${result.assigned}. Errors: ${result.errors.join("; ")}`
			: `Created ${result.created} attribute(s), assigned ${result.assigned} to product type`;

		return { ...result, message };
	}),
});

// --- Background job processing ---

async function startJobProcessing(
  jobId: string,
  prisma: PrismaClient,
  gqlClient: Client
): Promise<void> {
  try {
    // Pick next job by priority (FIFO within same priority)
    const job = await prisma.importJob.findFirst({
      where: {
        id: jobId,
        status: "PENDING",
      },
    });

    if (!job) {
      logger.warn("Job not found or already started", { jobId });
      return;
    }

    const client = getScryfallClient();
    const bulkData = new BulkDataManager({ client });
    const mtgjsonBulk = new MtgjsonBulkDataManager();

    const processor = new JobProcessor({
      scryfallClient: client,
      bulkDataManager: bulkData,
      mtgjsonBulkManager: mtgjsonBulk,
      prisma,
      gqlClient,
      batchSize: env.IMPORT_BATCH_SIZE,
      concurrency: env.IMPORT_CONCURRENCY,
      circuitBreakerThreshold: env.CIRCUIT_BREAKER_THRESHOLD,
      circuitBreakerCooldownMs: env.CIRCUIT_BREAKER_COOLDOWN_MS,
      circuitBreakerMaxRetries: env.CIRCUIT_BREAKER_MAX_RETRIES,
    });

    activeProcessors.set(jobId, processor);

    try {
      await processor.processJob(job);
    } finally {
      activeProcessors.delete(jobId);
    }
  } catch (err) {
    logger.error("Failed to start job processing", {
      jobId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

// --- Catalog Router ---

const catalogRouter = router({
  /** Get overall catalog health summary */
  summary: protectedClientProcedure.query(async ({ ctx }) => {
    const [audits, totalProducts, totalJobs, recentJobs] = await Promise.all([
      ctx.prisma.setAudit.findMany({
        where: { installationId: ctx.installationId },
      }),
      ctx.prisma.importedProduct.count({
        where: { success: true },
      }),
      ctx.prisma.importJob.count({
        where: { installationId: ctx.installationId },
      }),
      ctx.prisma.importJob.findMany({
        where: { installationId: ctx.installationId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const totalSets = audits.length;
    const totalCards = audits.reduce((sum, a) => sum + a.importedCards, 0);
    const totalExpected = audits.reduce((sum, a) => sum + a.totalCards, 0);
    const incompleteSets = audits.filter((a) => a.importedCards < a.totalCards).length;

    return {
      totalSets,
      completeSets: totalSets - incompleteSets,
      incompleteSets,
      totalCards,
      totalExpected,
      completenessPercent: totalExpected > 0 ? Math.round((totalCards / totalExpected) * 100) : 0,
      totalProducts,
      totalJobs,
      recentJobs,
    };
  }),
});

// Import PrismaClient and Client types
import type { PrismaClient } from "@/generated/prisma";
import type { Client } from "urql";

export { jobsRouter, setsRouter, systemRouter, catalogRouter };
