const fs = require("fs");
const os = require("os");
const path = require("path");
const { ItemService } = require("../src/services/itemService");

describe("ItemService", () => {
  let itemService;
  let filePath;

  beforeEach(() => {
    filePath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), "item-service-")),
      "items.json"
    );
    itemService = new ItemService({ filePath });
  });

  test("creates an item", () => {
    const item = itemService.create({
      name: "Keyboard",
      description: "Mechanical keyboard",
      price: 299,
    });

    expect(item).toEqual({
      id: 1,
      name: "Keyboard",
      description: "Mechanical keyboard",
      price: 299,
    });
    expect(itemService.list()).toHaveLength(1);
    expect(JSON.parse(fs.readFileSync(filePath, "utf-8"))).toHaveLength(1);
  });

  test("updates an existing item", () => {
    const item = itemService.create({
      name: "Mouse",
      description: "Gaming mouse",
      price: 149,
    });

    const updated = itemService.update(item.id, {
      name: "Mouse Pro",
      description: "Wireless gaming mouse",
      price: 199,
    });

    expect(updated).toEqual({
      id: 1,
      name: "Mouse Pro",
      description: "Wireless gaming mouse",
      price: 199,
    });
  });

  test("deletes an item", () => {
    const item = itemService.create({
      name: "Monitor",
      description: "27 inch monitor",
      price: 899,
    });

    expect(itemService.delete(item.id)).toBe(true);
    expect(itemService.list()).toEqual([]);
  });

  test("throws when name is missing", () => {
    expect(() =>
      itemService.create({
        name: "",
        price: 10,
      })
    ).toThrow("name is required");
  });

  test("throws when price is invalid", () => {
    expect(() =>
      itemService.create({
        name: "Speaker",
        price: -1,
      })
    ).toThrow("price must be a number greater than or equal to 0");
  });

  test("loads existing items from json file", () => {
    fs.writeFileSync(
      filePath,
      JSON.stringify([
        {
          id: 5,
          name: "Tablet",
          description: "10 inch tablet",
          price: 1200,
        },
      ])
    );

    const persistedService = new ItemService({ filePath });
    expect(persistedService.list()).toEqual([
      {
        id: 5,
        name: "Tablet",
        description: "10 inch tablet",
        price: 1200,
      },
    ]);
  });
});
