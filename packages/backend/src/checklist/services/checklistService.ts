import { PrismaClient, ChecklistStatus, CheckStatus } from "@prisma/client";
import {
  getCheckDefinition,
  getAllCheckTypes,
  getSections,
  type CheckDefinition,
} from "../../checks/registry.js";

const prisma = new PrismaClient();

function serializeBigInt(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "bigint") {
      result[key] = Number(value);
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      result[key] = serializeBigInt(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function serializeChecklist(checklist: Record<string, unknown>) {
  return serializeBigInt(checklist);
}

export async function createChecklist(
  storeId: bigint,
  name: string,
  checkTypes: string[]
) {
  const validTypes = checkTypes.filter((ct) => getCheckDefinition(ct));

  if (validTypes.length === 0) {
    throw new Error("No valid check types provided");
  }

  const checklist = await prisma.checklist.create({
    data: {
      storeId,
      name,
      status: ChecklistStatus.in_progress,
      checks: {
        create: validTypes.map((checkType) => ({
          storeId,
          checkType,
          status: CheckStatus.pending,
        })),
      },
    },
    include: { checks: true },
  });

  return serializeChecklist(checklist as unknown as Record<string, unknown>);
}

export async function listChecklists(storeId: bigint, search?: string) {
  const where: Record<string, unknown> = { storeId };

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const checklists = await prisma.checklist.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      checks: {
        select: { status: true },
      },
    },
  });

  return checklists.map((cl) => {
    const taskCount = cl.checks.length;
    const statusCounts = cl.checks.reduce(
      (acc, ch) => {
        acc[ch.status] = (acc[ch.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      ...serializeChecklist(cl as unknown as Record<string, unknown>),
      taskCount,
      statusCounts,
    };
  });
}

export async function getChecklist(storeId: bigint, checklistId: string) {
  const checklist = await prisma.checklist.findFirst({
    where: { id: checklistId, storeId },
    include: {
      checks: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!checklist) return null;

  const sections = getSections();
  const checksMap = new Map(
    checklist.checks.map((ch) => [ch.checkType, ch])
  );

  const groupedSections = sections
    .map((section) => ({
      ...section,
      subcategories: section.subcategories
        .map((sub) => ({
          ...sub,
          checks: sub.checks
            .map((checkType) => {
              const dbCheck = checksMap.get(checkType);
              if (!dbCheck) return null;
              const def = getCheckDefinition(checkType);
              return {
                id: dbCheck.id,
                checkType,
                displayName: def?.display_name ?? checkType,
                description: def?.description ?? "",
                status: dbCheck.status,
                updatedAt: dbCheck.updatedAt,
              };
            })
            .filter(Boolean),
        }))
        .filter((sub) => sub.checks.length > 0),
    }))
    .filter((section) => section.subcategories.length > 0);

  return {
    ...serializeChecklist(checklist as unknown as Record<string, unknown>),
    sections: groupedSections,
  };
}

export async function updateChecklist(
  storeId: bigint,
  checklistId: string,
  data: { name?: string }
) {
  const existing = await prisma.checklist.findFirst({
    where: { id: checklistId, storeId },
  });

  if (!existing) return null;

  const updated = await prisma.checklist.update({
    where: { id: checklistId },
    data: { name: data.name },
  });

  return serializeChecklist(updated as unknown as Record<string, unknown>);
}

export async function deleteChecklist(storeId: bigint, checklistId: string) {
  const existing = await prisma.checklist.findFirst({
    where: { id: checklistId, storeId },
  });

  if (!existing) return false;

  await prisma.checklist.delete({ where: { id: checklistId } });
  return true;
}

export async function updateCheckStatus(
  storeId: bigint,
  checklistId: string,
  checkId: string,
  status: CheckStatus
) {
  const check = await prisma.checklistCheck.findFirst({
    where: { id: checkId, checklistId, storeId },
  });

  if (!check) return null;

  const updated = await prisma.checklistCheck.update({
    where: { id: checkId },
    data: { status },
  });

  const allChecks = await prisma.checklistCheck.findMany({
    where: { checklistId },
    select: { status: true },
  });

  const allDone = allChecks.every((c) => c.status !== CheckStatus.pending);
  if (allDone) {
    await prisma.checklist.update({
      where: { id: checklistId },
      data: { status: ChecklistStatus.complete },
    });
  }

  return serializeChecklist(updated as unknown as Record<string, unknown>);
}

export async function getCheckDetail(
  storeId: bigint,
  checklistId: string,
  checkId: string
) {
  const check = await prisma.checklistCheck.findFirst({
    where: { id: checkId, checklistId, storeId },
  });

  if (!check) return null;

  const def = getCheckDefinition(check.checkType);
  if (!def) return null;

  return {
    ...serializeChecklist(check as unknown as Record<string, unknown>),
    displayName: def.display_name,
    description: def.description,
    assessment: def.default_assessment,
    detailedFindings: check.detailedFindings ?? null,
    businessImpact: def.business_impact,
    recommendations: def.recommendations,
    usefulLinks: def.useful_links,
  };
}

export function getRegistrySections() {
  return getSections();
}

export function getRegistryAllDefinitions() {
  const defs = getAllCheckTypes().map((ct) => getCheckDefinition(ct)!);
  return getSections().map((section) => ({
    ...section,
    subcategories: section.subcategories.map((sub) => ({
      ...sub,
      checks: sub.checks.map((ct) => {
        const def = getCheckDefinition(ct)!;
        return {
          checkType: def.check_type,
          displayName: def.display_name,
          description: def.description,
        };
      }),
    })),
  }));
}
