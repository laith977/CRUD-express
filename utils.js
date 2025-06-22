const fs = require("fs");
const path = require("path");

const storePath = path.join(__dirname, "store.json");

let store = require(storePath);

const saveStore = () => {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf-8");
};

const getNextId = (items) => {
  return items.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
};

const getStore = () => store;
const setStore = (updated) => (store = updated);

module.exports = {
  saveStore,
  getNextId,
  getStore,
  setStore,
};
