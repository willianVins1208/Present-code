import request from "supertest";
import { createApp } from "../src/app";
import { createTestServices } from "./helpers/createTestServices";

describe("Item API", () => {
  test("runs a relational CRUD flow across category, supplier, item, and inventory", async () => {
    const services = createTestServices("item-api");
    const app = createApp(services);

    const categoryResponse = await request(app).post("/api/categories").send({
      name: "Laptops",
      description: "Portable computers",
    });
    expect(categoryResponse.statusCode).toBe(201);

    const supplierResponse = await request(app).post("/api/suppliers").send({
      name: "Tech Source",
      contactEmail: "ops@techsource.test",
      phone: "8000",
    });
    expect(supplierResponse.statusCode).toBe(201);

    const createItemResponse = await request(app).post("/api/items").send({
      name: "Laptop",
      description: "14 inch business laptop",
      price: 4999,
      categoryId: categoryResponse.body.id,
      supplierId: supplierResponse.body.id,
    });
    expect(createItemResponse.statusCode).toBe(201);
    expect(createItemResponse.body.category.name).toBe("Laptops");
    expect(createItemResponse.body.supplier.name).toBe("Tech Source");

    const inventoryResponse = await request(app)
      .put(`/api/items/${createItemResponse.body.id}/inventory`)
      .send({
        quantity: 12,
        warehouseLocation: "WH-01",
        reorderLevel: 3,
      });
    expect(inventoryResponse.statusCode).toBe(200);
    expect(inventoryResponse.body.quantity).toBe(12);

    const listResponse = await request(app).get("/api/items");
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].inventory.quantity).toBe(12);

    const conflictResponse = await request(app).delete(
      `/api/categories/${categoryResponse.body.id}`
    );
    expect(conflictResponse.statusCode).toBe(409);
    expect(conflictResponse.body).toEqual({
      message: "Category cannot be deleted while items reference it",
    });

    const deleteItemResponse = await request(app).delete(
      `/api/items/${createItemResponse.body.id}`
    );
    expect(deleteItemResponse.statusCode).toBe(204);

    const missingInventoryResponse = await request(app).get(
      `/api/items/${createItemResponse.body.id}/inventory`
    );
    expect(missingInventoryResponse.statusCode).toBe(404);
  });

  test("returns 400 when item references a missing supplier", async () => {
    const services = createTestServices("item-api-validation");
    const app = createApp(services);

    const response = await request(app).post("/api/items").send({
      name: "Phone",
      description: "Flagship phone",
      price: 2000,
      supplierId: 123,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "supplierId must reference an existing supplier",
    });
  });
});
