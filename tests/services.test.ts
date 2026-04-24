import fs from "fs";
import path from "path";
import { createTestServices } from "./helpers/createTestServices";

describe("related services", () => {
  test("creates categories and suppliers in dedicated json files", () => {
    const { rootDir, categoryService, supplierService } =
      createTestServices("catalog-services");

    const category = categoryService.create({
      name: "Accessories",
      description: "Peripherals and small devices",
    });
    const supplier = supplierService.create({
      name: "Acme Supply",
      contactEmail: "sales@acme.test",
      phone: "+65-1234-5678",
    });

    expect(category.id).toBe(1);
    expect(supplier.id).toBe(1);
    expect(
      JSON.parse(
        fs.readFileSync(path.join(rootDir, "categories.json"), "utf-8")
      )
    ).toHaveLength(1);
    expect(
      JSON.parse(
        fs.readFileSync(path.join(rootDir, "suppliers.json"), "utf-8")
      )
    ).toHaveLength(1);
  });

  test("upserts inventory for an item", () => {
    const { inventoryService } = createTestServices("inventory-service");

    const created = inventoryService.upsertForItem(3, {
      quantity: 10,
      warehouseLocation: "A1",
      reorderLevel: 2,
    });
    const updated = inventoryService.upsertForItem(3, {
      quantity: 15,
      warehouseLocation: "A2",
      reorderLevel: 4,
    });

    expect(created.id).toBe(1);
    expect(updated).toEqual({
      id: 1,
      itemId: 3,
      quantity: 15,
      warehouseLocation: "A2",
      reorderLevel: 4,
    });
    expect(inventoryService.list()).toHaveLength(1);
  });
});
