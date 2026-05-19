# Product Overview

**Private Jet Business API** — A RESTful backend API for e-commerce platforms that buy and sell private jets. It removes the dependency on third-party brokers by providing vendors a self-contained platform for managing jet inventory, manufacturers, customer orders, and user accounts.

## Domain Entities

- **User** — Customers who place orders. Two roles: `admin` and `regular`.
- **Manufacturer** — Companies that build jets, identified by a short `code` (e.g., `GUL` for Gulfstream).
- **Jet** — Private jet listings in the catalog, identified by a unique `sku` / tail number (e.g., `GS-LR-G700-26`).
- **Order** — Purchase orders placed by users, identified by an `orderNumber` (e.g., `ORD-1778282206062-B750`).

## Access Control

- **Admin**: Full CRUD access across all resources; sees all orders and all jets (including unavailable).
- **Regular**: Read-only access to available jets and manufacturers; can create orders and view their own orders only; can update their own password.
- **Public**: Can search jets and view individual jet/manufacturer details without authentication.

## Key Business Rules

- When a jet is purchased (order completed), it should no longer appear as available in the catalog.
- Orders reference both a `User` and a `Jet` by ObjectId.
- Passwords are hashed with bcrypt; authentication uses JWT tokens (1-day expiry).
