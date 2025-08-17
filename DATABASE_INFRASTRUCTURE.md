# Database Infrastructure

This document explains the database infrastructure of the application, which uses **Knex.js** as the ORM for database management.

## 🏗️ Architecture Overview

### Repository Pattern

The application uses the **Repository Pattern** to abstract database operations:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Controller    │───▶│   Use Case       │───▶│   Repository    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   Knex Query    │
                                              │   Builder       │
                                              └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   PostgreSQL    │
                                              │   (camelCase)   │
                                              └─────────────────┘
```

### Key Components

1. **Repository Interface** (`src/interfaces/repository.interface.ts`)
    - Defines the contract for all repositories
    - Supports basic CRUD operations
    - Includes pagination and filtering

2. **Repository Factory** (`src/repositories/factory.ts`)
    - Automatically chooses between Knex and in-memory
    - Falls back to in-memory if database is unavailable
    - Easy to extend with new database types

3. **Knex Configuration** (`src/config/knex.ts`)
    - Database connection and pooling
    - Environment-specific configuration
    - Error handling and logging

4. **Knex Migrations** (`src/database/knex-migrations/`)
    - Schema management with TypeScript
    - Automatic version tracking
    - Safe rollbacks

5. **Automatic Triggers** (`src/database/utils/triggers.ts`)
    - Automatically updates `updatedAt` timestamps
    - Applied to all tables consistently
    - Reduces manual timestamp management

## 🚀 Getting Started

### 1. Add Database to Railway

1. Go to Railway Dashboard → Your project
2. Click "New" → "Database" → "PostgreSQL"
3. Railway automatically provides `DATABASE_URL`

### 2. Run Migrations

```bash
# Run all pending migrations
yarn migrate

# Create a new migration
yarn migrate:make create_products_table

# Or use your preferred pattern
yarn new-migrate create_products_table
```

### 3. Run Seeds (Optional)

```bash
# Run all seed files
yarn seed

# Create a new seed file
yarn seed:make products_seed
```

### 4. Start Application

```bash
# Development
yarn dev:local

# Production
yarn start
```

## 🔄 How It Works

### Automatic Repository Selection

The application automatically chooses the right repository:

```typescript
// If DATABASE_URL is available → Knex
// If no DATABASE_URL → In-Memory
const userRepository = getUserRepository();
```

### Database Initialization

On startup, the application:

1. **Tests connection** to PostgreSQL via Knex
2. **Logs the choice** for debugging
3. **Falls back** to in-memory if database fails

### Migration System

Knex handles all migrations automatically with automatic timestamp triggers:

```typescript
// Example: 001_create_users_table.ts
import { createUpdateTrigger } from "../utils/triggers";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("User", (table) => {
        table.increments("id").primary();
        table.string("email", 255).unique().notNullable();
        table.string("name", 255).notNullable();
        table.boolean("isActive").defaultTo(true);
        table.timestamp("createdAt").defaultTo(knex.fn.now());
        table.timestamp("updatedAt").defaultTo(knex.fn.now());
    });

    // Apply the trigger to automatically update updatedAt
    await createUpdateTrigger(knex, "User");
}
```

### Automatic Timestamp Management

The `createUpdateTrigger` function automatically creates a trigger that updates the `updatedAt` field whenever a row is modified:

```typescript
// src/database/utils/triggers.ts
export const createUpdateTrigger = (knex: Knex, tableName: string) =>
    knex.raw(`CREATE TRIGGER table_update
	BEFORE UPDATE ON "${tableName}" FOR EACH ROW EXECUTE PROCEDURE set_updatedAt();`);
