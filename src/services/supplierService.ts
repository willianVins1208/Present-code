import path from "path";
import { Supplier, SupplierPayload } from "../types/models";
import { createValidationError } from "../utils/errors";
import { JsonFileStore } from "../utils/jsonFileStore";

interface SupplierServiceOptions {
  filePath?: string;
}

export class SupplierService {
  private readonly store: JsonFileStore<Supplier>;

  constructor({ filePath }: SupplierServiceOptions = {}) {
    this.store = new JsonFileStore<Supplier>(
      filePath || path.join(__dirname, "..", "..", "data", "suppliers.json")
    );
  }

  list(): Supplier[] {
    return this.store.readAll();
  }

  getById(id: number): Supplier | null {
    return this.list().find((supplier) => supplier.id === id) || null;
  }

  create(payload: SupplierPayload): Supplier {
    const data = normalizeSupplierPayload(payload);
    const suppliers = this.list();
    const supplier: Supplier = {
      id: this.store.nextId(suppliers),
      name: data.name,
      contactEmail: data.contactEmail,
      phone: data.phone,
    };

    suppliers.push(supplier);
    this.store.writeAll(suppliers);
    return supplier;
  }

  update(id: number, payload: SupplierPayload): Supplier | null {
    const suppliers = this.list();
    const supplier = suppliers.find((entry) => entry.id === id);
    if (!supplier) {
      return null;
    }

    const data = normalizeSupplierPayload(payload);
    supplier.name = data.name;
    supplier.contactEmail = data.contactEmail;
    supplier.phone = data.phone;

    this.store.writeAll(suppliers);
    return supplier;
  }

  delete(id: number): boolean {
    const suppliers = this.list();
    const nextSuppliers = suppliers.filter((supplier) => supplier.id !== id);
    if (nextSuppliers.length === suppliers.length) {
      return false;
    }

    this.store.writeAll(nextSuppliers);
    return true;
  }

  reset(): void {
    this.store.reset();
  }
}

function normalizeSupplierPayload(payload: SupplierPayload): Omit<Supplier, "id"> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw createValidationError("payload must be a JSON object");
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const contactEmail =
    typeof payload.contactEmail === "string" ? payload.contactEmail.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";

  if (!name) {
    throw createValidationError("supplier name is required");
  }

  if (contactEmail && !contactEmail.includes("@")) {
    throw createValidationError("supplier contactEmail must be a valid email");
  }

  return {
    name,
    contactEmail,
    phone,
  };
}
