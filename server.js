const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

const storePath = path.join(__dirname, "store.json");
let store = require(storePath);

// Helpers
const saveStore = () => {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf-8");
};

const getNextId = (items) => {
  return items.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
};

app.use(express.json());

// Generic GET all for a given store
app.get("/:type", (req, res) => {
  const { type } = req.params;
  const data = store[type];
  if (!data) return res.status(404).json({ error: "Store not found" });

  res.json(data.filter((item) => !item.is_deleted));
});

// Generic GET by ID (increments get_count)
app.get("/:type/:id", (req, res) => {
  const { type, id } = req.params;
  const data = store[type];
  if (!data) return res.status(404).json({ error: "Store not found" });

  const item = data.find((i) => String(i.id) === id);
  if (!item || item.is_deleted) return res.status(404).json({ error: "Item not found" });

  item.get_count = (item.get_count || 0) + 1;
  item.last_get_date = new Date().toISOString();
  saveStore();
  res.json(item);
});

// Generic POST
app.post("/:type", (req, res) => {
  const { type } = req.params;
  const body = req.body;

  if (!store[type]) store[type] = [];

  if (!body.first || !body.last) {
    return res.status(400).json({ error: "Missing first or last name" });
  }

  const newItem = {
    id: getNextId(store[type]),
    first: body.first,
    last: body.last,
    is_deleted: false,
    is_patched: false,
    get_count: 0,
    last_get_date: null,
    last_patch_date: null,
    last_deleted_date: null,
  };

  store[type].push(newItem);
  saveStore();
  res.status(201).json(newItem);
});

// Generic PATCH
app.patch("/:type/:id", (req, res) => {
  const { type, id } = req.params;
  const updates = req.body;
  const data = store[type];
  if (!data) return res.status(404).json({ error: "Store not found" });

  const item = data.find((i) => String(i.id) === id);
  if (!item || item.is_deleted) return res.status(404).json({ error: "Item not found" });

  Object.assign(item, updates);
  item.is_patched = true;
  item.last_patch_date = new Date().toISOString();
  saveStore();
  res.json(item);
});

// Generic DELETE
app.delete("/:type/:id", (req, res) => {
  const { type, id } = req.params;
  const data = store[type];
  if (!data) return res.status(404).json({ error: "Store not found" });

  const item = data.find((i) => String(i.id) === id);
  if (!item || item.is_deleted) return res.status(404).json({ error: "Item not found" });

  item.is_deleted = true;
  item.last_deleted_date = new Date().toISOString();
  saveStore();
  res.json(item);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
