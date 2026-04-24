import path from "path";
import { InventoryPayload, InventoryRecord } from "../types/models";
import { createValidationError } from "../utils/errors";
import { JsonFileStore } from "../utils/jsonFileStore";

interface InventoryServiceOptions {
  filePath?: string;
}

export class InventoryService {
  private readonly store: JsonFileStore<InventoryRecord>;

  constructor({ filePath }: InventoryServiceOptions = {}) {
    this.store = new JsonFileStore<InventoryRecord>(
      filePath || path.join(__dirname, "..", "..", "data", "inventories.json")
    );
  }

  list(): InventoryRecord[] {
    return this.store.readAll();
  }

  getById(id: number): InventoryRecord | null {
    return this.list().find((inventory) => inventory.id === id) || null;
  }

  getByItemId(itemId: number): InventoryRecord | null {
    return this.list().find((inventory) => inventory.itemId === itemId) || null;
  }

  upsertForItem(itemId: number, payload: InventoryPayload): InventoryRecord {
    const data = normalizeInventoryPayload(payload);
    const inventories = this.list();
    const existing = inventories.find((entry) => entry.itemId === itemId);

    if (existing) {
      existing.quantity = data.quantity;
      existing.warehouseLocation = data.warehouseLocation;
      existing.reorderLevel = data.reorderLevel;
      this.store.writeAll(inventories);
      return existing;
    }

    const inventory: InventoryRecord = {
      id: this.store.nextId(inventories),
      itemId,
      quantity: data.quantity,
      warehouseLocation: data.warehouseLocation,
      reorderLevel: data.reorderLevel,
    };

    inventories.push(inventory);
    this.store.writeAll(inventories);
    return inventory;
  }

  deleteByItemId(itemId: number): boolean {
    const inventories = this.list();
    const nextInventories = inventories.filter(
      (inventory) => inventory.itemId !== itemId
    );

    if (nextInventories.length === inventories.length) {
      return false;
    }

    this.store.writeAll(nextInventories);
    return true;
  }

  reset(): void {
    this.store.reset();
  }
}

function normalizeInventoryPayload(
  payload: InventoryPayload
): Omit<InventoryRecord, "id" | "itemId"> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw createValidationError("payload must be a JSON object");
  }

  const quantity = Number(payload.quantity ?? 0);
  const reorderLevel = Number(payload.reorderLevel ?? 0);
  const warehouseLocation =
    typeof payload.warehouseLocation === "string"
      ? payload.warehouseLocation.trim()
      : "";

  if (!Number.isInteger(quantity) || quantity < 0) {
    throw createValidationError("inventory quantity must be an integer greater than or equal to 0");
  }

  if (!Number.isInteger(reorderLevel) || reorderLevel < 0) {
    throw createValidationError("inventory reorderLevel must be an integer greater than or equal to 0");
  }

  return {
    quantity,
    warehouseLocation,
    reorderLevel,
  };
}
