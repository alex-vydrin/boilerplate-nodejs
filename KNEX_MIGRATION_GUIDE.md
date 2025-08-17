# Knex Migration Guide

This guide shows you how to use Knex for database migrations and adding new tables to your application.

## 🚀 **Quick Start**

### **1. Run Migrations**

```bash
# Run all pending migrations
yarn migrate

# Create a new migration
yarn migrate:make create_products_table

# Or use your preferred pattern
yarn new-migrate create_products_table

# Rollback last migration
yarn migrate:rollback

# Check migration status
yarn migrate:status
```

### **2. Run Seeds**

```bash
# Run all seed files
yarn seed

# Create a new seed file
yarn seed:make products_seed
```

## 📊 **Adding New Tables**

### **Example: Adding a Products Table**

#### **1. Create Migration**

```bash
yarn migrate:make create_products_table
# or
yarn new-migrate create_products_table
```

This creates: `src/database/knex-migrations/002_create_products_table.ts`

#### **2. Write Migration**

```typescript
import { Knex } from "knex";
import { createUpdateTrigger } from "../utils/triggers";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("Products", (table) => {
        table.increments("id").primary();
        table.string("name", 255).notNullable();
        table.text("description");
        table.decimal("price", 10, 2).notNullable();
        table.integer("stock").defaultTo(0);
        table.boolean("isActive").defaultTo(true);
        table
            .integer("userId")
            .references("id")
            .inTable("User")
            .onDelete("CASCADE");
        table.timestamp("createdAt").defaultTo(knex.fn.now());
        table.timestamp("updatedAt").defaultTo(knex.fn.now());

        // Indexes
        table.index("name");
        table.index("price");
        table.index("userId");
        table.index("isActive");
    });

    // Apply the trigger to automatically update updatedAt
    await createUpdateTrigger(knex, "Products");
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("Products");
}
```

#### **3. Create Entity**

```typescript
// src/entities/product.entity.ts
export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    isActive: boolean;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateProductRequest {
    name: string;
    description?: string;
    price: number;
    stock?: number;
    userId: number;
}

export interface UpdateProductRequest {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    isActive?: boolean;
}
```

#### **4. Create Repository**

```typescript
// src/repositories/knex/product.repository.ts
import { Knex } from "knex";
import { IPaginatedRepository } from "../../interfaces/repository.interface";
import { Product } from "../../entities/product.entity";

export class KnexProductRepository implements IPaginatedRepository<Product> {
    constructor(private knex: Knex) {}

    async findById(id: number): Promise<Product | null> {
        const product = await this.knex("Products").where({ id }).first();
        return product || null;
    }

    async findAll(): Promise<Product[]> {
        return this.knex("Products").orderBy("createdAt", "desc");
    }

    async create(data: Partial<Product>): Promise<Product> {
        const productData = {
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock ?? 0,
            isActive: data.isActive ?? true,
            userId: data.userId,
        };

        const [product] = await this.knex("Products")
            .insert(productData)
            .returning("*");

        return product;
    }

    async update(id: number, data: Partial<Product>): Promise<Product | null> {
        const updateData: any = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.price !== undefined) updateData.price = data.price;
        if (data.stock !== undefined) updateData.stock = data.stock;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        const [product] = await this.knex("Products")
            .where({ id })
            .update(updateData)
            .returning("*");

        return product || null;
    }

    async delete(id: number): Promise<boolean> {
        const deletedCount = await this.knex("Products").where({ id }).del();
        return deletedCount > 0;
    }

    // Additional methods for products
    async findByUserId(userId: number): Promise<Product[]> {
        return this.knex("Products")
            .where({ userId, isActive: true })
            .orderBy("createdAt", "desc");
    }

    async findByName(name: string): Promise<Product[]> {
        return this.knex("Products")
            .whereILike("name", `%${name}%`)
            .orderBy("createdAt", "desc");
    }

    async findByPriceRange(
        minPrice: number,
        maxPrice: number,
    ): Promise<Product[]> {
        return this.knex("Products")
            .whereBetween("price", [minPrice, maxPrice])
            .orderBy("createdAt", "desc");
    }

    async findWithPagination(options: any): Promise<any> {
        const {
            page,
            limit,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = options;

        const countResult = await this.knex("Products").count("* as count");
        const total = parseInt((countResult[0]?.count as string) || "0");

        const offset = (page - 1) * limit;
        const products = await this.knex("Products")
            .orderBy(sortBy, sortOrder)
            .limit(limit)
            .offset(offset);

        return {
            data: products,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findByField(field: keyof Product, value: any): Promise<Product[]> {
        return this.knex("Products").where({ [field]: value });
    }

    async findByFilters(filters: any): Promise<Product[]> {
        let query = this.knex("Products");

        if (filters.isActive !== undefined) {
            query = query.where("isActive", filters.isActive);
        }

        if (filters.userId) {
            query = query.where("userId", filters.userId);
        }

        if (filters.name) {
            query = query.whereILike("name", `%${filters.name}%`);
        }

        return query.orderBy("createdAt", "desc");
    }
}
```

