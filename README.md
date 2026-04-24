# Item CRUD API

Simple Node.js project with:

- Express REST API
- Item CRUD endpoints
- JSON file persistence
- Jest unit/API tests
- Postman collection
- Newman CLI test runner
- Postman Native Git layout

## Install

```bash
npm install
```

## Run

```bash
npm start
```

Server runs at `http://localhost:3000`.

Data is stored in `data/items.json`.

## API Endpoints

- `GET /health`
- `GET /api/items`
- `GET /api/items/:id`
- `POST /api/items`
- `PUT /api/items/:id`
- `DELETE /api/items/:id`

Example request body:

```json
{
  "name": "Desk Lamp",
  "description": "Adjustable LED lamp",
  "price": 129
}
```

## Testing

Run Jest:

```bash
npm test
```

Run Postman collection with Newman:

```bash
npm run test:postman
```

Before running Newman, start the server with `npm start`.

Postman files are stored in:

- `postman/collections/Item-CRUD.postman_collection.json`
- `postman/environments/local.postman_environment.json`

The environment file in Git is a shared template. Keep secrets such as tokens and passwords out of the repository.

If you use Postman Desktop with Native Git, edit the collection in `Local View`, then commit and push the resulting file changes with Git.
