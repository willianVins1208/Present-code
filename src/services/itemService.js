const fs = require("fs");
const path = require("path");

class ItemService {
  constructor({ filePath } = {}) {
    this.filePath =
      filePath || path.join(__dirname, "..", "..", "data", "items.json");
    this.ensureStorage();
  }

  list() {
    return this.readItems();
  }

  getById(id) {
    const items = this.readItems();
    return items.find((item) => item.id === id) || null;
  }

  create(payload) {
    const data = validateCreatePayload(payload);
    const items = this.readItems();
    const item = {
      id: getNextId(items),
      name: data.name,
      description: data.description,
      price: data.price,
    };

    items.push(item);
    this.writeItems(items);
    return item;
  }

  update(id, payload) {
    const items = this.readItems();
    const item = items.find((entry) => entry.id === id);
    if (!item) {
      return null;
    }

    const data = validateUpdatePayload(payload);
    item.name = data.name;
    item.description = data.description;
    item.price = data.price;

    this.writeItems(items);
    return item;
  }

  delete(id) {
    const items = this.readItems();
    const nextItems = items.filter((item) => item.id !== id);

    if (nextItems.length === items.length) {
      return false;
    }

    this.writeItems(nextItems);
    return true;
  }

  reset() {
    this.writeItems([]);
  }

  ensureStorage() {
    const directory = path.dirname(this.filePath);
    fs.mkdirSync(directory, { recursive: true });

    if (!fs.existsSync(this.filePath)) {
      this.writeItems([]);
    }
  }

  readItems() {
    this.ensureStorage();

    try {
      const content = fs.readFileSync(this.filePath, "utf-8");
      const items = JSON.parse(content);

      if (!Array.isArray(items)) {
        throw new Error("items storage must contain an array");
      }

      return items;
    } catch (error) {
      throw createStorageError(error.message);
    }
  }

  writeItems(items) {
    fs.writeFileSync(this.filePath, JSON.stringify(items, null, 2));
  }
}

function validateCreatePayload(payload) {
  const data = normalizePayload(payload);

  if (!data.name) {
    throw createValidationError("name is required");
  }

  return data;
}

function validateUpdatePayload(payload) {
  const data = normalizePayload(payload);

  if (!data.name) {
    throw createValidationError("name is required");
  }

  return data;
}

function normalizePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw createValidationError("payload must be a JSON object");
  }

  const name =
    typeof payload.name === "string" ? payload.name.trim() : "";
  const description =
    typeof payload.description === "string" ? payload.description.trim() : "";
  const rawPrice =
    payload.price === undefined || payload.price === null ? 0 : payload.price;
  const price = Number(rawPrice);

  if (!Number.isFinite(price) || price < 0) {
    throw createValidationError("price must be a number greater than or equal to 0");
  }

  return {
    name,
    description,
    price,
  };
}

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function createStorageError(message) {
  const error = new Error(`storage error: ${message}`);
  error.statusCode = 500;
  return error;
}

function getNextId(items) {
  return items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
}

module.exports = {
  ItemService,
};
