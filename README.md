# Item CRUD API

Simple Node.js project with:

- Express REST API
- Item CRUD endpoints
- Category, Supplier, and Inventory services
- JSON file persistence
- Jest unit/API tests
- Postman collection
- Newman CLI test runner
- Postman Native Git layout
- TypeScript source code

## Install

```bash
npm install
```

## Run

```bash
npm start
```

Server runs at `http://localhost:3000`.

Data is stored in:

- `data/items.json`
- `data/categories.json`
- `data/suppliers.json`
- `data/inventories.json`

## API Endpoints

- `GET /health`
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/suppliers`
- `POST /api/suppliers`
- `PUT /api/suppliers/:id`
- `DELETE /api/suppliers/:id`
- `GET /api/items`
- `GET /api/items/:id`
- `POST /api/items`
- `PUT /api/items/:id`
- `DELETE /api/items/:id`
- `GET /api/inventories`
- `GET /api/items/:id/inventory`
- `PUT /api/items/:id/inventory`

Example request body:

```json
{
  "name": "Desk Lamp",
  "description": "Adjustable LED lamp",
  "price": 129,
  "categoryId": 1,
  "supplierId": 1
}
```

## Testing

Run Jest:

```bash
npm test
```

Build TypeScript output:

```bash
npm run build
```

Run Postman collection with Newman:

```bash
npm run test:postman
```

Before running Newman, start the server with `npm start`.

Run the CI-style local checks:

```bash
npm run test:ci
```

Postman files are stored in:

- `postman/collections/Item CRUD API/` for Postman Native Git requests
- `postman/environments/Shared Local Template.environment.yaml` for Postman Native Git environment
- `postman/newman/Item-CRUD.postman_collection.json` for Newman runs
- `postman/newman/local.postman_environment.json` for Newman runs

The environment file in Git is a shared template. Keep secrets such as tokens and passwords out of the repository.

If you use Postman Desktop with Native Git, edit the collection in `Local View`, then commit and push the resulting file changes with Git.

The collection is organized into folders:

- `00 Health`
- `01 Category`
- `02 Supplier`
- `03 Item`
- `04 Inventory`
- `05 Item Lifecycle`
- `99 Cleanup`

Use environment variables for deployment-specific values such as `baseUrl`, and use collection variables for workflow values such as `categoryId`, `supplierId`, `itemId`, and `inventoryId`.

## CI

GitHub Actions runs the test pipeline on pushes and pull requests to `main`.

The workflow:

- installs dependencies with `npm ci`
- builds the TypeScript project
- runs Jest tests
- starts the app locally inside the runner
- runs the Newman Postman regression suite against `http://localhost:3000`

Workflow file:

- `.github/workflows/ci.yml`