```

This means:

- **`createdAt`**: Set automatically when row is created
- **`updatedAt`**: Updated automatically when row is modified
- **No manual timestamp management** in application code

## 🛠️ Adding New Entities

### 1. Create Migration

```bash
yarn migrate:make create_products_table
```

### 2. Write Migration

```typescript
// src/database/knex-migrations/002_create_products_table.ts
import { createUpdateTrigger } from "../utils/triggers";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("Products", (table) => {
        table.increments("id").primary();
        table.string("name", 255).notNullable();
        table.decimal("price", 10, 2).notNullable();
        table.boolean("isActive").defaultTo(true);
        table
            .integer("userId")
            .references("id")
            .inTable("User")
            .onDelete("CASCADE");
        table.timestamp("createdAt").defaultTo(knex.fn.now());
        table.timestamp("updatedAt").defaultTo(knex.fn.now());
    });

    // Apply the trigger to automatically update updatedAt
    await createUpdateTrigger(knex, "Products");
}
```

### 3. Create Entity

```typescript
// src/entities/product.entity.ts
export interface Product {
    id: number;
    name: string;
    price: number;
    isActive: boolean;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
}
```

### 4. Create Repository

```typescript
// src/repositories/knex/product.repository.ts
export class KnexProductRepository implements IPaginatedRepository<Product> {
    constructor(private knex: Knex) {}

    async findById(id: number): Promise<Product | null> {
        const product = await this.knex("Products").where({ id }).first();
        return product || null;
    }

    async create(data: Partial<Product>): Promise<Product> {
        const productData = {
            name: data.name,
            price: data.price,
            isActive: data.isActive ?? true,
            userId: data.userId,
        };

        const [product] = await this.knex("Products")
            .insert(productData)
            .returning("*");

        return product;
    }

    // ... other methods
}
```

### 5. Add to Factory

```typescript
// src/repositories/factory.ts
export const getProductRepository = (): IPaginatedRepository<Product> => {
    if (config.DATABASE_URL) {
        return new KnexProductRepository(knexDb);
    }
    return new InMemoryProductRepository();
};
```

## 🔧 Configuration

### Environment Variables

```env
# Required for PostgreSQL
DATABASE_URL=postgresql://username:password@host:port/database

# Optional: Connection pool settings
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
```

### Knex Configuration

```typescript
// src/config/knex.ts
const createKnexConfig = () => {
    const environment = config.NODE_ENV || "development";

    return {
        client: "postgresql" as const,
        connection: config.DATABASE_URL || {
            host: "localhost",
            port: 5432,
            user: "postgres",
            password: "password",
            database: `print_${environment}`,
        },
        pool: {
            min: 2,
            max: environment === "production" ? 20 : 10,
        },
        migrations: {
            directory: "./src/database/knex-migrations",
            extension: "ts",
        },
        seeds: {
            directory: "./src/database/seeds",
            extension: "ts",
        },
    };
};
```

## 🔄 Switching Databases

### Current Support

- ✅ **PostgreSQL** (Production) - via Knex
- ✅ **In-Memory** (Development/Fallback)

### Adding New Database

1. **Create Repository Implementation**
2. **Add to Factory**
3. **Update Configuration**
4. **Add Migration Support**

Example for MongoDB:

```typescript
// src/repositories/mongo/user.repository.ts
export class MongoUserRepository implements IPaginatedRepository<User> {
    constructor(private collection: Collection) {}

    async findById(id: number): Promise<User | null> {
        return this.collection.findOne({ _id: id });
    }
    // ... other methods
}
```

## 🧪 Testing

### Unit Tests

```typescript
// src/tests/repositories/user.repository.test.ts
describe("UserRepository", () => {
    it("should create user", async () => {
        const repo = getUserRepository();
        const user = await repo.create({
            email: "test@example.com",
            name: "Test",
        });
        expect(user.email).toBe("test@example.com");
    });
});
```

### Integration Tests

```typescript
// src/tests/integration/database.test.ts
describe("Database Integration", () => {
    it("should connect to database", async () => {
        const connected = await testKnexConnection();
        expect(connected).toBe(true);
    });
});
```

## 📊 Performance

### Connection Pooling

- **Max Connections**: 20 (configurable)
- **Idle Timeout**: 30 seconds
- **Connection Timeout**: 2 seconds

### Indexes

```typescript
// Automatic indexes for performance
table.index("email");
table.index("isActive");
table.index("createdAt");
```

### Query Optimization

- **Parameterized Queries**: Automatic via Knex
- **Efficient Pagination**: Uses LIMIT/OFFSET
- **Selective Updates**: Only updates changed fields
- **Automatic Timestamps**: No manual timestamp management

## 🔒 Security

### SQL Injection Prevention

```typescript
// ✅ Safe - Knex handles parameterization automatically
const user = await this.knex("User").where({ id }).first();

