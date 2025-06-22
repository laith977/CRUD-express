const express = require('express');
const { saveStore, getNextId, getStore } = require('./utils');

const app = express();
const port = 3000;

app.use(express.json());

// GET all (excluding soft-deleted)
app.get('/users', (req, res) => {
  try {
    const store = getStore();
    const data = store.users;
    if (!data) return res.status(404).json({ error: 'Store not found' });

    const result = data
      .map((item) => ({
        ...{
          is_deleted: false,
          is_patched: false,
          get_count: 0,
          last_get_date: null,
          last_patch_date: null,
          last_deleted_date: null,
        },
        ...item,
      }))
      .filter((item) => !item.is_deleted);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal error', detail: err.message });
  }
});

// GET by ID
app.get('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const store = getStore();
    const data = store.users;
    if (!data) return res.status(404).json({ error: 'Store not found' });

    const item = data.find((i) => String(i.id) === id);
    if (!item || item.is_deleted)
      return res.status(404).json({ error: 'Item not found' });

    item.get_count = (item.get_count || 0) + 1;
    item.last_get_date = new Date().toISOString();

    saveStore();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Internal error', detail: err.message });
  }
});

// POST new
app.post('/users', (req, res) => {
  try {
    const body = req.body;
    const store = getStore();

    if (!body.first || !body.last) {
      return res.status(400).json({ error: 'Missing first or last name' });
    }

    if (!store.users) store.users = [];

    const newItem = {
      id: getNextId(store.users),
      first: body.first,
      last: body.last,
      is_deleted: false,
      is_patched: false,
      get_count: 0,
      last_get_date: null,
      last_patch_date: null,
      last_deleted_date: null,
    };

    store.users.push(newItem);
    saveStore();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Internal error', detail: err.message });
  }
});

// PATCH by ID
app.patch('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const store = getStore();
    const data = store.users;
    if (!data) return res.status(404).json({ error: 'Store not found' });

    const item = data.find((i) => String(i.id) === id);
    if (!item || item.is_deleted)
      return res.status(404).json({ error: 'Item not found' });

    Object.assign(item, updates);
    item.is_patched = true;
    item.last_patch_date = new Date().toISOString();
    saveStore();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Internal error', detail: err.message });
  }
});

// DELETE by ID (soft-delete)
app.delete('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const store = getStore();
    const data = store.users;
    if (!data) return res.status(404).json({ error: 'Store not found' });

    const item = data.find((i) => String(i.id) === id);
    if (!item || item.is_deleted)
      return res.status(404).json({ error: 'Item not found' });
    item.is_deleted = true;
    item.last_deleted_date = new Date().toISOString();
    saveStore();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Internal error', detail: err.message });
  }
});

// Restore soft-deleted
app.post('/users/:id/retrieve', (req, res) => {
  try {
    const { id } = req.params;
    const store = getStore();
    const data = store.users;
    if (!data) return res.status(404).json({ error: 'Store not found' });

    const item = data.find((i) => String(i.id) === id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (!item.is_deleted) {
      return res.status(400).json({ error: 'Item is not deleted' });
    }

    item.is_deleted = false;
    item.last_patch_date = new Date().toISOString();
    saveStore();
    res.json({ message: 'Item restored', item });
  } catch (err) {
    res.status(500).json({ error: 'Internal error', detail: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
