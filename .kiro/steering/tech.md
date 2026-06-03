# Tech Stack

## Runtime & Language
- **Node.js** >= 20.0.0
- **ES Modules** syntax (`import`/`export`) transpiled via **Babel** (`@babel/preset-env` targeting current Node)
- No TypeScript — plain JavaScript throughout

## Framework & Libraries
- **Express 5** — HTTP server and routing
- **Mongoose 8** — MongoDB ODM; all DB access goes through Mongoose models
- **MongoDB** — primary database (local: `mongodb://localhost/jscript-330-final-project`)
- **bcrypt** — password hashing
- **jsonwebtoken** — JWT creation and verification (secret via `process.env.JWT_SECRET`, fallback `'your_super_secret_key'`)

## Dev Tools
- **nodemon** — dev server with auto-restart
- **Babel + @babel/register** — transpiles ES module syntax at runtime (no build step)
- **ESLint** — `airbnb-base` config + `prettier` + `jest` plugins
- **Prettier** — single quotes, trailing commas (`"singleQuote": true, "trailingComma": "all"`)

## Testing
- **Jest 29** — test runner, always run with `--runInBand` (serial execution required for DB isolation)
- **@shelf/jest-mongodb** — in-memory MongoDB for integration/DAO tests (`jest-mongodb-config.js`)
- **supertest** — HTTP integration testing against the Express app
- **jest.mock()** — used in route/controller tests to mock DAO modules entirely

## Common Commands

```bash
# Start production server
npm start

# Start dev server with auto-reload
npm run dev

# Run all tests (serial)
npm test

# Run tests with coverage report
npm run test:cov

# Lint
npm run lint
npm run lint:fix

# Prettier check / fix
npm run prettier
npm run prettier:fix
```

## Environment Variables
| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | HTTP listen port |
| `JWT_SECRET` | `'your_super_secret_key'` | JWT signing secret — override in production |