#### **5. Add to Factory**

```typescript
// src/repositories/factory.ts
import { KnexProductRepository } from "./knex/product.repository";

export class RepositoryFactory {
    // ... existing code ...

    static getProductRepository(): IPaginatedRepository<Product> {
        if (config.DATABASE_URL) {
            return new KnexProductRepository(knexDb);
        }
        return new InMemoryProductRepository(); // Create this too
    }
}

export const getProductRepository = (): IPaginatedRepository<Product> => {
    return RepositoryFactory.getProductRepository();
};
```

#### **6. Create Use Cases**

```typescript
// src/usecases/product/create-product.usecase.ts
import {
    IUseCaseWithValidation,
    UseCaseResult,
} from "../../interfaces/usecase.interface";
import { Product, CreateProductRequest } from "../../entities/product.entity";
import { getProductRepository } from "../../repositories/factory";

export class CreateProductUseCase
    implements
        IUseCaseWithValidation<CreateProductRequest, UseCaseResult<Product>>
{
    private productRepository = getProductRepository();

    async validate(request: CreateProductRequest): Promise<boolean> {
        const { name, price, userId } = request;

        if (!name || name.length < 2) return false;
        if (!price || price <= 0) return false;
        if (!userId) return false;

        return true;
    }

    async execute(
        request: CreateProductRequest,
    ): Promise<UseCaseResult<Product>> {
        try {
            const isValid = await this.validate(request);
            if (!isValid) {
                return {
                    success: false,
                    error: {
                        message: "Invalid product data",
                        code: "VALIDATION_ERROR",
                    },
                };
            }

            const product = await this.productRepository.create(request);
            return { success: true, data: product };
        } catch (error) {
            return {
                success: false,
                error: {
                    message: "Failed to create product",
                    code: "INTERNAL_ERROR",
                },
            };
        }
    }
}
```

#### **7. Create Controller**

```typescript
// src/controllers/product.controller.ts
import { Request, Response } from "express";
import { ProductService } from "../services/product.service";

export class ProductController {
    private productService = new ProductService();

    async createProduct(req: Request, res: Response): Promise<void> {
        try {
            const { name, description, price, stock, userId } = req.body;
            const product = await this.productService.createProduct({
                name,
                description,
                price,
                stock,
                userId,
            });
            res.status(201).json({ success: true, data: product });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: "Failed to create product",
            });
        }
    }

    // ... other methods
}
```

#### **8. Add Routes**

```typescript
// src/routes/products.ts
import { Router } from "express";
import { ProductController } from "../controllers/product.controller";

const router = Router();
const productController = new ProductController();

router.post("/", productController.createProduct.bind(productController));
router.get("/", productController.listProducts.bind(productController));
router.get("/:id", productController.getProduct.bind(productController));
router.put("/:id", productController.updateProduct.bind(productController));
router.delete("/:id", productController.deleteProduct.bind(productController));

export { router as productsRouter };
```

## 🔧 **Migration Best Practices**

### **1. Always Use CamelCase Fields**

