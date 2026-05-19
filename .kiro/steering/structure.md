# Project Structure

## Folder Layout

```
/
├── index.js              # Entry point: connects MongoDB, syncs indexes, starts server
├── server.js             # Express app setup (middleware + routes), exported for testing
├── routes/
│   ├── index.js          # Root router — mounts all sub-routers
│   ├── jet.js
│   ├── manufacturer.js
│   ├── order.js
│   ├── user.js
│   └── login.js
├── controller/           # Request handlers — validates input, calls DAOs, sends responses
│   ├── jet.js
│   ├── manufacturer.js
│   ├── order.js
│   ├── user.js
│   └── login.js
├── daos/                 # Data Access Objects — all Mongoose queries live here
│   ├── jet.js
│   ├── manufacturer.js
│   ├── order.js
│   └── user.js
├── models/               # Mongoose schemas and model definitions
│   ├── jet.js
│   ├── manufacturer.js
│   ├── order.js
│   └── user.js
├── middleware/
│   └── middleware.js     # JWT auth (protect) and role guard (authorizeAdmin)
└── tests/
    ├── jet.test.js           # Route/controller tests (DAOs mocked)
    ├── jet.dao.test.js       # DAO integration tests (in-memory MongoDB)
    ├── manufacturer.test.js
    ├── manufacturer.dao.test.js
    ├── order.test.js
    ├── order.dao.test.js
    ├── user.test.js
    ├── user.dao.test.js
    └── login.test.js
```

## Architectural Pattern

The project follows a strict 4-layer architecture. Each layer only talks to the layer directly below it:

```
Routes → Controllers → DAOs → Models
```

- **Routes** — attach middleware (`protect`, `authorizeAdmin`) and map HTTP verbs to controller functions. Static paths (e.g., `/search`) must be declared before parameterized paths (e.g., `/:sku`).
- **Controllers** — handle request/response logic, input validation, and error responses. They call DAOs and never import Mongoose models directly (except for index reporting in `jet.js`).
- **DAOs** — contain all Mongoose queries. Functions throw descriptive errors prefixed with `DAO Error (MethodName):`. Always use `.lean()` on read queries that don't need Mongoose document methods.
- **Models** — define schemas with validation, indexes, and refs. Use `{ timestamps: true }` on all schemas.

## Naming Conventions

- Files are named after the domain entity they serve (e.g., `jet.js`, `order.js`) — same name used across all layers.
- DAO functions use descriptive verb+noun names: `createOneJet`, `findJetBySku`, `getAllJets`, `updateOneJetBySku`, `deleteOneJetBySku`.
- Controller exports are named action functions: `createJet`, `getJets`, `getJetBySku`, `updateJet`, `deleteJet`.

## Testing Conventions

- **Route/controller tests** (`*.test.js`): Use `supertest` against the Express app. Mock all DAO modules with `jest.mock('../daos/...')`. Set `process.env.JWT_SECRET` at the top of the file. Generate tokens with `jwt.sign()` directly in `beforeAll`.
- **DAO tests** (`*.dao.test.js`): Use `@shelf/jest-mongodb` in-memory database. No mocking — test real Mongoose queries.
- Both test types use `afterEach(() => jest.clearAllMocks())` and close the mongoose connection in `afterAll`.
- Target: **≥ 80% code coverage** across all routes.

## Key Identifiers

| Entity | Unique Field | Example |
|---|---|---|
| Manufacturer | `code` | `GUL` |
| Jet | `sku` | `GS-LR-G700-26` |
| Order | `orderNumber` | `ORD-1778282206062-B750` |
| User | `email` | — |

SKU values are always stored and queried in **uppercase** (enforced in schema and DAO queries via `.toUpperCase()`).
