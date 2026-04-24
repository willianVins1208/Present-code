import fs from "fs";
import os from "os";
import path from "path";
import { CategoryService } from "../../src/services/categoryService";
import { InventoryService } from "../../src/services/inventoryService";
import { ItemService } from "../../src/services/itemService";
import { SupplierService } from "../../src/services/supplierService";

export function createTestServices(prefix: string) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
  const categoryService = new CategoryService({
    filePath: path.join(rootDir, "categories.json"),
  });
  const supplierService = new SupplierService({
    filePath: path.join(rootDir, "suppliers.json"),
  });
  const inventoryService = new InventoryService({
    filePath: path.join(rootDir, "inventories.json"),
  });
  const itemService = new ItemService({
    filePath: path.join(rootDir, "items.json"),
    categoryService,
    supplierService,
    inventoryService,
  });

  return {
    rootDir,
    categoryService,
    supplierService,
    inventoryService,
    itemService,
  };
}