// ✅ Safe - Knex query builder
const users = await this.knex("User").whereILike("name", `%${searchTerm}%`);
```

### Input Validation

```typescript
// Validate field names to prevent injection
const allowedFields = ["id", "email", "name", "isActive"];
if (!allowedFields.includes(field)) {
    throw new Error(`Invalid field: ${field}`);
}
```

## 🚨 Error Handling

### Graceful Degradation

```typescript
// Falls back to in-memory if database fails
if (config.DATABASE_URL) {
    try {
        this.userRepositoryInstance = new KnexUserRepository(knexDb);
    } catch (error) {
        logger.warn("Database failed, using in-memory");
        this.userRepositoryInstance = userRepository;
    }
}
```

### Connection Monitoring

```typescript
// Knex handles connection events automatically
const db = knex(createKnexConfig());
```

## 📈 Monitoring

### Health Checks

```typescript
// /health endpoint includes database status
app.get("/health", (req, res) => {
    const dbStatus = await testKnexConnection();
    res.json({
        status: "ok",
        database: dbStatus ? "connected" : "disconnected",
    });
});
```

### Logging

```typescript
// All database operations are logged
logger.info("User created", { userId: user.id });
logger.error("Database error", { error: error.message });
```

## 🔄 Migration Management

### Running Migrations

```bash
# Manual migration
yarn migrate

# Automatic on deployment
# Knex migrations run automatically when needed
```

### Migration Tracking

Knex automatically tracks executed migrations in a `knex_migrations` table.

### Creating New Migration

1. **Create migration**: `yarn migrate:make add_user_roles`
2. **Add migration logic**:

```typescript
export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable("User", (table) => {
        table.string("role", 50).defaultTo("user");
    });
}
```

3. **Deploy**: Migration runs automatically

## 🎯 Best Practices

### 1. Always Use Repository Pattern

```typescript
// ✅ Good
const user = await getUserRepository().findById(id);

// ❌ Bad
const user = await knex("User").where({ id }).first();
```

### 2. Handle Database Failures

```typescript
// ✅ Good - Graceful fallback
if (!dbConnected) {
    logger.warn("Using in-memory storage");
}

// ❌ Bad - Application crashes
if (!dbConnected) {
    throw new Error("Database required");
}
```

### 3. Use Transactions for Complex Operations

```typescript
await knex.transaction(async (trx) => {
    await trx("User").insert(userData);
    await trx("Profiles").insert(profileData);
});
```

### 4. Validate Input Data

```typescript
// ✅ Good - Validate before database
if (!emailRegex.test(email)) {
    throw new Error("Invalid email");
}

// ❌ Bad - Let database handle validation
await knex("User").insert({ email });
```

### 5. Use Automatic Timestamp Triggers

```typescript
// ✅ Good - Automatic timestamp management
await createUpdateTrigger(knex, "TableName");

// ❌ Bad - Manual timestamp management
const updateData = { updatedAt: new Date() };
```

## 🔮 Future Enhancements

### Planned Features

- [ ] **Redis Caching Layer**
- [ ] **Database Replication**
- [ ] **Automated Backups**
- [ ] **Query Performance Monitoring**
- [ ] **Database Schema Validation**

### Extension Points

- **Custom Repository Methods**: Add business-specific queries
- **Database-Specific Optimizations**: Use PostgreSQL-specific features
- **Caching Strategies**: Implement Redis or in-memory caching
- **Audit Logging**: Track all database changes

---

This infrastructure provides a **solid foundation** for scalable applications while maintaining **flexibility** to switch databases or add new features as needed.
