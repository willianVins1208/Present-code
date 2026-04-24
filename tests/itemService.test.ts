import { createTestServices } from "./helpers/createTestServices";

describe("ItemService", () => {
  test("creates a detailed item with related category and supplier", () => {
    const { itemService, categoryService, supplierService } =
      createTestServices("item-service");
    const category = categoryService.create({
      name: "Computers",
      description: "Portable devices",
    });
    const supplier = supplierService.create({
      name: "Northwind",
      contactEmail: "support@northwind.test",
      phone: "1111",
    });

    const item = itemService.create({
      name: "Keyboard",
      description: "Mechanical keyboard",
      price: 299,
      categoryId: category.id,
      supplierId: supplier.id,
    });

    expect(item).toMatchObject({
      id: 1,
      name: "Keyboard",
      categoryId: category.id,
      supplierId: supplier.id,
      category: {
        id: category.id,
        name: "Computers",
      },
      supplier: {
        id: supplier.id,
        name: "Northwind",
      },
      inventory: null,
    });
  });

  test("deletes linked inventory when an item is removed", () => {
    const { itemService, inventoryService } = createTestServices("item-delete");
    const item = itemService.create({
      name: "Monitor",
      description: "27 inch monitor",
      price: 899,
    });

    inventoryService.upsertForItem(item.id, {
      quantity: 5,
      warehouseLocation: "B1",
      reorderLevel: 1,
    });

    expect(itemService.delete(item.id)).toBe(true);
    expect(inventoryService.getByItemId(item.id)).toBeNull();
  });

  test("throws when related category does not exist", () => {
    const { itemService } = createTestServices("item-validation");

    expect(() =>
      itemService.create({
        name: "Speaker",
        description: "Portable speaker",
        price: 120,
        categoryId: 99,
      })
    ).toThrow("categoryId must reference an existing category");
  });
});
