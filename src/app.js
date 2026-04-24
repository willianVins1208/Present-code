const express = require("express");
const { ItemService } = require("./services/itemService");

function createApp({ itemService = new ItemService() } = {}) {
  const app = express();

  app.use(express.json());

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/api/items", (req, res) => {
    res.status(200).json(itemService.list());
  });

  app.get("/api/items/:id", (req, res) => {
    const id = Number(req.params.id);
    const item = itemService.getById(id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json(item);
  });

  app.post("/api/items", (req, res, next) => {
    try {
      const item = itemService.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/items/:id", (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const item = itemService.update(id, req.body);

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      return res.status(200).json(item);
    } catch (error) {
      return next(error);
    }
  });

  app.delete("/api/items/:id", (req, res) => {
    const id = Number(req.params.id);
    const deleted = itemService.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(204).send();
  });

  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500 ? "Internal server error" : error.message;

    res.status(statusCode).json({ message });
  });

  return app;
}

module.exports = {
  createApp,
};
