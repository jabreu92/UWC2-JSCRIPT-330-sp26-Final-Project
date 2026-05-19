# Requirements Document

## Introduction

This feature adds OpenAPI 3.0 documentation to the Private Jet Business API. A centralized OpenAPI specification file will describe all 20 endpoints across the Jets, Manufacturers, Orders, Users, and Auth resources. The spec will be served as an interactive Swagger UI at `/api-docs` using `swagger-ui-express`. Each endpoint entry will include a summary and a human-readable description that notes the access level required (public, regular user, or admin only).

## Glossary

- **OpenAPI_Spec**: The centralized OpenAPI 3.0.x specification object that describes the entire API surface.
- **Swagger_UI**: The interactive browser-based documentation interface served by `swagger-ui-express` at the `/api-docs` route.
- **Endpoint_Entry**: A single path + HTTP method combination documented within the OpenAPI_Spec (e.g., `GET /jet/{sku}`).
- **Summary**: A short, one-line label for an Endpoint_Entry (≤ 120 characters).
- **Description**: A human-readable paragraph for an Endpoint_Entry that explains what the operation does and states the access level required (Public, Regular user, or Admin only).
- **Tag**: A grouping label applied to Endpoint_Entries to organize them by resource in the Swagger_UI (e.g., `Jets`, `Manufacturers`, `Orders`, `Users`, `Auth`).
- **Access_Level**: One of three values — `Public` (no authentication required), `Regular` (valid JWT required), or `Admin` (valid JWT with admin role required).
- **JWT**: JSON Web Token issued by `POST /login`, passed as a `Bearer` token in the `Authorization` header.
- **SKU**: Unique uppercase identifier for a Jet (e.g., `GS-LR-G700-26`).
- **Manufacturer_Code**: Unique uppercase short code identifying a Manufacturer (e.g., `GUL`).
- **Order_Number**: Unique identifier for an Order (e.g., `ORD-1778282206062-B750`).

---

## Requirements

### Requirement 1: OpenAPI Specification File

**User Story:** As a developer, I want a single centralized OpenAPI 3.0 specification that describes the entire API, so that I have one authoritative source of truth for all endpoint documentation.

#### Acceptance Criteria

1. THE OpenAPI_Spec SHALL conform to OpenAPI version 3.0.x.
2. THE OpenAPI_Spec SHALL define `info` metadata including a title, version, and description of the Private Jet Business API.
3. THE OpenAPI_Spec SHALL define a `servers` entry pointing to `http://localhost:3000` as the default development server.
4. THE OpenAPI_Spec SHALL contain Endpoint_Entries for all 23 routes across the Jets (6), Manufacturers (5), Orders (5), Users (6), and Auth (1) resources. An Endpoint_Entry is defined as a unique HTTP method + path combination that includes at minimum a `summary` field.
5. THE OpenAPI_Spec SHALL be authored in a single centralized file at `swagger/openapi.js` within the project root.

---

### Requirement 2: Swagger UI Serving

**User Story:** As a developer, I want to browse the API documentation in a browser, so that I can explore and understand all endpoints without reading source code.

#### Acceptance Criteria

1. THE Server SHALL declare `swagger-ui-express` as a production dependency in `package.json` under `dependencies`, and use it to serve the Swagger_UI at the `/api-docs` route.
2. WHEN a client sends `GET /api-docs`, THE Server SHALL respond with HTTP status 200, a `Content-Type` header of `text/html`, and an HTML body that contains the Swagger UI interface.
3. THE `/api-docs` route SHALL be registered in `server.js` before the main API router so that it is reachable regardless of any downstream routing errors.
4. IF the `swagger-ui-express` package is not installed at startup, THEN THE Server SHALL log an error message that identifies `swagger-ui-express` as the missing dependency and exit the process.

---

### Requirement 3: Endpoint Summary and Description

**User Story:** As a developer, I want each endpoint to have a clear summary and description, so that I can quickly understand what each operation does and who is allowed to call it.

#### Acceptance Criteria

1. THE OpenAPI_Spec SHALL include a `summary` field for every Endpoint_Entry.
2. THE OpenAPI_Spec SHALL include a `description` field for every Endpoint_Entry.
3. THE `summary` field for each Endpoint_Entry SHALL be 120 characters or fewer.
4. THE `description` field for each Endpoint_Entry SHALL state the Access_Level required (Public, Regular user, or Admin only) in plain text.
5. THE `description` field for each Endpoint_Entry SHALL describe the business purpose of the operation in one or more sentences.

---

### Requirement 4: Endpoint Grouping by Resource Tag

**User Story:** As a developer, I want endpoints grouped by resource in the Swagger UI, so that I can navigate to all Jets, Manufacturers, Orders, Users, or Auth operations without scrolling through an unsorted list.

#### Acceptance Criteria

1. THE OpenAPI_Spec SHALL define the following top-level tags: `Jets`, `Manufacturers`, `Orders`, `Users`, `Auth`.
2. WHEN an Endpoint_Entry belongs to the Jets router, THE OpenAPI_Spec SHALL assign it the `Jets` tag.
3. WHEN an Endpoint_Entry belongs to the Manufacturers router, THE OpenAPI_Spec SHALL assign it the `Manufacturers` tag.
4. WHEN an Endpoint_Entry belongs to the Orders router, THE OpenAPI_Spec SHALL assign it the `Orders` tag.
5. WHEN an Endpoint_Entry belongs to the Users router, THE OpenAPI_Spec SHALL assign it the `Users` tag.
6. WHEN an Endpoint_Entry belongs to the Login router, THE OpenAPI_Spec SHALL assign it the `Auth` tag.

---

### Requirement 5: Jets Endpoint Documentation

