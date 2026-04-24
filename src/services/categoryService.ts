import path from "path";
import { Category, CategoryPayload } from "../types/models";
import { createValidationError } from "../utils/errors";
import { JsonFileStore } from "../utils/jsonFileStore";

interface CategoryServiceOptions {
  filePath?: string;
}

export class CategoryService {
  private readonly store: JsonFileStore<Category>;

  constructor({ filePath }: CategoryServiceOptions = {}) {
    this.store = new JsonFileStore<Category>(
      filePath || path.join(__dirname, "..", "..", "data", "categories.json")
    );
  }

  list(): Category[] {
    return this.store.readAll();
  }

  getById(id: number): Category | null {
    return this.list().find((category) => category.id === id) || null;
  }

  create(payload: CategoryPayload): Category {
    const data = normalizeCategoryPayload(payload);
    const categories = this.list();
    const category: Category = {
      id: this.store.nextId(categories),
      name: data.name,
      description: data.description,
    };

    categories.push(category);
    this.store.writeAll(categories);
    return category;
  }

  update(id: number, payload: CategoryPayload): Category | null {
    const categories = this.list();
    const category = categories.find((entry) => entry.id === id);
    if (!category) {
      return null;
    }

    const data = normalizeCategoryPayload(payload);
    category.name = data.name;
    category.description = data.description;

    this.store.writeAll(categories);
    return category;
  }

  delete(id: number): boolean {
    const categories = this.list();
    const nextCategories = categories.filter((category) => category.id !== id);
    if (nextCategories.length === categories.length) {
      return false;
    }

    this.store.writeAll(nextCategories);
    return true;
  }

  reset(): void {
    this.store.reset();
  }
}

function normalizeCategoryPayload(payload: CategoryPayload): Omit<Category, "id"> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw createValidationError("payload must be a JSON object");
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const description =
    typeof payload.description === "string" ? payload.description.trim() : "";

  if (!name) {
    throw createValidationError("category name is required");
  }

  return {
    name,
    description,
  };
}