```typescript
// ✅ Good
table.string("productName");
table.boolean("isActive");
table.timestamp("createdAt");

// ❌ Bad
table.string("product_name");
table.boolean("is_active");
table.timestamp("created_at");
```

### **2. Use Capitalized Table Names**

```typescript
// ✅ Good
knex.schema.createTable("Users", (table) => {
    // ...
});

// ❌ Bad
knex.schema.createTable("users", (table) => {
    // ...
});
```

### **3. Use Auto-Incrementing Integer IDs**

```typescript
// ✅ Good - PostgreSQL standard
table.increments("id").primary();

// ❌ Bad - UUIDs are more complex
table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
```

### **4. Add Automatic Timestamp Triggers**

```typescript
// ✅ Good - Automatically handles updatedAt
await createUpdateTrigger(knex, "TableName");

// ❌ Bad - Manual timestamp management
table.timestamp("updatedAt").defaultTo(knex.fn.now());
```

### **5. Add Proper Indexes**

```typescript
// Add indexes for frequently queried fields
table.index("name");
table.index("price");
table.index("userId");
table.index("isActive");
```

### **6. Use Foreign Keys**

```typescript
// Reference other tables
table.integer("userId").references("id").inTable("User").onDelete("CASCADE");
```

### **7. Set Default Values**

```typescript
table.boolean("isActive").defaultTo(true);
table.integer("stock").defaultTo(0);
table.timestamp("createdAt").defaultTo(knex.fn.now());
```

## 📝 **Common Migration Patterns**

### **Adding a Column**

```typescript
export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable("Products", (table) => {
        table.string("sku", 50).unique();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable("Products", (table) => {
        table.dropColumn("sku");
    });
}
```

### **Adding a Foreign Key**

```typescript
export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable("Products", (table) => {
        table.integer("categoryId").references("id").inTable("Categories");
    });
}
```

### **Creating a Junction Table**

```typescript
export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("ProductTags", (table) => {
        table.increments("id").primary();
        table
            .integer("productId")
            .references("id")
            .inTable("Products")
            .onDelete("CASCADE");
        table
            .integer("tagId")
            .references("id")
            .inTable("Tags")
            .onDelete("CASCADE");
        table.timestamp("createdAt").defaultTo(knex.fn.now());

        // Composite unique constraint
        table.unique(["productId", "tagId"]);
    });

    // Apply the trigger
    await createUpdateTrigger(knex, "ProductTags");
}
```

## 🧪 **Seeding Data**

### **Create Seed File**

```bash
yarn seed:make products_seed
```

### **Write Seed Data**

```typescript
// src/database/seeds/002_products_seed.ts
import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Get user IDs first
    const users = await knex("User").select("id");

    await knex("Products").insert([
        {
            name: "Sample Product 1",
            description: "This is a sample product",
            price: 29.99,
            stock: 100,
            isActive: true,
            userId: users[0].id,
        },
        {
            name: "Sample Product 2",
            description: "Another sample product",
            price: 49.99,
            stock: 50,
            isActive: true,
            userId: users[0].id,
        },
    ]);
}
```

## 🚨 **Troubleshooting**

### **Migration Fails**

```bash
# Check migration status
yarn migrate:status

# Rollback and retry
yarn migrate:rollback
yarn migrate
```

### **Connection Issues**

```bash
# Test connection
yarn db:test

# Check environment variables
echo $DATABASE_URL
```

### **TypeScript Errors**

```bash
# Rebuild types
yarn build

# Check for type errors
yarn tsc --noEmit
```

## 📚 **Useful Commands**

```bash
# Migration commands
yarn migrate              # Run all pending migrations
yarn migrate:make name    # Create new migration
yarn new-migrate name     # Your preferred pattern
yarn migrate:rollback     # Rollback last migration
yarn migrate:status       # Check migration status

# Seed commands
yarn seed                 # Run all seeds
yarn seed:make name       # Create new seed

# Database commands
yarn db:test              # Test database connection
yarn dev:local            # Start with database
```

---

This guide provides everything you need to add new tables and use Knex effectively in your application! 🎉