**User Story:** As a developer, I want all six Jets endpoints documented, so that I know how to search, browse, and manage jet listings.

#### Acceptance Criteria

1. THE OpenAPI_Spec SHALL document `GET /jet/search` with Access_Level `Public`, a summary, and a description noting the required `q` query parameter.
2. THE OpenAPI_Spec SHALL document `GET /jet` with Access_Level `Regular`, a summary, and a description noting that admins see all jets while regular users see only available jets.
3. THE OpenAPI_Spec SHALL document `GET /jet/{sku}` with Access_Level `Public`, a summary, and a description noting the `sku` path parameter.
4. THE OpenAPI_Spec SHALL document `POST /jet` with Access_Level `Admin`, a summary, and a description noting the required `sku` and `manufacturerCode` fields.
5. THE OpenAPI_Spec SHALL document `PATCH /jet/{sku}` with Access_Level `Admin`, a summary, and a description noting the `sku` path parameter and updatable fields.
6. THE OpenAPI_Spec SHALL document `DELETE /jet/{sku}` with Access_Level `Admin`, a summary, and a description noting the `sku` path parameter.

---

### Requirement 6: Manufacturers Endpoint Documentation

**User Story:** As a developer, I want all five Manufacturers endpoints documented, so that I know how to look up and manage manufacturer records.

#### Acceptance Criteria

1. THE OpenAPI_Spec SHALL document `GET /manufacturer` with Access_Level `Public`, a summary, and a description.
2. THE OpenAPI_Spec SHALL document `GET /manufacturer/{code}` with Access_Level `Public`, a summary, and a description noting the `code` path parameter.
3. THE OpenAPI_Spec SHALL document `POST /manufacturer` with Access_Level `Admin`, a summary, and a description noting the required `code` and `name` fields.
4. THE OpenAPI_Spec SHALL document `PUT /manufacturer/{code}` with Access_Level `Admin`, a summary, and a description noting the `code` path parameter.
5. THE OpenAPI_Spec SHALL document `DELETE /manufacturer/{code}` with Access_Level `Admin`, a summary, and a description noting that deletion is blocked when jets are linked to the manufacturer.

---

### Requirement 7: Orders Endpoint Documentation

**User Story:** As a developer, I want all five Orders endpoints documented, so that I know how to create, view, update, and delete purchase orders.

#### Acceptance Criteria

1. THE OpenAPI_Spec SHALL document `POST /order` with Access_Level `Regular`, a summary, and a description noting the required `sku` field in the request body.
2. THE OpenAPI_Spec SHALL document `GET /order` with Access_Level `Regular`, a summary, and a description noting that admins see all orders while regular users see only their own.
3. THE OpenAPI_Spec SHALL document `GET /order/{orderNumber}` with Access_Level `Regular`, a summary, and a description noting the `orderNumber` path parameter and the ownership check for non-admin users.
4. THE OpenAPI_Spec SHALL document `PATCH /order/{orderNumber}` with Access_Level `Admin`, a summary, and a description noting the `status` field in the request body.
5. THE OpenAPI_Spec SHALL document `DELETE /order/{orderNumber}` with Access_Level `Admin`, a summary, and a description noting that deleting an order re-lists the associated jet as available.

---

### Requirement 8: Users Endpoint Documentation

**User Story:** As a developer, I want all six Users endpoints documented, so that I know how to register, manage, and update user accounts.

#### Acceptance Criteria

1. THE OpenAPI_Spec SHALL document `POST /user` with Access_Level `Public`, a summary, and a description noting the required `email` and `password` fields.
2. THE OpenAPI_Spec SHALL document `PATCH /user/change-password` with Access_Level `Regular`, a summary, and a description noting the required `oldPassword` and `newPassword` fields.
3. THE OpenAPI_Spec SHALL document `GET /user` with Access_Level `Admin`, a summary, and a description.
4. THE OpenAPI_Spec SHALL document `GET /user/{email}` with Access_Level `Admin`, a summary, and a description noting the `email` path parameter.
5. THE OpenAPI_Spec SHALL document `PUT /user/{email}` with Access_Level `Admin`, a summary, and a description noting the `email` path parameter.
6. THE OpenAPI_Spec SHALL document `DELETE /user/{email}` with Access_Level `Admin`, a summary, and a description noting the `email` path parameter.

---

### Requirement 9: Auth Endpoint Documentation

**User Story:** As a developer, I want the login endpoint documented, so that I know how to obtain a JWT token for authenticated requests.

#### Acceptance Criteria

1. THE OpenAPI_Spec SHALL document `POST /login` with Access_Level `Public`, a summary, and a description.
2. THE `description` for `POST /login` SHALL state that a successful response returns a JWT token and basic user information (`id`, `email`, `role`).
3. THE `description` for `POST /login` SHALL state that the returned token must be passed as a `Bearer` token in the `Authorization` header for protected endpoints.

---

### Requirement 10: Package Installation and Configuration

**User Story:** As a developer, I want the required npm packages installed and configured correctly, so that the Swagger UI works without manual setup steps.

#### Acceptance Criteria

1. THE Server SHALL use the `swagger-ui-express` npm package to serve the Swagger_UI.
2. THE OpenAPI_Spec file SHALL be importable as an ES module consistent with the project's Babel + ES module configuration.
3. WHEN `npm start` is executed, THE Swagger_UI SHALL be accessible at `http://localhost:3000/api-docs` without additional configuration steps. WHEN `npm run dev` is executed, THE Swagger_UI SHALL independently be accessible at `http://localhost:3000/api-docs` without additional configuration steps.
4. IF `swagger-ui-express` is added as a dependency, THEN THE `package.json` SHALL list it under `dependencies` (not `devDependencies`), since it is required at runtime.
