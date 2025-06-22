# User Management API

A simple Express.js API for managing user records with support for soft deletion, patching, and tracking metadata like `get_count`, timestamps, etc.

---

## Features

- 🧑‍💼 Create new users
- 📋 Get all users (excluding soft-deleted)
- 🔍 Get user by ID (and track get count)
- ✏️ Patch user by ID
- 🗑️ Soft-delete user
- ♻️ Restore soft-deleted user
- 🧠 In-memory data storage using `utils.js`

---

## Setup

### 1. Clone the repo

```bash
git clone CRUD-express
cd CRUD-express
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
node server.js
```

The API will be available at: [http://localhost:3000](http://localhost:3000)

---

## API Endpoints

### `GET /users`

Get all users that are **not soft-deleted**.

**Response:**

```json
[
  {
    "id": 1,
    "first": "John",
    "last": "Doe",
    "get_count": 2,
    "is_deleted": false
  }
]
```

---

### `GET /users/:id`

Get a user by ID and increment `get_count` + update `last_get_date`.

**Response:**

```json
{
  "id": 1,
  "first": "John",
  "last": "Doe",
  "get_count": 3,
  "last_get_date": "2025-06-22T12:34:56.789Z"
}
```

---

### `POST /users`

Create a new user.

**Body:**

```json
{
  "first": "Jane",
  "last": "Smith"
}
```

**Response:**

```json
{
  "id": 2,
  "first": "Jane",
  "last": "Smith",
  "is_deleted": false
}
```

---

### `PATCH /users/:id`

Update (patch) a user's properties.

**Body Example:**

```json
{
  "first": "Janet"
}
```

**Response:**

```json
{
  "id": 2,
  "first": "Janet",
  "is_patched": true,
  "last_patch_date": "2025-06-22T12:34:56.789Z"
}
```

---

### `DELETE /users/:id`

Soft-delete a user.

**Response:**

```json
{
  "message": "User soft-deleted",
  "id": 2,
  "last_deleted_date": "2025-06-22T12:34:56.789Z"
}
```

---

### `POST /users/:id/retrieve`

Restore a soft-deleted user.

**Response:**

```json
{
  "message": "Item restored",
  "item": {
    "id": 2,
    "first": "Jane",
    "is_deleted": false
  }
}
```

---

## Notes

- All data is stored in-memory via a utility file (`utils.js`) that handles loading, saving, and ID generation.
- Fields like `get_count`, `last_get_date`, `last_patch_date`, and `last_deleted_date` are tracked for each user.
- This project is useful for prototyping or teaching CRUD + soft-delete concepts.


