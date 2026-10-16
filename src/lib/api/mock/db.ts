/**
 * In-browser stand-in for the backend service, persisted to localStorage.
 * Only the API modules in `src/lib/api` may import this; swap them to HTTP
 * calls when the service is ready and delete this folder.
 */
import { createBillingSeed, createSeed, disconnectedAccountsForBrand, SEED_BRAND_ID, type MockDb } from "@/lib/api/mock/seed"
import { ApiError } from "@/lib/api/errors"
import { applyDueChanges } from "@/lib/api/mock/lifecycle"
import { defaultBrandAllowance, type PlanId } from "@/config/pricing"

const STORAGE_KEY = "gometric:mock-db:v4"
const LATENCY_MS = 250

let db: MockDb | null = null

type LegacyWorkspace = MockDb["workspace"] & {
  brand?: { name: string; handle: string; website: string; industry: string; timezone: string }
  brands?: MockDb["workspace"]["brands"]
  activeBrandId?: string
}

function mapLegacyPlanId(id: string): PlanId {
  if (id === "pro") return "starter"
  if (id === "business") return "advanced"
  if (id === "free" || id === "starter" || id === "advanced") return id
  return "free"
}

/** Fills / migrates fields so older localStorage shapes keep working. */
function normalize(value: MockDb): MockDb {
  const ws = value.workspace as LegacyWorkspace
  if (!ws.brands) {
    const legacy = ws.brand
    if (legacy?.name) {
      const id = SEED_BRAND_ID
      ws.brands = [{ id, ...legacy }]
      ws.activeBrandId = id
      for (const a of value.accounts) {
        if (!a.brandId) a.brandId = id
      }
      for (const p of value.posts) {
        if (!p.brandId) p.brandId = id
      }
      for (const c of value.conversations) {
        if (!c.brandId) c.brandId = id
      }
    } else {
      ws.brands = []
      ws.activeBrandId = ""
    }
    delete ws.brand
  }
  if (ws.activeBrandId === undefined) {
    ws.activeBrandId = ws.brands[0]?.id ?? ""
  }

  if (!value.billing) {
    value.billing = createBillingSeed(new Date())
  } else {
    const sub = value.billing.subscription as {
      planId: string
      brandAllowance?: number
      scheduledChange: { planId: PlanId; brandAllowance?: number } | null
    }
    sub.planId = mapLegacyPlanId(sub.planId)
    // Brand allowance is fixed by the plan, so older saved custom tiers snap to it.
    sub.brandAllowance = defaultBrandAllowance(sub.planId as PlanId)
    if (sub.scheduledChange) {
      sub.scheduledChange.brandAllowance = defaultBrandAllowance(sub.scheduledChange.planId)
    }
  }

  // Networks added after this data was saved show up as available to connect.
  for (const brand of ws.brands) {
    for (const placeholder of disconnectedAccountsForBrand(brand.id)) {
      const exists = value.accounts.some((a) => a.brandId === brand.id && a.network === placeholder.network)
      if (!exists) value.accounts.push(placeholder)
    }
  }

  return value
}

function load(): MockDb {
  if (db) return db
  if (typeof window === "undefined") {
    throw new ApiError("The mock API only runs in the browser.", 500)
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    db = createSeed(new Date())
    persist(db)
    return db
  }
  db = normalize(JSON.parse(raw) as MockDb)
  persist(db)
  return db
}

function persist(value: MockDb) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    throw new ApiError("Browser storage is full. Remove some media and try again.", 507)
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Simulates a GET: resolves a deep copy so callers can't mutate the store. */
export async function read<T>(select: (db: MockDb) => T): Promise<T> {
  await sleep(LATENCY_MS)
  return structuredClone(select(loadCurrent()))
}

/** Loads the store and settles any cancellation / downgrade whose period has ended. */
function loadCurrent(): MockDb {
  const current = load()
  if (applyDueChanges(current)) persist(current)
  return current
}

/** Simulates a write: applies the change, persists, and returns a copy of the result. */
export async function write<T>(apply: (db: MockDb) => T): Promise<T> {
  await sleep(LATENCY_MS)
  const current = loadCurrent()
  const snapshot = structuredClone(current)
  try {
    const result = apply(current)
    persist(current)
    return structuredClone(result)
  } catch (error) {
    db = snapshot
    throw error
  }
}

export const newId = () => crypto.randomUUID()
export const nowIso = () => new Date().toISOString()

/** Wipe persisted mock data and reseed. Used by Settings → Danger zone. */
export async function resetDemoData(): Promise<MockDb> {
  await sleep(LATENCY_MS)
  if (typeof window === "undefined") {
    throw new ApiError("The mock API only runs in the browser.", 500)
  }
  db = createSeed(new Date())
  persist(db)
  return structuredClone(db)
}

/** Throws when the brand is locked by the current plan. Call before any write to brand data. */
export function assertBrandUnlocked(database: MockDb, brandId: string) {
  const brand = database.workspace.brands.find((b) => b.id === brandId)
  if (brand?.locked) {
    throw new ApiError(`${brand.name} is locked on your current plan. Upgrade to edit it.`, 403)
  }
}

/** Returns the active brand's id for a write; pass `allowLocked` for read-only lookups. */
export function requireActiveBrandId(database: MockDb, { allowLocked = false } = {}) {
  const id = database.workspace.activeBrandId
  if (!id || !database.workspace.brands.some((b) => b.id === id)) {
    throw new ApiError("Create a brand first.", 409)
  }
  if (!allowLocked) assertBrandUnlocked(database, id)
  return id
}
