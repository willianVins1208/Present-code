import path from "path";
import { Item, ItemDetails, ItemPayload } from "../types/models";
import { createValidationError } from "../utils/errors";
import { JsonFileStore } from "../utils/jsonFileStore";
import { CategoryService } from "./categoryService";
import { InventoryService } from "./inventoryService";
import { SupplierService } from "./supplierService";

interface ItemServiceOptions {
  filePath?: string;
  categoryService: CategoryService;
  supplierService: SupplierService;
  inventoryService: InventoryService;
}

export class ItemService {
  private readonly store: JsonFileStore<Item>;
  private readonly categoryService: CategoryService;
  private readonly supplierService: SupplierService;
  private readonly inventoryService: InventoryService;

  constructor({
    filePath,
    categoryService,
    supplierService,
    inventoryService,
  }: ItemServiceOptions) {
    this.store = new JsonFileStore<Item>(
      filePath || path.join(__dirname, "..", "..", "data", "items.json")
    );
    this.categoryService = categoryService;
    this.supplierService = supplierService;
    this.inventoryService = inventoryService;
  }

  list(): Item[] {
    return this.store.readAll();
  }

  listDetailed(): ItemDetails[] {
    return this.list().map((item) => this.toDetails(item));
  }

  getById(id: number): Item | null {
    return this.list().find((item) => item.id === id) || null;
  }

  getDetailedById(id: number): ItemDetails | null {
    const item = this.getById(id);
    return item ? this.toDetails(item) : null;
  }

  create(payload: ItemPayload): ItemDetails {
    const data = this.normalizePayload(payload);
    const items = this.list();
    const item: Item = {
      id: this.store.nextId(items),
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      supplierId: data.supplierId,
    };

    items.push(item);
    this.store.writeAll(items);
    return this.toDetails(item);
  }

  update(id: number, payload: ItemPayload): ItemDetails | null {
    const items = this.list();
    const item = items.find((entry) => entry.id === id);
    if (!item) {
      return null;
    }

    const data = this.normalizePayload(payload);
    item.name = data.name;
    item.description = data.description;
    item.price = data.price;
    item.categoryId = data.categoryId;
    item.supplierId = data.supplierId;

    this.store.writeAll(items);
    return this.toDetails(item);
  }

  delete(id: number): boolean {
    const items = this.list();
    const nextItems = items.filter((item) => item.id !== id);

    if (nextItems.length === items.length) {
      return false;
    }

    this.store.writeAll(nextItems);
    this.inventoryService.deleteByItemId(id);
    return true;
  }

  reset(): void {
    this.store.reset();
  }

  private normalizePayload(payload: ItemPayload): Omit<Item, "id"> {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw createValidationError("payload must be a JSON object");
    }

    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const description =
      typeof payload.description === "string" ? payload.description.trim() : "";
    const price = Number(payload.price ?? 0);
    const categoryId = normalizeRelationId(payload.categoryId);
    const supplierId = normalizeRelationId(payload.supplierId);

    if (!name) {
      throw createValidationError("name is required");
    }

    if (!Number.isFinite(price) || price < 0) {
      throw createValidationError("price must be a number greater than or equal to 0");
    }

    if (categoryId !== null && !this.categoryService.getById(categoryId)) {
      throw createValidationError("categoryId must reference an existing category");
    }

    if (supplierId !== null && !this.supplierService.getById(supplierId)) {
      throw createValidationError("supplierId must reference an existing supplier");
    }

    return {
      name,
      description,
      price,
      categoryId,
      supplierId,
    };
  }

  private toDetails(item: Item): ItemDetails {
    return {
      ...item,
      category:
        item.categoryId === null
          ? null
          : this.categoryService.getById(item.categoryId),
      supplier:
        item.supplierId === null
          ? null
          : this.supplierService.getById(item.supplierId),
      inventory: this.inventoryService.getByItemId(item.id),
    };
  }
}

function normalizeRelationId(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw createValidationError("related id values must be positive integers");
  }

  return id;
}
