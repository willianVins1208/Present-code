const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");
const { createApp } = require("../src/app");
const { ItemService } = require("../src/services/itemService");

describe("Item API", () => {
  let app;
  let filePath;

  beforeEach(() => {
    filePath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), "item-api-")),
      "items.json"
    );
    app = createApp({ itemService: new ItemService({ filePath }) });
  });

  test("runs full CRUD flow", async () => {
    const createResponse = await request(app).post("/api/items").send({
      name: "Laptop",
      description: "14 inch business laptop",
      price: 4999,
    });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body).toMatchObject({
      id: 1,
      name: "Laptop",
      description: "14 inch business laptop",
      price: 4999,
    });

    const listResponse = await request(app).get("/api/items");
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(JSON.parse(fs.readFileSync(filePath, "utf-8"))).toHaveLength(1);

    const getResponse = await request(app).get("/api/items/1");
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body.name).toBe("Laptop");

    const updateResponse = await request(app).put("/api/items/1").send({
      name: "Laptop Pro",
      description: "14 inch upgraded laptop",
      price: 5999,
    });
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.name).toBe("Laptop Pro");

    const deleteResponse = await request(app).delete("/api/items/1");
    expect(deleteResponse.statusCode).toBe(204);

    const missingResponse = await request(app).get("/api/items/1");
    expect(missingResponse.statusCode).toBe(404);
    expect(missingResponse.body).toEqual({ message: "Item not found" });
  });

  test("returns 400 for invalid item payload", async () => {
    const response = await request(app).post("/api/items").send({
      name: "",
      price: 10,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "name is required",
    });
  });

  test("returns 400 for invalid price", async () => {
    const response = await request(app).post("/api/items").send({
      name: "Phone",
      price: -10,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "price must be a number greater than or equal to 0",
    });
  });

  test("reads seeded data from json file", async () => {
    fs.writeFileSync(
      filePath,
      JSON.stringify([
        {
          id: 1,
          name: "Camera",
          description: "Mirrorless camera",
          price: 3200,
        },
      ])
    );

    app = createApp({ itemService: new ItemService({ filePath }) });

    const response = await request(app).get("/api/items");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      {
        id: 1,
        name: "Camera",
        description: "Mirrorless camera",
        price: 3200,
      },
    ]);
  });
});
